import "server-only";
import { connectDB } from "@/server/db/connect";
import { Match } from "@/server/models/Match";
import { Bracket } from "@/server/models/Bracket";
import { Registration } from "@/server/models/Registration";
import { Event } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { FighterProfile } from "@/server/models/FighterProfile";
import type { OutboxJobDoc } from "@/server/models/OutboxJob";
import { enqueueOutboxJob, supersedeOutboxJobsByPrefix } from "./outboxService";
import { createInAppAndEmailReminder } from "./notificationService";
import type { DbSession } from "@/server/db/transaction";

const TEN_MIN_MS = 10 * 60 * 1000;

function formatWhen(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

/**
 * Schedule (or reschedule) the 10-minute reminder for a match after publish/schedule change.
 * Unpublished draft brackets must not call this.
 */
export async function scheduleMatchReminderForMatch(
  matchId: string,
  session?: DbSession
): Promise<{ scheduled: boolean; reason?: string }> {
  await connectDB();
  const match = await Match.findById(matchId).lean();
  if (!match) return { scheduled: false, reason: "missing" };

  const bracket = await Bracket.findById(match.bracketId).select("status").lean();
  if (!bracket || bracket.status !== "PUBLISHED") {
    return { scheduled: false, reason: "bracket_unpublished" };
  }

  if (!match.scheduledAt) {
    return { scheduled: false, reason: "no_scheduled_at" };
  }
  if (!match.competitorARegistrationId || !match.competitorBRegistrationId) {
    return { scheduled: false, reason: "competitors_incomplete" };
  }
  if (["COMPLETED", "CANCELLED", "BYE"].includes(match.status)) {
    return { scheduled: false, reason: "terminal_status" };
  }

  const prefix = `match-reminder:${matchId}:`;
  await supersedeOutboxJobsByPrefix(prefix, session);

  const scheduledAt = new Date(match.scheduledAt);
  const now = new Date();
  const runAt = new Date(scheduledAt.getTime() - TEN_MIN_MS);
  const insideWindow = scheduledAt.getTime() - now.getTime() <= TEN_MIN_MS;
  const mode = insideWindow ? "STARTING_SOON" : "TEN_MIN";
  const effectiveRunAt = insideWindow ? now : runAt;

  const idempotencyKey = `${prefix}v${match.scheduleVersion}:${mode}`;
  await enqueueOutboxJob(
    {
      type: "MATCH_REMINDER",
      idempotencyKey,
      runAt: effectiveRunAt,
      payload: {
        matchId,
        scheduleVersion: match.scheduleVersion,
        mode,
        scheduledAt: scheduledAt.toISOString(),
      },
    },
    session
  );

  return { scheduled: true };
}

export async function scheduleRemindersForPublishedBracket(bracketId: string, session?: DbSession) {
  await connectDB();
  const matches = await Match.find({
    bracketId,
    status: { $in: ["PENDING", "SCHEDULED", "LIVE", "DELAYED"] },
    scheduledAt: { $ne: null },
  })
    .select("_id")
    .lean();

  const results = [];
  for (const m of matches) {
    results.push(await scheduleMatchReminderForMatch(String(m._id), session));
  }
  return results;
}

export async function processMatchReminderJob(job: OutboxJobDoc) {
  await connectDB();
  const payload = job.payload as {
    matchId?: string;
    scheduleVersion?: number;
    mode?: "TEN_MIN" | "STARTING_SOON";
  };
  const matchId = String(payload.matchId ?? "");
  const scheduleVersion = Number(payload.scheduleVersion ?? -1);
  const mode = payload.mode === "STARTING_SOON" ? "STARTING_SOON" : "TEN_MIN";

  const match = await Match.findById(matchId).lean();
  if (!match) return;
  if (match.scheduleVersion !== scheduleVersion) return; // superseded by newer schedule
  if (!match.scheduledAt) return;
  if (["COMPLETED", "CANCELLED", "BYE"].includes(match.status)) return;

  const bracket = await Bracket.findById(match.bracketId).select("status").lean();
  if (!bracket || bracket.status !== "PUBLISHED") return;

  const [event, division, regs] = await Promise.all([
    Event.findById(match.eventId).select("name timezone slug").lean(),
    Division.findById(match.divisionId).select("name").lean(),
    Registration.find({
      _id: { $in: [match.competitorARegistrationId, match.competitorBRegistrationId].filter(Boolean) },
    }).lean(),
  ]);
  const profiles = await FighterProfile.find({ userId: { $in: regs.map((r) => r.userId) } })
    .select("displayName userId")
    .lean();
  const nameByUser = new Map(profiles.map((p) => [String(p.userId), p.displayName]));
  const nameByReg = new Map(
    regs.map((r) => [String(r._id), nameByUser.get(String(r.userId)) ?? "Opponent TBA"])
  );

  const tz = event?.timezone ?? "Asia/Kolkata";
  const when = formatWhen(new Date(match.scheduledAt), tz);
  const mat = match.mat ? `Mat ${match.mat}` : "Mat TBA";

  for (const reg of regs) {
    const userId = String(reg.userId);
    const opponentRegId =
      String(reg._id) === String(match.competitorARegistrationId)
        ? match.competitorBRegistrationId
        : match.competitorARegistrationId;
    const opponent = opponentRegId ? nameByReg.get(String(opponentRegId)) ?? "Opponent TBA" : "Opponent TBA";

    const startingSoon = mode === "STARTING_SOON";
    const title = startingSoon ? "Match starting soon" : "Match in about 10 minutes";
    const body = startingSoon
      ? `${event?.name ?? "Event"} · vs ${opponent} · ${division?.name ?? "Division"} · ${mat} · ${when} (${tz}). Get ready.`
      : `${event?.name ?? "Event"} · vs ${opponent} · ${division?.name ?? "Division"} · ${mat} · scheduled ${when} (${tz}).`;

    await createInAppAndEmailReminder({
      userId,
      matchId,
      eventId: String(match.eventId),
      type: startingSoon ? "MATCH_STARTING_SOON" : "MATCH_REMINDER_10M",
      title,
      body,
      dedupeKey: `reminder:${matchId}:v${scheduleVersion}:${mode}:${userId}`,
      emailSubject: `${event?.name ?? "Up 'n Roll"} — ${title}`,
      emailBody: `${body}\n\nOpen your matches: /fighter/matches\n\nNote: email delivery is best-effort; timing is not guaranteed to the minute.\n`,
    });
  }
}
