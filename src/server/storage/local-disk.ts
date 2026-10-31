import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types";

/**
 * Dev-only StorageAdapter: writes to a gitignored local folder.
 * Not for production use — no actual access control or signed URLs.
 * A real private-storage provider (and the route/service that serves
 * authorized reads from it) is Phase 3 work, pending OD-012.
 */
const ROOT = path.join(process.cwd(), ".local-storage");

export class LocalDiskStorageAdapter implements StorageAdapter {
  async put(key: string, data: Buffer): Promise<string> {
    const filePath = path.join(ROOT, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return key;
  }

  async getSignedUrl(key: string): Promise<string> {
    // Dev stub only: no serving route exists yet. Real implementation
    // arrives with Phase 3's private payment-screenshot access flow.
    return `local-storage://${key}`;
  }

  async delete(key: string): Promise<void> {
    await unlink(path.join(ROOT, key)).catch(() => undefined);
  }
}

export function getStorageAdapter(): StorageAdapter {
  return new LocalDiskStorageAdapter();
}
