import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { Division } from "@/server/models/Division";
import { Registration } from "@/server/models/Registration";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Bracket } from "@/server/models/Bracket";
import { Match, type MatchDoc } from "@/server/models/Match";
import { writeAuditLog } from "@/server/audit/log";
import { Event } from "@/server/models/Event";
import { buildBracket, shuffleDeterministic } from "./bracketEngine";
import { matNumberForOrder } from "./tournamentRules";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";
import { bindSession, isDuplicateKey, sessionOpts, withTransaction } from "@/server/db/transaction";
import { requireObjectId } from "@/server/validation/objectId";

type LeanMatch = MatchDoc & { _id: unknown };

export async function listEligibleParticipants(actor: Actor, divisionId: string) {
  assertAdmin(actor);
  await connectDB();
  const registrations = await Registration.find({ divisionId, status: "CONFIRMED" }).lean();
  const userIds = registrations.map((r) => r.userId);
  const profiles = await FighterProfile.find({ userId: { $in: userIds } }).select("displayName userId").lean();
  const profileByUserId = new Map(profiles.map((p) => [String(p.userId), p]));

  return registrations.map((r) => ({
    registrationId: String(r._id),
    displayName: profileByUserId.get(String(r.userId))?.displayName ?? "Unknown fighter",
  }));
}

async function enrichMatches(matches: LeanMatch[]) {
  const registrationIds = [
    ...new Set(
      matches.flatMap((m) =>
        [m.competitorARegistrationId, m.competitorBRegistrationId, m.winnerRegistrationId]
          .filter(Boolean)
          .map(String)
      )
    ),
  ];
  const registrations = await Registration.find({ _id: { $in: registrationIds } }).lean();
  const userIds = registrations.map((r) => r.userId);
  const profiles = await FighterProfile.find({ userId: { $in: userIds } }).select("displayName userId").lean();
  const profileByUserId = new Map(profiles.map((p) => [String(p.userId), p]));
  const nameByRegistrationId = new Map(
    registrations.map((r) => [String(r._id), profileByUserId.get(String(r.userId))?.displayName ?? "Unknown fighter"])
  );

  return matches.map((m) => ({
    ...m,
    competitorAName: m.competitorARegistrationId ? nameByRegistrationId.get(String(m.competitorARegistrationId)) ?? null : null,
    competitorBName: m.competitorBRegistrationId ? nameByRegistrationId.get(String(m.competitorBRegistrationId)) ?? null : null,
    winnerName: m.winnerRegistrationId ? nameByRegistrationId.get(String(m.winnerRegistrationId)) ?? null : null,
  }));
}

export async function generateBracket(
  actor: Actor,
  divisionId: string,
  orderedRegistrationIds: string[],
  mode: { type: "manual" } | { type: "random"; seed: number }
) {
  assertAdmin(actor);
  requireObjectId(divisionId, "division");
  for (const id of orderedRegistrationIds) requireObjectId(id, "registration");
  await connectDB();

  try {
    return await withTransaction(async (session) => {
      const division = await bindSession(Division.findById(divisionId), session);
      if (!division) throw new NotFoundError("Division not found.");

      const existing = await bindSession(Bracket.findOne({ divisionId }), session);
      if (existing && existing.status === "PUBLISHED") {
        throw new ConflictError("This bracket is already published. Unpublish is not supported — contact an administrator.");
      }

      const eligible = await bindSession(
        Registration.find({
          _id: { $in: orderedRegistrationIds },
          divisionId,
          status: "CONFIRMED",
        }),
        session
      ).lean();
      if (eligible.length !== orderedRegistrationIds.length) {
        throw new ValidationError("One or more selected participants are not confirmed registrations for this division.");
      }

      const seed = mode.type === "random" ? mode.seed : 0;
      const orderedIds =
        mode.type === "random" ? shuffleDeterministic(orderedRegistrationIds, seed) : orderedRegistrationIds;

      const { roundsCount, matches: skeleton } = buildBracket(orderedIds);
      const event = await bindSession(Event.findById(division.eventId), session).lean();
      const matCount = event?.matCount ?? 1;

      let bracket;
      if (existing) {
        await Match.deleteMany({ bracketId: existing._id }, sessionOpts(session));
        existing.seed = seed;
        existing.participantRegistrationIds = orderedIds as unknown as typeof existing.participantRegistrationIds;
        existing.roundsCount = roundsCount;
        existing.version += 1;
        existing.status = "DRAFT";
        bracket = await existing.save(sessionOpts(session));
      } else {
        const [created] = await Bracket.create(
          [
            {
              eventId: division.eventId,
              divisionId,
              format: "SINGLE_ELIMINATION",
              seed,
              participantRegistrationIds: orderedIds,
              roundsCount,
              status: "DRAFT",
              version: 1,
            },
          ],
          { session }
        );
        bracket = created;
      }

      await Match.insertMany(
        skeleton.map((m) => ({
          eventId: division.eventId,
          divisionId,
          bracketId: bracket._id,
          round: m.round,
          order: m.order,
          competitorARegistrationId: m.competitorA,
          competitorBRegistrationId: m.competitorB,
          status: m.status,
          winnerRegistrationId: m.winner,
          resultMethod: m.status === "BYE" ? "BYE" : "",
          resultRecordedAt: m.status === "BYE" ? new Date() : null,
          mat: String(matNumberForOrder(m.order, matCount)),
        })),
        sessionOpts(session)
      );

      await writeAuditLog(
        {
          actorId: actor.userId,
          action: "BRACKET_GENERATED",
          targetType: "Bracket",
          targetId: String(bracket._id),
          after: { version: bracket.version, participantCount: orderedIds.length },
        },
        session
      );

      return bracket;
    });
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw new ConflictError("A bracket for this division already exists. Refresh and try again.");
    }
    throw err;
  }
}

export async function publishBracket(actor: Actor, bracketId: string) {
  assertAdmin(actor);
  await connectDB();

  const bracket = await withTransaction(async (session) => {
    const updated = await Bracket.findOneAndUpdate(
      { _id: bracketId, status: "DRAFT" },
      { status: "PUBLISHED" },
      { returnDocument: "after", session }
    );
    if (!updated) throw new ConflictError("Bracket not found, or it has already been published.");

    await writeAuditLog(
      { actorId: actor.userId, action: "BRACKET_PUBLISHED", targetType: "Bracket", targetId: bracketId },
      session
    );
    return updated;
  });

  // Reminders only after publish — never from draft edits. Jobs are durable outbox records.
  const { scheduleRemindersForPublishedBracket } = await import("./reminderService");
  await scheduleRemindersForPublishedBracket(bracketId);

  return bracket;
}

export async function getBracketForDivision(actor: Actor, divisionId: string) {
  assertAdmin(actor);
  await connectDB();
  const bracket = await Bracket.findOne({ divisionId }).lean();
  if (!bracket) return null;
  const matches = await Match.find({ bracketId: bracket._id }).sort({ round: 1, order: 1 }).lean();
  return { bracket, matches: await enrichMatches(matches) };
}

export async function getPublishedBracketForDivision(divisionId: string) {
  await connectDB();
  const bracket = await Bracket.findOne({ divisionId, status: "PUBLISHED" }).lean();
  if (!bracket) throw new NotFoundError("No published bracket for this division.");
  const matches = await Match.find({ bracketId: bracket._id }).sort({ round: 1, order: 1 }).lean();
  return { bracket, matches: await enrichMatches(matches) };
}
