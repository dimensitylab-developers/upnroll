import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { Match } from "@/server/models/Match";
import { Registration } from "@/server/models/Registration";
import { RankingRecord } from "@/server/models/RankingRecord";
import { FighterProfile } from "@/server/models/FighterProfile";
import { writeAuditLog } from "@/server/audit/log";
import { computeRecord, winLossPointsStrategy, type DecidedMatch } from "./rankingEngine";
import { bindSession, sessionOpts, withTransaction } from "@/server/db/transaction";
import { ConflictError } from "@/server/http/errors";

export async function recalculateRankings(actor: Actor) {
  assertAdmin(actor);
  await connectDB();

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
      actorId: actor.userId,
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
