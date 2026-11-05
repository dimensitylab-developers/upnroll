/**
 * Pure ranking logic — no DB, no I/O. Separated per Part N: raw match
 * outcomes -> derived win/loss record -> official ranking calculation are
 * kept as distinct steps behind a swappable strategy, specifically so a
 * real approved methodology (pending OD-004) can replace
 * winLossPointsStrategy without touching anything else.
 */

export type DecidedMatch = { winnerUserId: string | null; competitorUserIds: string[] };

export function computeRecord(fighterUserId: string, matches: DecidedMatch[]): { wins: number; losses: number } {
  let wins = 0;
  let losses = 0;
  for (const m of matches) {
    if (!m.competitorUserIds.includes(fighterUserId) || !m.winnerUserId) continue;
    if (m.winnerUserId === fighterUserId) wins++;
    else losses++;
  }
  return { wins, losses };
}

export type RankingStrategy = (record: { wins: number; losses: number }) => number;

/**
 * Placeholder default strategy — NOT an approved ranking methodology.
 * 3 points per win, 0 for a loss. Pending OD-004; swap this function out
 * once the client approves a real formula.
 */
export const winLossPointsStrategy: RankingStrategy = ({ wins }) => wins * 3;
