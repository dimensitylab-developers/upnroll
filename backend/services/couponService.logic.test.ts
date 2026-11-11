import { describe, expect, it } from "vitest";
import { reservationStillValid } from "./couponService";
import {
  provisionalWinnerFromScores,
  isScoringRulesReady,
  emptyScoringRules,
  couponReservationMinutes,
} from "./tournamentRules";

describe("coupon reservationStillValid", () => {
  const now = new Date("2026-11-11T12:00:00.000Z");

  it("accepts a matching unexpired reservation", () => {
    expect(
      reservationStillValid(
        {
          status: "RESERVED",
          reservedByUserId: "user1" as never,
          reservationIntentId: "intent-abc",
          reservedUntil: new Date("2026-11-11T12:10:00.000Z") as never,
        },
        "user1",
        "intent-abc",
        now
      )
    ).toBe(true);
  });

  it("rejects expired reservations at validation time", () => {
    expect(
      reservationStillValid(
        {
          status: "RESERVED",
          reservedByUserId: "user1" as never,
          reservationIntentId: "intent-abc",
          reservedUntil: new Date("2026-11-11T11:59:00.000Z") as never,
        },
        "user1",
        "intent-abc",
        now
      )
    ).toBe(false);
  });

  it("rejects a late request from an old intent after reassignment", () => {
    expect(
      reservationStillValid(
        {
          status: "RESERVED",
          reservedByUserId: "user2" as never,
          reservationIntentId: "intent-other",
          reservedUntil: new Date("2026-11-11T12:10:00.000Z") as never,
        },
        "user1",
        "intent-abc",
        now
      )
    ).toBe(false);
  });
});

describe("scoring rules provisional winner", () => {
  it("does not invent a winner when rules are unconfigured", () => {
    const result = provisionalWinnerFromScores({
      rules: emptyScoringRules(),
      scoreA: 10,
      scoreB: 2,
      registrationAId: "a",
      registrationBId: "b",
    });
    expect(result.ready).toBe(false);
    expect(result.registrationId).toBeNull();
  });

  it("uses highest score only when explicitly enabled", () => {
    const rules = {
      configured: true,
      winByHighestScore: true,
      allowTies: false,
      points: [{ code: "Takedown", label: "Takedown", points: 2 }],
      penalties: [],
      outcomes: [{ code: "POINTS", label: "Points", requiresExplicitWinner: false }],
    };
    expect(isScoringRulesReady(rules)).toBe(true);
    const result = provisionalWinnerFromScores({
      rules,
      scoreA: 4,
      scoreB: 2,
      registrationAId: "a",
      registrationBId: "b",
    });
    expect(result).toEqual({ registrationId: "a", method: "POINTS", ready: true });
  });

  it("refuses silent score-based win when winByHighestScore is false", () => {
    const rules = {
      configured: true,
      winByHighestScore: false,
      allowTies: false,
      points: [{ code: "Takedown", label: "Takedown", points: 2 }],
      penalties: [],
      outcomes: [{ code: "SUBMISSION", label: "Submission", requiresExplicitWinner: true }],
    };
    const result = provisionalWinnerFromScores({
      rules,
      scoreA: 99,
      scoreB: 0,
      registrationAId: "a",
      registrationBId: "b",
    });
    expect(result.ready).toBe(false);
  });
});

describe("coupon reservation minutes", () => {
  it("returns a positive bounded default", () => {
    expect(couponReservationMinutes()).toBeGreaterThanOrEqual(1);
    expect(couponReservationMinutes()).toBeLessThanOrEqual(120);
  });
});
