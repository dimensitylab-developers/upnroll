import { describe, it, expect, vi, afterEach } from "vitest";
import { checkRateLimit } from "./rateLimit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first several attempts for a fresh key", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(key).allowed).toBe(true);
    }
  });

  it("blocks after the bucket is exhausted", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 10; i++) checkRateLimit(key);
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks independent keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    for (let i = 0; i < 10; i++) checkRateLimit(keyA);
    expect(checkRateLimit(keyA).allowed).toBe(false);
    expect(checkRateLimit(keyB).allowed).toBe(true);
  });

  it("refills tokens over time", () => {
    vi.useFakeTimers();
    const key = `refill-${Math.random()}`;
    for (let i = 0; i < 10; i++) checkRateLimit(key);
    expect(checkRateLimit(key).allowed).toBe(false);

    vi.advanceTimersByTime(61_000); // past the full refill window
    expect(checkRateLimit(key).allowed).toBe(true);
  });
});
