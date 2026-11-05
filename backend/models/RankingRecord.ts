import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const rankingRecordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    scope: { type: String, enum: ["GLOBAL"], required: true, default: "GLOBAL" },
    wins: { type: Number, required: true, default: 0 },
    losses: { type: Number, required: true, default: 0 },
    // Placeholder points formula pending OD-004 (approved ranking methodology) — not an approved formula.
    points: { type: Number, required: true, default: 0 },
    calculationVersion: { type: Number, required: true, default: 1 },
    computedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

// rankingService.listPublicRankings sorts by { points: -1, wins: -1 } on every load.
rankingRecordSchema.index({ points: -1, wins: -1 });

export type RankingRecordDoc = InferSchemaType<typeof rankingRecordSchema>;

export const RankingRecord: Model<RankingRecordDoc> =
  models.RankingRecord ?? model<RankingRecordDoc>("RankingRecord", rankingRecordSchema);
