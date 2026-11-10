import { describe, it, expect } from "vitest";
import { utrSchema, submitPaymentSchema } from "./schemas";

describe("utrSchema", () => {
  it("accepts a plausible alphanumeric reference", () => {
    expect(utrSchema.safeParse("409872165310").success).toBe(true);
  });
  it("rejects a too-short reference", () => {
    expect(utrSchema.safeParse("abc").success).toBe(false);
  });
  it("rejects a reference with special characters", () => {
    expect(utrSchema.safeParse("ABC-123-XYZ").success).toBe(false);
  });
});

describe("submitPaymentSchema", () => {
  it("accepts a valid submission shape", () => {
    expect(
      submitPaymentSchema.safeParse({
        registrationId: "507f1f77bcf86cd799439011",
        utr: "409872165310",
      }).success
    ).toBe(true);
  });
  it("rejects a missing registrationId", () => {
    expect(submitPaymentSchema.safeParse({ registrationId: "", utr: "409872165310" }).success).toBe(false);
  });
  it("rejects a non-ObjectId registrationId", () => {
    expect(submitPaymentSchema.safeParse({ registrationId: "abc123", utr: "409872165310" }).success).toBe(false);
  });
});
