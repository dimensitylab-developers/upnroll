import { describe, it, expect } from "vitest";
import { computeRecord, winLossPointsStrategy } from "./rankingEngine";

describe("computeRecord", () => {
  it("counts wins and losses only from decided matches the fighter competed in", () => {
    const matches = [
      { winnerUserId: "u1", competitorUserIds: ["u1", "u2"] },
      { winnerUserId: "u2", competitorUserIds: ["u1", "u2"] },
      { winnerUserId: "u1", competitorUserIds: ["u1", "u3"] },
      { winnerUserId: "u3", competitorUserIds: ["u4", "u3"] }, // fighter not involved
    ];
    expect(computeRecord("u1", matches)).toEqual({ wins: 2, losses: 1 });
  });

  it("ignores matches with no winner yet (not decided)", () => {
    const matches = [{ winnerUserId: null, competitorUserIds: ["u1", "u2"] }];
    expect(computeRecord("u1", matches)).toEqual({ wins: 0, losses: 0 });
  });

  it("returns zeros for a fighter with no matches", () => {
    expect(computeRecord("u-nobody", [])).toEqual({ wins: 0, losses: 0 });
  });
});

describe("winLossPointsStrategy (placeholder, pending OD-004)", () => {
  it("awards 3 points per win and nothing for losses", () => {
    expect(winLossPointsStrategy({ wins: 4, losses: 10 })).toBe(12);
  });
  it("returns zero for an undefeated-but-winless record", () => {
    expect(winLossPointsStrategy({ wins: 0, losses: 0 })).toBe(0);
  });
});
