import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "./schemas";

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      displayName: "Rhea Kolhapure",
      email: "Rhea@Example.com",
      password: "correct-horse-1",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("rhea@example.com");
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      displayName: "Rhea",
      email: "rhea@example.com",
      password: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({
      displayName: "Rhea",
      email: "rhea@example.com",
      password: "allletters",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      displayName: "Rhea",
      email: "not-an-email",
      password: "correct-horse-1",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials shape", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
