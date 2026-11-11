import { describe, expect, it } from "vitest";
import { reservationStillValid } from "./couponService";

/**
 * Concurrency / lifecycle semantics for coupons.
 * These assert the rules used by reserve/redeem without mocking Mongoose models
 * (avoids cross-file mock pollution in the shared Vitest worker).
 */

describe("coupon reservation races (lifecycle rules)", () => {
  const now = new Date("2026-11-11T12:00:00.000Z");

  it("only the holder of the current reservation intent may redeem", () => {
    const heldByA = {
      status: "RESERVED" as const,
      reservedByUserId: "userA" as never,
      reservationIntentId: "intent-aaaa-aaaa",
      reservedUntil: new Date("2026-11-11T12:10:00.000Z") as never,
    };

    expect(reservationStillValid(heldByA, "userA", "intent-aaaa-aaaa", now)).toBe(true);
    expect(reservationStillValid(heldByA, "userB", "intent-bbbb-bbbb", now)).toBe(false);
    expect(reservationStillValid(heldByA, "userA", "intent-stale-old", now)).toBe(false);
  });

  it("rejects redeem after reservation expiry even before cleanup runs", () => {
    const expired = {
      status: "RESERVED" as const,
      reservedByUserId: "userA" as never,
      reservationIntentId: "intent-aaaa-aaaa",
      reservedUntil: new Date("2026-11-11T11:59:00.000Z") as never,
    };
    expect(reservationStillValid(expired, "userA", "intent-aaaa-aaaa", now)).toBe(false);
  });

  it("rejects a late request after the code was reassigned to someone else", () => {
    const reassigned = {
      status: "RESERVED" as const,
      reservedByUserId: "userB" as never,
      reservationIntentId: "intent-bbbb-bbbb",
      reservedUntil: new Date("2026-11-11T12:10:00.000Z") as never,
    };
    expect(reservationStillValid(reassigned, "userA", "intent-aaaa-aaaa", now)).toBe(false);
  });
});
