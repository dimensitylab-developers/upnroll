import "server-only";

/**
 * Pure single-elimination bracket engine — no DB, no I/O. Kept separate
 * from bracketService.ts so the actual tournament-integrity rules are
 * independently unit-testable (Part N: deterministic given a known seed,
 * byes resolved without a manual step, never silently overwrite a played
 * result).
 */

export type MatchStatus =
  | "PENDING"
  | "SCHEDULED"
  | "LIVE"
  | "DELAYED"
  | "COMPLETED"
  | "BYE"
  | "CANCELLED"
  | "ERROR";

export type MatchSkeleton = {
  round: number;
  order: number;
  competitorA: string | null;
  competitorB: string | null;
  status: MatchStatus;
  winner: string | null;
};

/**
 * Classic recursive bracket-seeding order: seed 1 and 2 can only meet in
 * the final, 1 and 3/4 only in the semis, etc. n must be a power of two.
 * seedOrder(1) = [1]; seedOrder(2n) interleaves seedOrder(n) with its
 * complement (2n+1-s) for each seed s.
 */
export function standardSeedOrder(n: number): number[] {
  if (n < 1 || (n & (n - 1)) !== 0) {
    throw new Error("standardSeedOrder requires a power-of-two bracket size.");
  }
  let order = [1];
  while (order.length < n) {
    const size = order.length * 2;
    const next: number[] = [];
    for (const s of order) {
      next.push(s, size + 1 - s);
    }
    order = next;
  }
  return order;
}

/** mulberry32 PRNG — small, dependency-free, deterministic for a given seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher-Yates shuffle: the same seed always produces the same order. */
export function shuffleDeterministic<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Builds a full single-elimination bracket from an ordered list of
 * participant ids (index 0 = seed 1). Pads with byes to the next power of
 * two and auto-resolves bye matches immediately — a bye match is created
 * already COMPLETED/BYE with the real participant pre-filled as the
 * winner AND pre-filled into its round-1 slot, so no separate admin step
 * is needed to "resolve" a bye.
 */
export function buildBracket(orderedParticipantIds: string[]): {
  roundsCount: number;
  matches: MatchSkeleton[];
} {
  const participantCount = orderedParticipantIds.length;
  if (participantCount < 2) {
    throw new Error("A bracket needs at least two participants.");
  }

  const bracketSize = nextPowerOfTwo(participantCount);
  const roundsCount = Math.log2(bracketSize);
  const seedOrder = standardSeedOrder(bracketSize);

  // slot[i] = participant id at seed position seedOrder[i], or null for a bye.
  const slots: (string | null)[] = seedOrder.map((seed) =>
    seed <= participantCount ? orderedParticipantIds[seed - 1] : null
  );

  const matches: MatchSkeleton[] = [];
  const round0MatchCount = bracketSize / 2;

  // Round 0: pair up slots, auto-resolving byes.
  const round1Winners: (string | null)[] = new Array(round0MatchCount).fill(null);
  for (let i = 0; i < round0MatchCount; i++) {
    const a = slots[i * 2];
    const b = slots[i * 2 + 1];
    const isBye = a === null || b === null;
    const winner = isBye ? a ?? b : null;

    matches.push({
      round: 0,
      order: i,
      competitorA: a,
      competitorB: b,
      status: isBye ? "BYE" : "SCHEDULED",
      winner,
    });
    round1Winners[i] = winner;
  }

  // Rounds 1..roundsCount-1: create empty/pre-filled matches, cascading
  // consecutive byes forward (e.g. a 3-participant bracket resolves two
  // rounds of byes before the final is actually contested).
  let carry = round1Winners;
  for (let round = 1; round < roundsCount; round++) {
    const matchCount = bracketSize / 2 ** (round + 1);
    const nextCarry: (string | null)[] = new Array(matchCount).fill(null);

    for (let i = 0; i < matchCount; i++) {
      const a = carry[i * 2];
      const b = carry[i * 2 + 1];
      const bothEmpty = a === null && b === null;
      const oneEmpty = (a === null) !== (b === null);
      const isBye = !bothEmpty && oneEmpty;
      const winner = isBye ? a ?? b : null;

      matches.push({
        round,
        order: i,
        competitorA: a,
        competitorB: b,
        status: isBye ? "BYE" : a && b ? "SCHEDULED" : "PENDING",
        winner,
      });
      nextCarry[i] = winner;
    }
    carry = nextCarry;
  }

  return { roundsCount, matches };
}

/** Round/order arithmetic for winner advancement — no stored "next match" pointer needed. */
export function nextSlot(round: number, order: number): { round: number; order: number; slot: "A" | "B" } {
  return {
    round: round + 1,
    order: Math.floor(order / 2),
    slot: order % 2 === 0 ? "A" : "B",
  };
}

/**
 * A completed result can only be corrected if the match the old winner
 * advanced into hasn't itself been decided yet — otherwise the correction
 * would silently invalidate a later round's result.
 */
export function canCorrectResult(nextMatchStatus: MatchStatus | null): boolean {
  if (nextMatchStatus === null) return true; // final match — nothing downstream
  return nextMatchStatus !== "COMPLETED" && nextMatchStatus !== "BYE";
}
