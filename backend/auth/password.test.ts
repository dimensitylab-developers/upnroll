import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-1");
    expect(await verifyPassword("correct-horse-battery-1", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-1");
    expect(await verifyPassword("wrong-password-1", hash)).toBe(false);
  });

  it("produces different hashes for the same password (random salt)", async () => {
    const a = await hashPassword("same-password-1");
    const b = await hashPassword("same-password-1");
    expect(a).not.toEqual(b);
  });

  it("rejects malformed stored values", async () => {
    expect(await verifyPassword("anything", "not-a-valid-hash")).toBe(false);
  });
});
