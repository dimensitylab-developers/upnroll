/**
 * Storage abstraction for private payment screenshots and profile photos.
 * Production uses GridFS when STORAGE_DRIVER=gridfs; development defaults to local disk.
 */
import type { Readable } from "node:stream";

export type StoragePutMetadata = {
  purpose?: "payment-screenshot" | "profile-photo" | "payment-qr";
  ownerUserId?: string;
  registrationId?: string;
  eventId?: string;
  sha256?: string;
};

export type StoragePutOptions = {
  metadata?: StoragePutMetadata;
};

export type StorageOpenResult = {
  stream: Readable;
  contentType: string;
  length: number;
};

export interface StorageAdapter {
  /** Stores a file privately and returns the storage key to persist on the business document. */
  put(key: string, data: Buffer, contentType: string, options?: StoragePutOptions): Promise<string>;
  /** Returns a non-HTTP marker for the key. Not a public URL. */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  /** Reads a file's bytes (capped). Prefer `open` for route delivery. */
  get(key: string): Promise<{ data: Buffer; contentType: string }>;
  /** Opens a readable stream without buffering the whole file. */
  open(key: string): Promise<StorageOpenResult>;
  delete(key: string): Promise<void>;
}
