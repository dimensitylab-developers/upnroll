import "server-only";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types";
import { ValidationError } from "@/server/http/errors";

/**
 * Dev-only StorageAdapter: writes to a gitignored local folder.
 * Keys are resolved inside ROOT before any filesystem call.
 * A real private-storage provider is Phase 3 work, pending OD-012.
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
  if (!key || key.includes("\0") || path.isAbsolute(key)) {
    throw new ValidationError("Invalid storage key.");
  }
  const resolved = path.resolve(ROOT, key);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (resolved !== ROOT && !resolved.startsWith(rootWithSep)) {
    throw new ValidationError("Invalid storage key.");
  }
  return resolved;
}

export class LocalDiskStorageAdapter implements StorageAdapter {
  async put(key: string, data: Buffer, _contentType?: string): Promise<string> {
    const filePath = resolveStoragePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return key;
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string }> {
    const filePath = resolveStoragePath(key);
    const data = await readFile(filePath);
    const ext = path.extname(key).toLowerCase();
    return { data, contentType: EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream" };
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

export function getStorageAdapter(): StorageAdapter {
  return new LocalDiskStorageAdapter();
}
