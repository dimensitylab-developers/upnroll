import "server-only";
import type { StorageAdapter } from "./types";
import { LocalDiskStorageAdapter } from "./local-disk";
import { GridFSStorageAdapter } from "./gridfs";

/**
 * Selects the private-file adapter.
 * Development and test default to local disk.
 * Production requires STORAGE_DRIVER=gridfs or STORAGE_DRIVER=local (no silent default).
 */
export function getStorageAdapter(): StorageAdapter {
  const driver = (process.env.STORAGE_DRIVER ?? "").trim().toLowerCase();
  const nodeEnv = process.env.NODE_ENV;

  if (nodeEnv === "production") {
    if (driver === "gridfs") return new GridFSStorageAdapter();
    if (driver === "local") return new LocalDiskStorageAdapter();
    throw new Error(
      'STORAGE_DRIVER must be set to "gridfs" or "local" when NODE_ENV=production.'
    );
  }

  if (driver === "gridfs") return new GridFSStorageAdapter();
  return new LocalDiskStorageAdapter();
}
