import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, assertFighter, type Actor } from "@/server/auth/actor";
import { Match, type MatchDoc } from "@/server/models/Match";

type LeanMatch = MatchDoc & { _id: unknown };
import { Bracket } from "@/server/models/Bracket";
import { Registration } from "@/server/models/Registration";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Event } from "@/server/models/Event";
import { PUBLIC_EVENT_STATUSES } from "./eventService";
import { Division } from "@/server/models/Division";
import { writeAuditLog } from "@/server/audit/log";
import { nextSlot, canCorrectResult } from "./bracketEngine";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";
import { notifyWhatsApp } from "@/server/notifications/whatsapp";

export async function recordMatchResult(actor: Actor, matchId: string, winnerRegistrationId: string, method: string) {
  assertAdmin(actor);
  await connectDB();

  const match = await Match.findById(matchId);
  if (!match) throw new NotFoundError("Match not found.");
  if (match.status !== "SCHEDULED") {
    throw new ConflictError("A result can only be recorded for a scheduled match with both competitors set.");
  }
  const competitorIds = [match.competitorARegistrationId, match.competitorBRegistrationId].map((id) => String(id));
  if (!competitorIds.includes(winnerRegistrationId)) {
    throw new ValidationError("The winner must be one of this match's two competitors.");
  }
  if (!method.trim()) throw new ValidationError("A result method is required.");

  match.status = "COMPLETED";
  match.winnerRegistrationId = winnerRegistrationId as unknown as MatchDoc["winnerRegistrationId"];
  match.resultMethod = method;
  match.resultRecordedBy = actor.userId as unknown as MatchDoc["resultRecordedBy"];
  match.resultRecordedAt = new Date();
  await match.save();

  await advanceWinnerIfApplicable(match.bracketId.toString(), match.round, match.order, winnerRegistrationId);

  await writeAuditLog({
    actorId: actor.userId,
    action: "MATCH_RESULT_RECORDED",
    targetType: "Match",
    targetId: matchId,
    after: { winnerRegistrationId, method },
  });

  return match;
}

async function advanceWinnerIfApplicable(bracketId: string, round: number, order: number, winnerRegistrationId: string) {
  const bracket = await Bracket.findById(bracketId);
  if (!bracket || round + 1 >= bracket.roundsCount) return; // final match — nothing downstream

  const { round: nextRound, order: nextOrder, slot } = nextSlot(round, order);
  const next = await Match.findOne({ bracketId, round: nextRound, order: nextOrder });
  if (!next) return;

  if (slot === "A") next.competitorARegistrationId = winnerRegistrationId as unknown as MatchDoc["competitorARegistrationId"];
  else next.competitorBRegistrationId = winnerRegistrationId as unknown as MatchDoc["competitorBRegistrationId"];

  if (next.competitorARegistrationId && next.competitorBRegistrationId && next.status === "PENDING") {
    next.status = "SCHEDULED";
  }
  await next.save();
}

