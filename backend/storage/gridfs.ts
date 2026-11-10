import "server-only";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { GridFSBucket, type GridFSBucketWriteStream } from "mongodb";
import mongoose from "mongoose";
import { connectDB } from "@/server/db/connect";
import { NotFoundError, ValidationError } from "@/server/http/errors";
import { formatGridFsKey, isGridFsKey, parseGridFsKey } from "./keys";
import type { StorageAdapter, StorageOpenResult, StoragePutOptions } from "./types";

const BUCKET_NAME = "privateFiles";
const GET_MAX_BYTES = 3 * 1024 * 1024;

let bucket: GridFSBucket | null = null;

async function getBucket(): Promise<GridFSBucket> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection is not ready for GridFS.");
  }
  if (!bucket) {
    bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
  }
  return bucket;
}

/** Test-only: clear the cached bucket after disconnect. */
export function resetGridFsBucketForTests(): void {
  bucket = null;
}

async function cleanupFailedUpload(
  activeBucket: GridFSBucket,
  uploadStream: GridFSBucketWriteStream
): Promise<void> {
  try {
    await uploadStream.abort();
  } catch {
    try {
      await activeBucket.delete(uploadStream.id);
    } catch {
      // Orphan reporting covers leftovers if both abort and delete fail.
    }
  }
}

export class GridFSStorageAdapter implements StorageAdapter {
  async put(
    key: string,
    data: Buffer,
    contentType: string,
    options?: StoragePutOptions
  ): Promise<string> {
    if (isGridFsKey(key)) {
      throw new ValidationError("GridFS put expects a filename label, not a gridfs: key.");
    }
    const activeBucket = await getBucket();
    const uploadStream = activeBucket.openUploadStream(key, {
      metadata: {
        ...options?.metadata,
        contentType,
      },
    });

    try {
      await pipeline(Readable.from(data), uploadStream);
      return formatGridFsKey(uploadStream.id);
    } catch (err) {
      await cleanupFailedUpload(activeBucket, uploadStream);
      throw err;
    }
  }

  async open(key: string): Promise<StorageOpenResult> {
    const id = parseGridFsKey(key);
    const activeBucket = await getBucket();
    const files = await activeBucket.find({ _id: id }).limit(1).toArray();
    const file = files[0];
    if (!file) {
      throw new NotFoundError("Stored file not found.");
    }
    const contentType =
      typeof file.metadata?.contentType === "string"
        ? file.metadata.contentType
        : "application/octet-stream";
    return {
      stream: activeBucket.openDownloadStream(id),
      contentType,
      length: file.length,
    };
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string }> {
    const { stream, contentType, length } = await this.open(key);
    if (length > GET_MAX_BYTES) {
      stream.destroy();
      throw new ValidationError("Stored file exceeds the read limit.");
    }
    const chunks: Buffer[] = [];
    let total = 0;
    try {
      for await (const chunk of stream) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buf.length;
        if (total > GET_MAX_BYTES) {
          stream.destroy();
          throw new ValidationError("Stored file exceeds the read limit.");
        }
        chunks.push(buf);
      }
    } catch (err) {
      stream.destroy();
      throw err;
    }
    return { data: Buffer.concat(chunks), contentType };
  }

  async getSignedUrl(key: string): Promise<string> {
    const id = parseGridFsKey(key);
    return `gridfs://${id.toHexString()}`;
  }

  async delete(key: string): Promise<void> {
    const id = parseGridFsKey(key);
    const activeBucket = await getBucket();
    try {
      await activeBucket.delete(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // Driver throws when the file document is missing; match local-disk quiet delete.
      if (/FileNotFound|not found|No file/i.test(message)) return;
      throw err;
    }
  }
}
