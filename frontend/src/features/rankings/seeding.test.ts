import { describe, it, expect } from "vitest";
import { applyResult, bracketOf, scoreBoard, seedRoster } from "./seeding";
import { decideMatch, openingFlow } from "./bracket-flow";

const REQUIRED = ["James Lewis", "Suraj Phirke", "Suketu Bhuva", "Deep Godani"];

describe("seeding demo", () => {
  it("scores the demo roster out of 100 and keeps the required names", () => {
    const board = scoreBoard(seedRoster());
    expect(board.map((athlete) => athlete.name)).toEqual(expect.arrayContaining(REQUIRED));
    expect(board.map((athlete) => athlete.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const athlete of board) {
      expect(athlete.score).toBeGreaterThanOrEqual(0);
      expect(athlete.score).toBeLessThanOrEqual(100);
      expect(athlete.reasons.reduce((sum, reason) => sum + reason.points, 0)).toBe(athlete.score);
    }
  });

  it("places seed 1 opposite seed 2, and seed 3 opposite seed 4", () => {
    const bracket = bracketOf(scoreBoard(seedRoster()));
    expect(bracket).not.toBeNull();
    const halfA = bracket!.halfA.flatMap((pair) => [pair.a.rank, pair.b.rank]);
    const halfB = bracket!.halfB.flatMap((pair) => [pair.a.rank, pair.b.rank]);
    expect(halfA).toContain(1);
    expect(halfB).toContain(2);
    const quarterOf = (rank: number) =>
      [...bracket!.halfA, ...bracket!.halfB].find((pair) => pair.a.rank === rank || pair.b.rank === rank);
    expect(quarterOf(3)).not.toBe(quarterOf(4));
  });

  it("slides the winner forward and drops the loser onto the out line", () => {
    const board = scoreBoard(seedRoster());
    const flow = openingFlow(board);
    const opening = flow.forward[0]!;
    const moved = decideMatch(flow, opening.id, opening.top!.id);
    expect(moved.forward.find((match) => match.id === "s0")?.top?.id).toBe(opening.top!.id);
    expect(moved.out.find((match) => match.id === "o0")?.top?.id).toBe(opening.bottom!.id);
    const seed1 = board.find((athlete) => athlete.rank === 1)!;
    const seed2 = board.find((athlete) => athlete.rank === 2)!;
    expect(flow.forward[0]?.top?.id).toBe(seed1.id);
    expect(flow.forward[2]?.top?.id).toBe(seed2.id);
  });

  it("moves the winner up when a judge records a finish", () => {
    const before = scoreBoard(seedRoster());
    const deep = before.find((athlete) => athlete.name === "Deep Godani")!;
    const leader = before[0]!;
    const after = scoreBoard(applyResult(seedRoster(), deep.id, leader.id, deep.id, "submission"));
    const deepAfter = after.find((athlete) => athlete.id === deep.id)!;
    expect(deepAfter.wins).toBe(deep.wins + 1);
    expect(deepAfter.score).toBeGreaterThan(deep.score);
  });
});