export async function correctMatchResult(
  actor: Actor,
  matchId: string,
  newWinnerRegistrationId: string,
  newMethod: string,
  reason: string
) {
  assertAdmin(actor);
  await connectDB();

  if (!reason.trim()) throw new ValidationError("A reason is required to correct a result.");

  const match = await Match.findById(matchId);
  if (!match) throw new NotFoundError("Match not found.");
  if (match.status !== "COMPLETED") throw new ConflictError("Only a completed match's result can be corrected.");

  const competitorIds = [match.competitorARegistrationId, match.competitorBRegistrationId].map((id) => String(id));
  if (!competitorIds.includes(newWinnerRegistrationId)) {
    throw new ValidationError("The winner must be one of this match's two competitors.");
  }

  const bracket = await Bracket.findById(match.bracketId);
  let nextMatch = null;
  if (bracket && match.round + 1 < bracket.roundsCount) {
    const { round: nextRound, order: nextOrder } = nextSlot(match.round, match.order);
    nextMatch = await Match.findOne({ bracketId: match.bracketId, round: nextRound, order: nextOrder });
  }
  if (!canCorrectResult(nextMatch?.status ?? null)) {
    throw new ConflictError(
      "This result can't be corrected because the match it advanced into has already been decided."
    );
  }

  const before = { winnerRegistrationId: match.winnerRegistrationId, resultMethod: match.resultMethod };

  match.correctionHistory.push({
    previousWinnerRegistrationId: match.winnerRegistrationId,
    previousResultMethod: match.resultMethod,
    reason,
    correctedBy: actor.userId as unknown as MatchDoc["resultRecordedBy"],
    correctedAt: new Date(),
  });
  match.winnerRegistrationId = newWinnerRegistrationId as unknown as MatchDoc["winnerRegistrationId"];
  match.resultMethod = newMethod;
  await match.save();

  // If there's a downstream match and it isn't decided yet, re-propagate the corrected winner.
  if (nextMatch) {
    await advanceWinnerIfApplicable(match.bracketId.toString(), match.round, match.order, newWinnerRegistrationId);
  }

  await writeAuditLog({
    actorId: actor.userId,
    action: "MATCH_RESULT_CORRECTED",
    targetType: "Match",
    targetId: matchId,
    before,
    after: { winnerRegistrationId: newWinnerRegistrationId, resultMethod: newMethod, reason },
  });

  return match;
}

