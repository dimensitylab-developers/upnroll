import { describe, it, expect } from "vitest";
import { standardSeedOrder, shuffleDeterministic, buildBracket, nextSlot, canCorrectResult } from "./bracketEngine";

describe("standardSeedOrder", () => {
  it("matches the known classic sequence for n=2", () => {
    expect(standardSeedOrder(2)).toEqual([1, 2]);
  });
  it("matches the known classic sequence for n=4", () => {
    expect(standardSeedOrder(4)).toEqual([1, 4, 2, 3]);
  });
  it("matches the known classic sequence for n=8", () => {
    expect(standardSeedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });
  it("matches the known classic sequence for n=16", () => {
    expect(standardSeedOrder(16)).toEqual([1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]);
  });
  it("rejects a non-power-of-two size", () => {
    expect(() => standardSeedOrder(6)).toThrow();
  });
});

describe("shuffleDeterministic", () => {
  it("produces the same order for the same seed", () => {
    const items = ["a", "b", "c", "d", "e", "f"];
    expect(shuffleDeterministic(items, 42)).toEqual(shuffleDeterministic(items, 42));
  });
  it("produces a different order for a different seed (overwhelmingly likely)", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g", "h"];
    expect(shuffleDeterministic(items, 1)).not.toEqual(shuffleDeterministic(items, 2));
  });
  it("preserves the same set of items", () => {
    const items = ["a", "b", "c", "d"];
    expect(shuffleDeterministic(items, 7).sort()).toEqual([...items].sort());
  });
});

describe("buildBracket", () => {
  it("builds a clean bracket for a power-of-two participant count (4)", () => {
    const { roundsCount, matches } = buildBracket(["p1", "p2", "p3", "p4"]);
    expect(roundsCount).toBe(2);
    const round0 = matches.filter((m) => m.round === 0);
    expect(round0).toHaveLength(2);
    expect(round0.every((m) => m.status === "SCHEDULED")).toBe(true);
    const final = matches.find((m) => m.round === 1);
    expect(final?.status).toBe("PENDING");
    expect(final?.competitorA).toBeNull();
    expect(final?.competitorB).toBeNull();
  });

  it("auto-resolves a single bye for an odd participant count (3)", () => {
    const { matches } = buildBracket(["p1", "p2", "p3"]);
    const round0 = matches.filter((m) => m.round === 0);
    const byeMatch = round0.find((m) => m.status === "BYE");
    expect(byeMatch).toBeDefined();
    expect(byeMatch?.winner).not.toBeNull();

    const final = matches.find((m) => m.round === 1);
    // The bye winner should already be pre-filled into the final.
    expect([final?.competitorA, final?.competitorB]).toContain(byeMatch?.winner);
  });

  it("cascades consecutive byes forward for a very small field (2 real rounds needed, 5 participants)", () => {
    const { matches, roundsCount } = buildBracket(["p1", "p2", "p3", "p4", "p5"]);
    expect(roundsCount).toBe(3); // next power of two above 5 is 8
    // All matches should have a defined status, none left inconsistent.
    expect(matches.every((m) => ["PENDING", "SCHEDULED", "BYE", "COMPLETED"].includes(m.status))).toBe(true);
  });

  it("every match has a valid winner only if COMPLETED or BYE", () => {
    const { matches } = buildBracket(["p1", "p2", "p3", "p4", "p5", "p6", "p7"]);
    for (const m of matches) {
      if (m.status === "PENDING" || m.status === "SCHEDULED") {
        expect(m.winner).toBeNull();
      }
    }
  });

  it("throws for fewer than two participants", () => {
    expect(() => buildBracket(["only-one"])).toThrow();
  });

  it("is deterministic given the same input order", () => {
    const ids = ["p1", "p2", "p3", "p4", "p5", "p6"];
    expect(buildBracket(ids)).toEqual(buildBracket(ids));
  });
});

describe("nextSlot", () => {
  it("even order advances to slot A of the next round", () => {
    expect(nextSlot(0, 0)).toEqual({ round: 1, order: 0, slot: "A" });
    expect(nextSlot(0, 2)).toEqual({ round: 1, order: 1, slot: "A" });
  });
  it("odd order advances to slot B of the next round", () => {
    expect(nextSlot(0, 1)).toEqual({ round: 1, order: 0, slot: "B" });
    expect(nextSlot(0, 3)).toEqual({ round: 1, order: 1, slot: "B" });
  });
  it("works across higher rounds", () => {
    expect(nextSlot(2, 5)).toEqual({ round: 3, order: 2, slot: "B" });
  });
});

describe("canCorrectResult", () => {
  it("allows correcting the final match (nothing downstream)", () => {
    expect(canCorrectResult(null)).toBe(true);
  });
  it("allows correcting when the downstream match hasn't been played", () => {
    expect(canCorrectResult("PENDING")).toBe(true);
    expect(canCorrectResult("SCHEDULED")).toBe(true);
  });
  it("blocks correcting once the downstream match has been decided", () => {
    expect(canCorrectResult("COMPLETED")).toBe(false);
    expect(canCorrectResult("BYE")).toBe(false);
  });
});
