import { connectDB } from "@/server/db/connect";
import { Division } from "@/server/models/Division";
import { Registration } from "@/server/models/Registration";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Bracket } from "@/server/models/Bracket";
import { Match, type MatchDoc } from "@/server/models/Match";
import { writeAuditLog } from "@/server/audit/log";
import { buildBracket, shuffleDeterministic } from "./bracketEngine";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";

type LeanMatch = MatchDoc & { _id: unknown };

export async function listEligibleParticipants(divisionId: string) {
  await connectDB();
  const registrations = await Registration.find({ divisionId, status: "CONFIRMED" }).lean();
  const userIds = registrations.map((r) => r.userId);
  const profiles = await FighterProfile.find({ userId: { $in: userIds } }).lean();
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
  const profiles = await FighterProfile.find({ userId: { $in: userIds } }).lean();
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
  adminId: string,
  divisionId: string,
  orderedRegistrationIds: string[],
  mode: { type: "manual" } | { type: "random"; seed: number }
) {
  await connectDB();

  const division = await Division.findById(divisionId);
  if (!division) throw new NotFoundError("Division not found.");

  const existing = await Bracket.findOne({ divisionId });
  if (existing && existing.status === "PUBLISHED") {
    throw new ConflictError("This bracket is already published. Unpublish is not supported — contact an administrator.");
  }

  const eligible = await Registration.find({
    _id: { $in: orderedRegistrationIds },
    divisionId,
    status: "CONFIRMED",
  }).lean();
  if (eligible.length !== orderedRegistrationIds.length) {
    throw new ValidationError("One or more selected participants are not confirmed registrations for this division.");
  }

  const seed = mode.type === "random" ? mode.seed : 0;
  const orderedIds =
    mode.type === "random" ? shuffleDeterministic(orderedRegistrationIds, seed) : orderedRegistrationIds;

  const { roundsCount, matches: skeleton } = buildBracket(orderedIds);

  let bracket;
  if (existing) {
    await Match.deleteMany({ bracketId: existing._id });
    existing.seed = seed;
    existing.participantRegistrationIds = orderedIds as unknown as typeof existing.participantRegistrationIds;
    existing.roundsCount = roundsCount;
    existing.version += 1;
    existing.status = "DRAFT";
    bracket = await existing.save();
  } else {
    bracket = await Bracket.create({
      eventId: division.eventId,
      divisionId,
      format: "SINGLE_ELIMINATION",
      seed,
      participantRegistrationIds: orderedIds,
      roundsCount,
      status: "DRAFT",
      version: 1,
    });
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
    }))
  );

  await writeAuditLog({
    actorId: adminId,
    action: "BRACKET_GENERATED",
    targetType: "Bracket",
    targetId: String(bracket._id),
    after: { version: bracket.version, participantCount: orderedIds.length },
  });

  return bracket;
}

export async function publishBracket(adminId: string, bracketId: string) {
  await connectDB();

  const bracket = await Bracket.findOneAndUpdate({ _id: bracketId, status: "DRAFT" }, { status: "PUBLISHED" }, { returnDocument: "after" });
  if (!bracket) throw new ConflictError("Bracket not found, or it has already been published.");

  await writeAuditLog({ actorId: adminId, action: "BRACKET_PUBLISHED", targetType: "Bracket", targetId: bracketId });
  return bracket;
}

export async function getBracketForDivision(divisionId: string) {
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
