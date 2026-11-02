import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const fighterProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    gym: { type: String, default: "", trim: true },
    discipline: { type: String, default: "", trim: true },
    // Photo and public bio fields remain unbuilt — pending a real storage
    // provider (OD-012) and no specific requirement for them yet.
  },
  { timestamps: true }
);

export type FighterProfileDoc = InferSchemaType<typeof fighterProfileSchema>;

export const FighterProfile: Model<FighterProfileDoc> =
  models.FighterProfile ?? model<FighterProfileDoc>("FighterProfile", fighterProfileSchema);
