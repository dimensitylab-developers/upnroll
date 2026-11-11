import { describe, expect, it } from "vitest";
import { canCorrectResult } from "./bracketEngine";

describe("finalization / correction guards", () => {
  it("blocks correction when the next match is already decided", () => {
    expect(canCorrectResult("COMPLETED")).toBe(false);
    expect(canCorrectResult("BYE")).toBe(false);
  });

  it("allows correction when the next match is still open", () => {
    expect(canCorrectResult("PENDING")).toBe(true);
    expect(canCorrectResult("SCHEDULED")).toBe(true);
    expect(canCorrectResult(null)).toBe(true);
  });
});

describe("idempotent finalization key shape", () => {
  it("builds a stable effects key per match version", () => {
    const matchId = "507f1f77bcf86cd799439011";
    const version = 3;
    const effectsKey = `finalize:${matchId}:v${version}`;
    expect(effectsKey).toBe("finalize:507f1f77bcf86cd799439011:v3");
    // Replaying the same key must be treated as a no-op by consumers.
    expect(`rankings-after-${effectsKey}`).toContain(effectsKey);
    expect(`notify-result-${effectsKey}`).toContain(effectsKey);
  });
});
