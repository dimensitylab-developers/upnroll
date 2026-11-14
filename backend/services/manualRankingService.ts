import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { ManualRankingEntry } from "@/server/models/ManualRankingEntry";
import { writeAuditLog } from "@/server/audit/log";
import { ValidationError } from "@/server/http/errors";

export type ManualRankingInput = {
  displayName: string;
  rank: number;
  slug?: string;
  gender?: string;
  weightBand?: string;
  experienceLevel?: string;
  gym?: string;
  photoUrl?: string;
  note?: string;
  published?: boolean;
};

export async function listPublishedManualRankings() {
  await connectDB();
  return ManualRankingEntry.find({ published: true }).sort({ rank: 1, displayName: 1 }).lean();
}

export async function listManualRankingsForAdmin(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  return ManualRankingEntry.find().sort({ rank: 1, displayName: 1 }).lean();
}

export async function upsertManualRanking(actor: Actor, input: ManualRankingInput, id?: string) {
  assertAdmin(actor);
  await connectDB();
  if (!input.displayName.trim()) throw new ValidationError("Enter a fighter name.");
  if (!Number.isInteger(input.rank) || input.rank < 1) throw new ValidationError("Rank must be 1 or higher.");

  let gender: "" | "MALE" | "FEMALE" = "";
  if (input.gender === "MALE" || input.gender === "FEMALE") gender = input.gender;

  let experienceLevel: "" | "BEGINNER" | "INTERMEDIATE" = "";
  if (input.experienceLevel === "BEGINNER" || input.experienceLevel === "INTERMEDIATE") {
    experienceLevel = input.experienceLevel;
  }

  const payload = {
    displayName: input.displayName.trim(),
    rank: input.rank,
    slug: (input.slug ?? "").trim().toLowerCase(),
    gender,
    weightBand: input.weightBand ?? "",
    experienceLevel,
    gym: input.gym ?? "",
    photoUrl: input.photoUrl ?? "",
    note: input.note ?? "",
    published: input.published ?? true,
  };

  if (id) {
    const entry = await ManualRankingEntry.findByIdAndUpdate(id, { $set: payload }, { new: true });
    if (!entry) throw new ValidationError("Ranking entry not found.");
    await writeAuditLog({
      actorId: actor.userId,
      action: "MANUAL_RANKING_UPDATED",
      targetType: "ManualRankingEntry",
      targetId: id,
      after: payload,
    });
    return entry;
  }

  const entry = new ManualRankingEntry(payload);
  await entry.save();
  await writeAuditLog({
    actorId: actor.userId,
    action: "MANUAL_RANKING_CREATED",
    targetType: "ManualRankingEntry",
    targetId: String(entry._id),
    after: payload,
  });
  return entry;
}

export async function deleteManualRanking(actor: Actor, id: string) {
  assertAdmin(actor);
  await connectDB();
  await ManualRankingEntry.findByIdAndDelete(id);
  await writeAuditLog({
    actorId: actor.userId,
    action: "MANUAL_RANKING_DELETED",
    targetType: "ManualRankingEntry",
    targetId: id,
  });
}
