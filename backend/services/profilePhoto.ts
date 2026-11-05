import { getStorageAdapter } from "@/server/storage/local-disk";

const MAX_BYTES = 1_500_000;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function readProfilePhoto(
  file: FormDataEntryValue | null
): Promise<{ error: string } | { empty: true } | { bytes: Buffer; ext: string }> {
  if (!(file instanceof File) || file.size === 0) return { empty: true };
  const ext = EXTENSIONS[file.type];
  if (!ext) return { error: "Use a JPG, PNG, or WebP photograph." };
  if (file.size > MAX_BYTES) return { error: "Photograph must be under 1.5 MB." };
  return { bytes: Buffer.from(await file.arrayBuffer()), ext };
}

export async function saveProfilePhoto(userId: string, bytes: Buffer, ext: string, previousKey = ""): Promise<string> {
  const key = `profiles/${userId}${ext}`;
  const storage = getStorageAdapter();
  if (previousKey && previousKey !== key) await storage.delete(previousKey);
  await storage.put(key, bytes, CONTENT_TYPES[ext] ?? "image/jpeg");
  return key;
}
