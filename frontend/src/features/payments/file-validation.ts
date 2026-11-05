export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_SCREENSHOT_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type FileValidationResult = { valid: true } | { valid: false; message: string };

/** Pure validation logic, separated from the File/Blob check so it's unit-testable without a DOM/File global. */
export function validateScreenshotMeta(input: { size: number; type: string } | null | undefined): FileValidationResult {
  if (!input || input.size === 0) {
    return { valid: false, message: "Upload a payment screenshot." };
  }
  if (input.size > MAX_SCREENSHOT_BYTES) {
    return { valid: false, message: "Screenshot must be 5MB or smaller." };
  }
  if (!ALLOWED_SCREENSHOT_TYPES.includes(input.type as (typeof ALLOWED_SCREENSHOT_TYPES)[number])) {
    return { valid: false, message: "Screenshot must be a PNG, JPEG, or WEBP image." };
  }
  return { valid: true };
}
