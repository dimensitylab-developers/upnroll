import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types";

/**
 * Dev-only StorageAdapter: writes to a gitignored local folder.
 * Not for production use — no actual access control or signed URLs.
 * A real private-storage provider (and the route/service that serves
 * authorized reads from it) is Phase 3 work, pending OD-012.
 */
// Next runs from frontend/, so keep files at the repository root where they already live.
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

export class LocalDiskStorageAdapter implements StorageAdapter {
  async put(key: string, data: Buffer): Promise<string> {
    const filePath = path.join(ROOT, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return key;
  }

  async get(key: string): Promise<{ data: Buffer; contentType: string }> {
    const { readFile } = await import("node:fs/promises");
    const filePath = path.join(ROOT, key);
    const data = await readFile(filePath);
    const ext = path.extname(key).toLowerCase();
    return { data, contentType: EXT_TO_CONTENT_TYPE[ext] ?? "application/octet-stream" };
  }

  async getSignedUrl(key: string): Promise<string> {
    // Dev stub only: the real serving path is the authorized admin Route
    // Handler (src/app/api/v1/admin/payments/[id]/screenshot/route.ts),
    // which calls get() directly rather than redirecting to a signed URL.
    // A real provider would return an actual time-limited URL here.
    return `local-storage://${key}`;
  }

  async delete(key: string): Promise<void> {
    await unlink(path.join(ROOT, key)).catch(() => undefined);
  }
}

export function getStorageAdapter(): StorageAdapter {
  return new LocalDiskStorageAdapter();
}
