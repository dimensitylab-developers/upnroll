import { ObjectId } from "mongodb";
import { ValidationError } from "@/server/http/errors";

const GRIDFS_PREFIX = "gridfs:";

export function isGridFsKey(key: string): boolean {
  return key.startsWith(GRIDFS_PREFIX);
}

export function formatGridFsKey(id: ObjectId): string {
  return `${GRIDFS_PREFIX}${id.toHexString()}`;
}

export function parseGridFsKey(key: string): ObjectId {
  if (!isGridFsKey(key)) {
    throw new ValidationError("Invalid GridFS storage key.");
  }
  const hex = key.slice(GRIDFS_PREFIX.length);
  if (!/^[a-f0-9]{24}$/i.test(hex)) {
    throw new ValidationError("Invalid GridFS storage key.");
  }
  return new ObjectId(hex);
}
