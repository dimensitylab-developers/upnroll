import { describe, expect, it } from "vitest";
import { matNumberForOrder, refundPercentForCancellation, warmUpMinutes } from "./tournamentRules";

describe("mat allocation", () => {
  it("spreads matches across the mats the admin set", () => {
    expect([0, 1, 2, 3, 4].map((order) => matNumberForOrder(order, 2))).toEqual([1, 2, 1, 2, 1]);
    expect(matNumberForOrder(9, 10)).toBe(10);
    expect(matNumberForOrder(10, 10)).toBe(1);
  });

  it("uses one mat when the count is missing", () => {
    expect(matNumberForOrder(4, 0)).toBe(1);
  });
});

describe("cancellation refund", () => {
  const start = new Date("2026-12-17T00:00:00.000Z");

  it("returns 50% a month or more before the event", () => {
    expect(refundPercentForCancellation(start, new Date("2026-11-17T00:00:00.000Z"))).toBe(50);
    expect(refundPercentForCancellation(start, new Date("2026-10-01T00:00:00.000Z"))).toBe(50);
  });

  it("returns nothing inside the month", () => {
    expect(refundPercentForCancellation(start, new Date("2026-11-18T00:00:00.000Z"))).toBe(0);
    expect(refundPercentForCancellation(start, new Date("2026-12-16T00:00:00.000Z"))).toBe(0);
  });
});

describe("warm-up window", () => {
  const start = new Date("2026-12-17T10:00:00.000Z");

  it("alerts inside 15 minutes", () => {
    expect(warmUpMinutes(start, new Date("2026-12-17T09:50:00.000Z"))).toBe(10);
    expect(warmUpMinutes(start, new Date("2026-12-17T09:44:00.000Z"))).toBe(null);
    expect(warmUpMinutes(start, new Date("2026-12-17T10:00:00.000Z"))).toBe(null);
  });
});