export async function updateMatchSchedule(actor: Actor, matchId: string, input: { scheduledAt?: Date | null; mat?: string }) {
  assertAdmin(actor);
  await connectDB();
  const match = await Match.findById(matchId);
  if (!match) throw new NotFoundError("Match not found.");

  if (input.scheduledAt !== undefined && input.scheduledAt !== null) {
    if (!match.competitorARegistrationId || !match.competitorBRegistrationId) {
      throw new ValidationError("Both competitors must be set before this match can be scheduled.");
    }
    if (Number.isNaN(input.scheduledAt.getTime())) {
      throw new ValidationError("The scheduled date/time is invalid.");
    }
  }

  if (input.scheduledAt !== undefined) match.scheduledAt = input.scheduledAt;
  if (input.mat !== undefined) match.mat = input.mat;
  await match.save();

  if (match.scheduledAt) {
    const ids = [match.competitorARegistrationId, match.competitorBRegistrationId].filter(Boolean);
    const registrations = await Registration.find({ _id: { $in: ids } }).lean();
    const profiles = await FighterProfile.find({ userId: { $in: registrations.map((r) => r.userId) } }).lean();
    const when = new Date(match.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const body = `Your match is on mat ${match.mat || "TBD"} at ${when}. Warm up 10 to 15 minutes before you are called.`;
    await Promise.all(profiles.map((profile) => notifyWhatsApp({ to: profile.mobile ?? "", body })));
  }

  await writeAuditLog({ actorId: actor.userId, action: "MATCH_SCHEDULE_UPDATED", targetType: "Match", targetId: matchId });
  return match;
}

async function enrichWithNamesAndEvent(matches: LeanMatch[]) {
  const registrationIds = [
    ...new Set(
      matches.flatMap((m) => [m.competitorARegistrationId, m.competitorBRegistrationId, m.winnerRegistrationId].filter(Boolean).map(String))
    ),
  ];
  const eventIds = [...new Set(matches.map((m) => String(m.eventId)))];
  const divisionIds = [...new Set(matches.map((m) => String(m.divisionId)))];
  const [registrations, events, divisions] = await Promise.all([
    Registration.find({ _id: { $in: registrationIds } }).lean(),
    Event.find({ _id: { $in: eventIds } }).select("name").lean(),
    Division.find({ _id: { $in: divisionIds } }).lean(),
  ]);
  const divisionById = new Map(divisions.map((d) => [String(d._id), d]));
  const userIds = registrations.map((r) => r.userId);
  const profiles = await FighterProfile.find({ userId: { $in: userIds } }).select("displayName userId").lean();
  const profileByUserId = new Map(profiles.map((p) => [String(p.userId), p]));
  const nameByRegistrationId = new Map(
    registrations.map((r) => [String(r._id), profileByUserId.get(String(r.userId))?.displayName ?? "Unknown fighter"])
  );
  const eventById = new Map(events.map((e) => [String(e._id), e]));

  return matches.map((m) => ({
    ...m,
    competitorAName: m.competitorARegistrationId ? nameByRegistrationId.get(String(m.competitorARegistrationId)) ?? null : null,
    competitorBName: m.competitorBRegistrationId ? nameByRegistrationId.get(String(m.competitorBRegistrationId)) ?? null : null,
    winnerName: m.winnerRegistrationId ? nameByRegistrationId.get(String(m.winnerRegistrationId)) ?? null : null,
    event: eventById.get(String(m.eventId)) ? { name: eventById.get(String(m.eventId))!.name } : null,
    divisionName: divisionById.get(String(m.divisionId))?.name ?? "Unknown division",
  }));
}

export async function listMatchesForEvent(actor: Actor, eventId: string) {
  assertAdmin(actor);
  await connectDB();
  const matches = await Match.find({ eventId }).sort({ round: 1, order: 1 }).lean();
  return enrichWithNamesAndEvent(matches);
}

/** Not exported. Callers must use listMatchesForFighter or listPublicMatchHistory. */
async function loadMatchesForUser(userId: string) {
  await connectDB();
  const registrations = await Registration.find({ userId }).select("_id").lean();
  const registrationIds = registrations.map((r) => String(r._id));
  const matches = await Match.find({
    $or: [{ competitorARegistrationId: { $in: registrationIds } }, { competitorBRegistrationId: { $in: registrationIds } }],
  })
    .sort({ round: 1 })
    .lean();
  return enrichWithNamesAndEvent(matches);
}

export async function listMatchesForFighter(actor: Actor) {
  assertFighter(actor);
  return loadMatchesForUser(actor.userId);
}

export type PublicMatchHistoryEntry = {
  _id: string;
  event: { name: string };
  competitorAName: string | null;
  competitorBName: string | null;
  winnerName: string | null;
  resultMethod: string;
};

/** Public record for a fighter looked up by the server. No caller-supplied user id is trusted as an owner. */
export async function listPublicMatchHistory(userId: string): Promise<{
  wins: number;
  losses: number;
  history: PublicMatchHistoryEntry[];
}> {
  const [allMatches, ownRegistrations] = await Promise.all([
    loadMatchesForUser(userId),
    Registration.find({ userId }).select("_id").lean(),
  ]);
  const ownRegistrationIds = new Set(ownRegistrations.map((r) => String(r._id)));
  const decided = allMatches.filter((m) => m.status === "COMPLETED" || m.status === "BYE");
  const wins = decided.filter((m) => m.winnerRegistrationId && ownRegistrationIds.has(String(m.winnerRegistrationId))).length;
  return {
    wins,
    losses: decided.length - wins,
    history: decided.map((m) => ({
      _id: String(m._id),
      event: { name: m.event?.name ?? "Unknown" },
      competitorAName: m.competitorAName,
      competitorBName: m.competitorBName,
      winnerName: m.winnerName,
      resultMethod: m.resultMethod ?? "",
    })),
  };
}

export async function listPublicSchedule(eventSlug: string) {
  await connectDB();
  const event = await Event.findOne({ slug: eventSlug, status: { $in: PUBLIC_EVENT_STATUSES } }).lean();
  if (!event) throw new NotFoundError("Event not found.");

  const publishedBracketIds = (await Bracket.find({ eventId: event._id, status: "PUBLISHED" }).lean()).map((b) => b._id);
  const matches = await Match.find({ bracketId: { $in: publishedBracketIds } })
    .sort({ scheduledAt: 1, round: 1, order: 1 })
    .lean();
  return enrichWithNamesAndEvent(matches);
}

export async function listPublicResults(eventSlug: string) {
  const matches = await listPublicSchedule(eventSlug);
  return matches.filter((m) => m.status === "COMPLETED" || m.status === "BYE");
}
