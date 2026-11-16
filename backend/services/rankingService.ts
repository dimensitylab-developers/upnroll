import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { Match } from "@/server/models/Match";
import { Registration } from "@/server/models/Registration";
import { RankingRecord } from "@/server/models/RankingRecord";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Division } from "@/server/models/Division";
import { writeAuditLog } from "@/server/audit/log";
import { computeRecord, winLossPointsStrategy, type DecidedMatch } from "./rankingEngine";
import { bindSession, sessionOpts, withTransaction } from "@/server/db/transaction";
import { ConflictError } from "@/server/http/errors";

/** System/outbox path  no interactive admin actor. Still audited. */
export async function recalculateRankingsSystem(systemActorId = "system:outbox") {
  await connectDB();
  return recalculateRankingsInTransaction(systemActorId);
}

export async function recalculateRankings(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  return recalculateRankingsInTransaction(actor.userId);
}

async function recalculateRankingsInTransaction(actorId: string) {
  return withTransaction(async (session) => {
  const decided = await bindSession(Match.find({ status: { $in: ["COMPLETED", "BYE"] } }), session).lean();

  const registrationIds = [
    ...new Set(decided.flatMap((m) => [m.competitorARegistrationId, m.competitorBRegistrationId, m.winnerRegistrationId].filter(Boolean).map(String))),
  ];
  const registrations = await bindSession(Registration.find({ _id: { $in: registrationIds } }), session).lean();
  const userIdByRegistrationId = new Map(registrations.map((r) => [String(r._id), String(r.userId)]));

  const decidedMatches: DecidedMatch[] = decided.map((m) => ({
    winnerUserId: m.winnerRegistrationId ? userIdByRegistrationId.get(String(m.winnerRegistrationId)) ?? null : null,
    competitorUserIds: [m.competitorARegistrationId, m.competitorBRegistrationId]
      .filter(Boolean)
      .map((id) => userIdByRegistrationId.get(String(id)))
      .filter((id): id is string => Boolean(id)),
  }));

  const fighterUserIds = [...new Set(decidedMatches.flatMap((m) => m.competitorUserIds))];

  const existingVersion =
    (await bindSession(RankingRecord.findOne().sort({ calculationVersion: -1 }), session).lean())?.calculationVersion ?? 0;
  const newVersion = existingVersion + 1;
  const computedAt = new Date();

  for (const userId of fighterUserIds) {
    const record = computeRecord(userId, decidedMatches);
    const points = winLossPointsStrategy(record);
    const current = await bindSession(RankingRecord.findOne({ userId }), session);
    if (current && current.calculationVersion > existingVersion) {
      throw new ConflictError("Rankings were recalculated by someone else. Run the calculation again.");
    }
    if (current) {
      current.scope = "GLOBAL";
      current.wins = record.wins;
      current.losses = record.losses;
      current.points = points;
      current.calculationVersion = newVersion;
      current.computedAt = computedAt;
      await current.save(sessionOpts(session));
    } else {
      await RankingRecord.create(
        [{ userId, scope: "GLOBAL", wins: record.wins, losses: record.losses, points, calculationVersion: newVersion, computedAt }],
        { session }
      );
    }
  }

  await writeAuditLog(
    {
      actorId,
      action: "RANKINGS_RECALCULATED",
      targetType: "RankingRecord",
      after: { calculationVersion: newVersion, fighterCount: fighterUserIds.length },
    },
    session
  );

  return { calculationVersion: newVersion, fighterCount: fighterUserIds.length };
  });
}

export async function listPublicRankings() {
  await connectDB();
  const records = await RankingRecord.find().sort({ points: -1, wins: -1 }).lean();
  const profiles = await FighterProfile.find({ userId: { $in: records.map((r) => r.userId) } }).select("displayName slug userId").lean();
  const profileByUserId = new Map(profiles.map((p) => [String(p.userId), p]));

  return records.map((r, i) => ({
    rank: i + 1,
    displayName: profileByUserId.get(String(r.userId))?.displayName ?? "Unknown fighter",
    slug: profileByUserId.get(String(r.userId))?.slug ?? null,
    wins: r.wins,
    losses: r.losses,
    points: r.points,
    computedAt: r.computedAt,
  }));
}

export type RankingBoardEntry = {
  gender: "MALE" | "FEMALE";
  weightBand: string;
  level: "BEGINNER" | "INTERMEDIATE";
  displayName: string;
  slug: string;
  academy: string;
  hasPhoto: boolean;
  wins: number;
  losses: number;
  points: number;
};

/**
 * Public board source: one entry per confirmed registration, placed in the division the grappler
 * registered for. Wins, losses and points come from the ranking record (zero until results exist).
 */
export async function listRankingBoardEntries(): Promise<RankingBoardEntry[]> {
  await connectDB();
  const registrations = await Registration.find({ status: "CONFIRMED" }).select("userId divisionId").lean();
  if (registrations.length === 0) return [];

  const userIds = [...new Set(registrations.map((row) => String(row.userId)))];
  const divisionIds = [...new Set(registrations.map((row) => String(row.divisionId)))];
  const [divisions, profiles, records] = await Promise.all([
    Division.find({ _id: { $in: divisionIds } }).select("gender weightBand experienceLevel").lean(),
    FighterProfile.find({ userId: { $in: userIds } }).select("userId displayName slug academy gym photoKey").lean(),
    RankingRecord.find({ userId: { $in: userIds } }).select("userId wins losses points").lean(),
  ]);
  const divisionById = new Map(divisions.map((row) => [String(row._id), row]));
  const profileByUser = new Map(profiles.map((row) => [String(row.userId), row]));
  const recordByUser = new Map(records.map((row) => [String(row.userId), row]));

  const entries: RankingBoardEntry[] = [];
  for (const registration of registrations) {
    const division = divisionById.get(String(registration.divisionId));
    const profile = profileByUser.get(String(registration.userId));
    if (!division || !profile) continue;
    if (!division.gender || !division.weightBand || !division.experienceLevel) continue;
    const record = recordByUser.get(String(registration.userId));
    entries.push({
      gender: division.gender as "MALE" | "FEMALE",
      weightBand: division.weightBand,
      level: division.experienceLevel as "BEGINNER" | "INTERMEDIATE",
      displayName: profile.displayName?.trim() || "Grappler",
      slug: profile.slug || "",
      academy: profile.academy?.trim() || profile.gym?.trim() || "",
      hasPhoto: Boolean(profile.photoKey?.trim()),
      wins: record?.wins ?? 0,
      losses: record?.losses ?? 0,
      points: record?.points ?? 0,
    });
  }
  return entries;
}
