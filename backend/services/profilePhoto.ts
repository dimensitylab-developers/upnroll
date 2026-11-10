import "server-only";
import { getStorageAdapter } from "@/server/storage/factory";
import { detectImageType, type ImageContentType } from "@/features/payments/file-validation";
import { assertFighter, type Actor } from "@/server/auth/actor";

const MAX_BYTES = 1_500_000;
const EXTENSIONS: Record<ImageContentType, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function readProfilePhoto(
  file: FormDataEntryValue | null
): Promise<{ error: string } | { empty: true } | { bytes: Buffer; ext: string }> {
  if (!(file instanceof File) || file.size === 0) return { empty: true };
  if (file.size > MAX_BYTES) return { error: "Photograph must be under 1.5 MB." };
  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected) return { error: "Use a JPG, PNG, or WebP photograph." };
  const claimed = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (claimed && claimed !== detected) return { error: "Use a JPG, PNG, or WebP photograph." };
  return { bytes, ext: EXTENSIONS[detected] };
}

export async function saveProfilePhoto(actor: Actor, bytes: Buffer, ext: string, previousKey = ""): Promise<string> {
  assertFighter(actor);
  const key = `profiles/${actor.userId}${ext}`;
  const storage = getStorageAdapter();
  if (previousKey && previousKey !== key) await storage.delete(previousKey);
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  await storage.put(key, bytes, contentType, {
    metadata: { purpose: "profile-photo", ownerUserId: actor.userId },
  });
  return key;
}
