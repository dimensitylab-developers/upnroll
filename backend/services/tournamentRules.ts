const DAY_MS = 24 * 60 * 60 * 1000;
const WARMUP_WINDOW_MS = 15 * 60 * 1000;

/** Default coupon hold while a registration form is in progress (minutes). Overridable via env. */
export function couponReservationMinutes(): number {
  const raw = Number(process.env.COUPON_RESERVATION_MINUTES ?? "15");
  if (!Number.isFinite(raw) || raw < 1) return 15;
  return Math.min(120, Math.floor(raw));
}

/** Max concurrent open coupon reservations per authenticated user. */
export function maxOpenCouponReservationsPerUser(): number {
  const raw = Number(process.env.COUPON_MAX_OPEN_RESERVATIONS ?? "3");
  if (!Number.isFinite(raw) || raw < 1) return 3;
  return Math.min(20, Math.floor(raw));
}

/** Assumed match duration used for overlap conflict detection when only start times exist. */
export function assumedMatchDurationMinutes(): number {
  const raw = Number(process.env.ASSUMED_MATCH_DURATION_MINUTES ?? "10");
  if (!Number.isFinite(raw) || raw < 1) return 10;
  return Math.min(120, Math.floor(raw));
}

/** Mat numbers run 1..matCount and repeat in match order. */
export function matNumberForOrder(order: number, matCount: number): number {
  const count = Number.isFinite(matCount) && matCount >= 1 ? Math.floor(matCount) : 1;
  const index = Number.isFinite(order) && order >= 0 ? Math.floor(order) : 0;
  return (index % count) + 1;
}

/** 50% when the cancellation is at least 30 days before the event starts. Otherwise none. */
export function refundPercentForCancellation(eventStart: Date, cancelledAt: Date): 0 | 50 {
  return eventStart.getTime() - cancelledAt.getTime() >= 30 * DAY_MS ? 50 : 0;
}

/** Minutes until the match, when it is inside the 15-minute warm-up window. */
export function warmUpMinutes(scheduledAt: Date, now: Date): number | null {
  const diff = scheduledAt.getTime() - now.getTime();
  if (diff <= 0 || diff > WARMUP_WINDOW_MS) return null;
  return Math.max(1, Math.ceil(diff / 60000));
}

export type ScoringRulesConfig = {
  configured: boolean;
  winByHighestScore: boolean;
  allowTies: boolean;
  points: Array<{ code: string; label: string; points: number }>;
  penalties: Array<{ code: string; label: string; pointsAgainst: number }>;
  outcomes: Array<{ code: string; label: string; requiresExplicitWinner: boolean }>;
};

export function emptyScoringRules(): ScoringRulesConfig {
  return {
    configured: false,
    winByHighestScore: false,
    allowTies: false,
    points: [],
    penalties: [],
    outcomes: [],
  };
}

export function isScoringRulesReady(rules: ScoringRulesConfig | null | undefined): boolean {
  if (!rules?.configured) return false;
  if (!rules.outcomes.length) return false;
  if (rules.winByHighestScore && !rules.points.length) return false;
  return true;
}

/**
 * Provisional winner from live scores — only when winByHighestScore is enabled.
 * Never invents a winner when rules are unconfigured or scores are tied without allowTies.
 */
export function provisionalWinnerFromScores(input: {
  rules: ScoringRulesConfig;
  scoreA: number;
  scoreB: number;
  registrationAId: string | null;
  registrationBId: string | null;
}): { registrationId: string | null; method: string; ready: boolean; reason?: string } {
  if (!isScoringRulesReady(input.rules)) {
    return { registrationId: null, method: "", ready: false, reason: "Scoring rules are not configured." };
  }
  if (!input.rules.winByHighestScore) {
    return {
      registrationId: null,
      method: "",
      ready: false,
      reason: "This tournament requires an explicit outcome; highest score alone does not decide the winner.",
    };
  }
  if (input.scoreA === input.scoreB) {
    if (input.rules.allowTies) {
      return { registrationId: null, method: "DRAW", ready: true };
    }
    return { registrationId: null, method: "", ready: false, reason: "Scores are tied; a tie-break outcome is required." };
  }
  const aWins = input.scoreA > input.scoreB;
  const id = aWins ? input.registrationAId : input.registrationBId;
  if (!id) return { registrationId: null, method: "", ready: false, reason: "Competitors are not set." };
  return { registrationId: id, method: "POINTS", ready: true };
}
