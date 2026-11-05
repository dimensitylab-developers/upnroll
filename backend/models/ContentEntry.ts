import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const CONTENT_TYPES = ["FAQ", "ANNOUNCEMENT", "POLICY"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

const contentEntrySchema = new Schema(
  {
    type: { type: String, enum: CONTENT_TYPES, required: true },
    // For FAQ entries, title holds the question and body holds the answer.
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    publicationState: { type: String, enum: ["DRAFT", "PUBLISHED"], required: true, default: "DRAFT" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// contentService.listPublished(type) always filters on both fields together
// (the chatbot's FAQ lookup runs on every question asked).
contentEntrySchema.index({ type: 1, publicationState: 1 });

export type ContentEntryDoc = InferSchemaType<typeof contentEntrySchema>;

export const ContentEntry: Model<ContentEntryDoc> =
  models.ContentEntry ?? model<ContentEntryDoc>("ContentEntry", contentEntrySchema);
