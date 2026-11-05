import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const mediaAssetSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", default: null },
    caption: { type: String, required: true, trim: true },
    // External URL only — real object storage/CDN is pending OD-012.
    externalUrl: { type: String, required: true, trim: true },
    publicationState: { type: String, enum: ["DRAFT", "PUBLISHED"], required: true, default: "DRAFT" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export type MediaAssetDoc = InferSchemaType<typeof mediaAssetSchema>;

export const MediaAsset: Model<MediaAssetDoc> =
  models.MediaAsset ?? model<MediaAssetDoc>("MediaAsset", mediaAssetSchema);
