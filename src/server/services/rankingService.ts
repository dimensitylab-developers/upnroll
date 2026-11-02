import { connectDB } from "@/server/db/connect";
import { Match } from "@/server/models/Match";
import { Registration } from "@/server/models/Registration";
import { RankingRecord } from "@/server/models/RankingRecord";
import { FighterProfile } from "@/server/models/FighterProfile";
import { writeAuditLog } from "@/server/audit/log";
import { computeRecord, winLossPointsStrategy, type DecidedMatch } from "./rankingEngine";

export async function recalculateRankings(adminId: string) {
  await connectDB();

  const decided = await Match.find({ status: { $in: ["COMPLETED", "BYE"] } }).lean();

  const registrationIds = [
    ...new Set(decided.flatMap((m) => [m.competitorARegistrationId, m.competitorBRegistrationId, m.winnerRegistrationId].filter(Boolean).map(String))),
  ];
  const registrations = await Registration.find({ _id: { $in: registrationIds } }).lean();
  const userIdByRegistrationId = new Map(registrations.map((r) => [String(r._id), String(r.userId)]));

  const decidedMatches: DecidedMatch[] = decided.map((m) => ({
    winnerUserId: m.winnerRegistrationId ? userIdByRegistrationId.get(String(m.winnerRegistrationId)) ?? null : null,
    competitorUserIds: [m.competitorARegistrationId, m.competitorBRegistrationId]
      .filter(Boolean)
      .map((id) => userIdByRegistrationId.get(String(id)))
      .filter((id): id is string => Boolean(id)),
  }));

  const fighterUserIds = [...new Set(decidedMatches.flatMap((m) => m.competitorUserIds))];

  const existingVersion = (await RankingRecord.findOne().sort({ calculationVersion: -1 }).lean())?.calculationVersion ?? 0;
  const newVersion = existingVersion + 1;
  const computedAt = new Date();

  await Promise.all(
    fighterUserIds.map(async (userId) => {
      const record = computeRecord(userId, decidedMatches);
      const points = winLossPointsStrategy(record);
      await RankingRecord.findOneAndUpdate(
        { userId },
        { scope: "GLOBAL", wins: record.wins, losses: record.losses, points, calculationVersion: newVersion, computedAt },
        { upsert: true }
      );
    })
  );

  await writeAuditLog({
    actorId: adminId,
    action: "RANKINGS_RECALCULATED",
    targetType: "RankingRecord",
    after: { calculationVersion: newVersion, fighterCount: fighterUserIds.length },
  });

  return { calculationVersion: newVersion, fighterCount: fighterUserIds.length };
}

export async function listPublicRankings() {
  await connectDB();
  const records = await RankingRecord.find().sort({ points: -1, wins: -1 }).lean();
  const profiles = await FighterProfile.find({ userId: { $in: records.map((r) => r.userId) } }).lean();
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
