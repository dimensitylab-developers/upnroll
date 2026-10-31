import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
  process.env.SESSION_SECRET = "a".repeat(32);
});

describe("session cookie signing", () => {
  it("round-trips a token through pack/unpack", async () => {
    const { packCookieValue, unpackCookieValue } = await import("./cookies");
    const packed = packCookieValue("raw-token-value");
    expect(unpackCookieValue(packed)).toBe("raw-token-value");
  });

  it("rejects a tampered cookie value", async () => {
    const { packCookieValue, unpackCookieValue } = await import("./cookies");
    const packed = packCookieValue("raw-token-value");
    const tampered = packed.replace("raw-token-value", "attacker-token-value");
    expect(unpackCookieValue(tampered)).toBeNull();
  });

  it("rejects malformed cookie values", async () => {
    const { unpackCookieValue } = await import("./cookies");
    expect(unpackCookieValue("no-dot-here")).toBeNull();
    expect(unpackCookieValue(undefined)).toBeNull();
    expect(unpackCookieValue(null)).toBeNull();
  });
});
