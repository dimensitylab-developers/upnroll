import { describe, it, expect } from "vitest";
import { validateScreenshotMeta, MAX_SCREENSHOT_BYTES } from "./file-validation";

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

describe("validateScreenshotMeta", () => {
  it("accepts PNG bytes that match the declared type", () => {
    expect(validateScreenshotMeta({ size: png.length, type: "image/png", buffer: png })).toEqual({
      valid: true,
      contentType: "image/png",
    });
  });

  it("rejects a missing file", () => {
    expect(validateScreenshotMeta(null).valid).toBe(false);
  });

  it("rejects an empty file", () => {
    expect(validateScreenshotMeta({ size: 0, type: "image/png", buffer: png }).valid).toBe(false);
  });

  it("rejects a file over 3MB", () => {
    expect(validateScreenshotMeta({ size: MAX_SCREENSHOT_BYTES + 1, type: "image/png", buffer: png }).valid).toBe(false);
  });

  it("rejects bytes that are not an image", () => {
    const text = Buffer.from("not-an-image");
    expect(validateScreenshotMeta({ size: text.length, type: "image/png", buffer: text }).valid).toBe(false);
  });

  it("rejects a MIME type that does not match the bytes", () => {
    expect(validateScreenshotMeta({ size: jpeg.length, type: "image/png", buffer: jpeg }).valid).toBe(false);
  });

  it("rejects a file with no bytes", () => {
    expect(validateScreenshotMeta({ size: 1024, type: "image/png" }).valid).toBe(false);
  });
});
