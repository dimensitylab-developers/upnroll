import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const BRACKET_FORMATS = ["SINGLE_ELIMINATION"] as const;
export const BRACKET_STATUSES = ["DRAFT", "PUBLISHED"] as const;

const bracketSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    divisionId: { type: Schema.Types.ObjectId, ref: "Division", required: true, unique: true },
    format: { type: String, enum: BRACKET_FORMATS, required: true, default: "SINGLE_ELIMINATION" },
    seed: { type: Number, required: true },
    participantRegistrationIds: { type: [Schema.Types.ObjectId], default: [] },
    roundsCount: { type: Number, required: true },
    status: { type: String, enum: BRACKET_STATUSES, required: true, default: "DRAFT" },
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

export type BracketDoc = InferSchemaType<typeof bracketSchema>;

export const Bracket: Model<BracketDoc> = models.Bracket ?? model<BracketDoc>("Bracket", bracketSchema);
