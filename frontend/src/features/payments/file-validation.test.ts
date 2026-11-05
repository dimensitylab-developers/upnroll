import { describe, it, expect } from "vitest";
import { validateScreenshotMeta, MAX_SCREENSHOT_BYTES } from "./file-validation";

describe("validateScreenshotMeta", () => {
  it("accepts a valid PNG under the size limit", () => {
    expect(validateScreenshotMeta({ size: 1024, type: "image/png" })).toEqual({ valid: true });
  });

  it("rejects a missing file", () => {
    const result = validateScreenshotMeta(null);
    expect(result.valid).toBe(false);
  });

  it("rejects an empty (0-byte) file", () => {
    const result = validateScreenshotMeta({ size: 0, type: "image/png" });
    expect(result.valid).toBe(false);
  });

  it("rejects a file over the size limit", () => {
    const result = validateScreenshotMeta({ size: MAX_SCREENSHOT_BYTES + 1, type: "image/png" });
    expect(result.valid).toBe(false);
  });

  it("rejects a disallowed content type", () => {
    const result = validateScreenshotMeta({ size: 1024, type: "application/pdf" });
    expect(result.valid).toBe(false);
  });
});
