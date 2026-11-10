import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile, unlink, stat } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter, StorageOpenResult, StoragePutOptions } from "./types";
import { isGridFsKey } from "./keys";
import { NotFoundError, ValidationError } from "@/server/http/errors";

/**
 * Dev-only StorageAdapter: writes to a gitignored local folder.
 * Keys are resolved inside ROOT before any filesystem call.
 */
const ROOT = path.join(
  process.cwd().endsWith(`${path.sep}frontend`) ? path.resolve(process.cwd(), "..") : process.cwd(),
  ".local-storage"
);

const EXT_TO_CONTENT_TYPE: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export function resolveStoragePath(key: string): string {
  if (!key || key.includes("\0") || isGridFsKey(key)) {
    throw new ValidationError("Invalid storage key.");
  }
  // Normalize Windows separators so "..\\secrets" cannot bypass the root check on POSIX.
  const normalized = key.replace(/\\/g, "/");
  if (
    path.isAbsolute(key) ||
    path.isAbsolute(normalized) ||
    normalized.startsWith("/") ||
    normalized.split("/").some((part) => part === "..")
  ) {
    throw new ValidationError("Invalid storage key.");
  }
  const resolved = path.resolve(ROOT, normalized);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (resolved !== ROOT && !resolved.startsWith(rootWithSep)) {
    throw new ValidationError("Invalid storage key.");
  }
  return resolved;
}

export class LocalDiskStorageAdapter implements StorageAdapter {
  async put(key: string, data: Buffer, _contentType?: string, _options?: StoragePutOptions): Promise<string> {
    const filePath = resolveStoragePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return key;
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string }> {
    const filePath = resolveStoragePath(key);
    let data: Buffer;
    try {
      data = await readFile(filePath);
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? (err as NodeJS.ErrnoException).code : undefined;
      if (code === "ENOENT") throw new NotFoundError("Stored file not found.");
      throw err;
    }
    const ext = path.extname(key).toLowerCase();
    return { data, contentType: EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream" };
  }

  async open(key: string): Promise<StorageOpenResult> {
    const filePath = resolveStoragePath(key);
    let length: number;
    try {
      length = (await stat(filePath)).size;
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? (err as NodeJS.ErrnoException).code : undefined;
      if (code === "ENOENT") throw new NotFoundError("Stored file not found.");
      throw err;
    }
    const ext = path.extname(key).toLowerCase();
    return {
      stream: createReadStream(filePath),
      contentType: EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream",
      length,
    };
  }

  async getSignedUrl(key: string): Promise<string> {
    resolveStoragePath(key);
    return `local-storage://${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = resolveStoragePath(key);
    await unlink(filePath).catch(() => undefined);
  }
}
