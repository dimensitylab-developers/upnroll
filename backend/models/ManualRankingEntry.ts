import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Admin-curated public rankings (meeting: manual numbering + Super Fight choice).
 * Lives alongside computed RankingRecord — public board prefers published manual rows when any exist.
 */
const manualRankingEntrySchema = new Schema(
  {
    displayName: { type: String, required: true, trim: true },
    slug: { type: String, default: "", trim: true, lowercase: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    /** Display order starting at 1 for the featured athlete. */
    rank: { type: Number, required: true, min: 1 },
    gender: { type: String, enum: ["", "MALE", "FEMALE"], default: "" },
    weightBand: { type: String, default: "", trim: true },
    experienceLevel: { type: String, enum: ["", "BEGINNER", "INTERMEDIATE"], default: "" },
    gym: { type: String, default: "", trim: true },
    photoUrl: { type: String, default: "", trim: true },
    published: { type: Boolean, default: true },
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

manualRankingEntrySchema.index({ published: 1, rank: 1 });
manualRankingEntrySchema.index({ weightBand: 1, gender: 1, rank: 1 });

export type ManualRankingEntryDoc = InferSchemaType<typeof manualRankingEntrySchema>;

export const ManualRankingEntry: Model<ManualRankingEntryDoc> =
  models.ManualRankingEntry ?? model<ManualRankingEntryDoc>("ManualRankingEntry", manualRankingEntrySchema);
