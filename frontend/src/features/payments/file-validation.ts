export const MAX_SCREENSHOT_BYTES = 3 * 1024 * 1024;
export const ALLOWED_SCREENSHOT_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type ImageContentType = (typeof ALLOWED_SCREENSHOT_TYPES)[number];
export type FileValidationResult = { valid: true; contentType: ImageContentType } | { valid: false; message: string };

type ScreenshotInput = { size: number; type: string; buffer?: Buffer; bytes?: Buffer } | null | undefined;

/** Detect an image from its leading bytes. Client MIME and filenames are not trusted. */
export function detectImageType(bytes: Buffer): ImageContentType | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

function declaredType(type: string): ImageContentType | null {
  if (type === "image/jpg" || type === "image/jpeg") return "image/jpeg";
  if (type === "image/png" || type === "image/webp") return type;
  return null;
}

/** Pure validation. Requires the file bytes so a renamed non-image cannot pass on MIME alone. */
export function validateScreenshotMeta(input: ScreenshotInput): FileValidationResult {
  if (!input || input.size === 0) {
    return { valid: false, message: "Upload a payment screenshot." };
  }
  const bytes = input.buffer ?? input.bytes;
  if (!bytes || bytes.length === 0) {
    return { valid: false, message: "Upload a payment screenshot." };
  }
  if (input.size > MAX_SCREENSHOT_BYTES || bytes.length > MAX_SCREENSHOT_BYTES) {
    return { valid: false, message: "Screenshot must be 3MB or smaller." };
  }
  const detected = detectImageType(bytes);
  const claimed = declaredType(input.type);
  if (!detected || !claimed || detected !== claimed) {
    return { valid: false, message: "Screenshot must be a PNG, JPEG, or WEBP image." };
  }
  return { valid: true, contentType: detected };
}
