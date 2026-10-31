import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const fighterProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Gym, discipline, division, photo, and public bio fields are added when
    // the fighter profile / directory feature lands (Phase 3+) — not invented here.
  },
  { timestamps: true }
);

export type FighterProfileDoc = InferSchemaType<typeof fighterProfileSchema>;

export const FighterProfile: Model<FighterProfileDoc> =
  models.FighterProfile ?? model<FighterProfileDoc>("FighterProfile", fighterProfileSchema);
