import { Match } from "@/server/models/Match";
import { assumedMatchDurationMinutes } from "./tournamentRules";
import type { DbSession } from "@/server/db/transaction";
import { bindSession } from "@/server/db/transaction";

export type ScheduleConflict = {
  type: "FIGHTER_OVERLAP" | "MAT_OVERLAP";
  otherMatchId: string;
  detail: string;
};

function windowOf(start: Date): { from: number; to: number } {
  const durationMs = assumedMatchDurationMinutes() * 60_000;
  return { from: start.getTime(), to: start.getTime() + durationMs };
}

function overlaps(a: { from: number; to: number }, b: { from: number; to: number }): boolean {
  return a.from < b.to && b.from < a.to;
}

/**
 * Detect scheduling conflicts for a proposed start/mat.
 * Uses assumed duration because end times are not stored.
 */
export async function detectScheduleConflicts(
  input: {
    matchId: string;
    eventId: string;
    scheduledAt: Date;
    mat: string;
    competitorARegistrationId: string | null;
    competitorBRegistrationId: string | null;
  },
  session?: DbSession
): Promise<ScheduleConflict[]> {
  const candidates = await bindSession(
    Match.find({
      eventId: input.eventId,
      _id: { $ne: input.matchId },
      status: { $in: ["PENDING", "SCHEDULED", "LIVE", "DELAYED"] },
      scheduledAt: { $ne: null },
    }).select("_id mat scheduledAt competitorARegistrationId competitorBRegistrationId"),
    session
  ).lean();

  const selfWindow = windowOf(input.scheduledAt);
  const selfRegs = new Set(
    [input.competitorARegistrationId, input.competitorBRegistrationId].filter(Boolean).map(String)
  );
  const conflicts: ScheduleConflict[] = [];

  for (const other of candidates) {
    if (!other.scheduledAt) continue;
    const otherWindow = windowOf(new Date(other.scheduledAt));
    if (!overlaps(selfWindow, otherWindow)) continue;

    if (input.mat && other.mat && input.mat === other.mat) {
      conflicts.push({
        type: "MAT_OVERLAP",
        otherMatchId: String(other._id),
        detail: `Mat ${input.mat} already has an overlapping match.`,
      });
    }

    const otherRegs = [other.competitorARegistrationId, other.competitorBRegistrationId]
      .filter(Boolean)
      .map(String);
    for (const regId of otherRegs) {
      if (selfRegs.has(regId)) {
        conflicts.push({
          type: "FIGHTER_OVERLAP",
          otherMatchId: String(other._id),
          detail: `A fighter is already scheduled in an overlapping match.`,
        });
        break;
      }
    }
  }

  return conflicts;
}
