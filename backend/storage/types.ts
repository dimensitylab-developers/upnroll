/**
 * Storage abstraction (Part F/L). The real provider (S3-compatible object
 * storage, etc.) is pending client/infra approval — see docs/decisions/open-decisions.md (OD-012).
 * Payment screenshots and other private uploads go through this interface
 * so swapping the real provider in later never touches calling code.
 */
export interface StorageAdapter {
  /** Stores a file privately and returns an internal storage key (not a public URL). */
  put(key: string, data: Buffer, contentType: string): Promise<string>;
  /** Returns a short-lived, authorized URL for reading a private file. */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  /** Reads a file's bytes back. Used by authorized Route Handlers that stream private files (e.g. admin payment screenshot review). */
  get(key: string): Promise<{ data: Buffer; contentType: string }>;
  delete(key: string): Promise<void>;
}
