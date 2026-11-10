import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const MATCH_STATUSES = ["PENDING", "SCHEDULED", "COMPLETED", "BYE"] as const;
export type MatchStatusDb = (typeof MATCH_STATUSES)[number];

const correctionEntrySchema = new Schema(
  {
    previousWinnerRegistrationId: { type: Schema.Types.ObjectId, ref: "Registration", default: null },
    previousResultMethod: { type: String, default: "" },
    reason: { type: String, required: true },
    correctedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    correctedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const matchSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    divisionId: { type: Schema.Types.ObjectId, ref: "Division", required: true, index: true },
    bracketId: { type: Schema.Types.ObjectId, ref: "Bracket", required: true, index: true },
    round: { type: Number, required: true },
    order: { type: Number, required: true },
    competitorARegistrationId: { type: Schema.Types.ObjectId, ref: "Registration", default: null },
    competitorBRegistrationId: { type: Schema.Types.ObjectId, ref: "Registration", default: null },
    status: { type: String, enum: MATCH_STATUSES, required: true, default: "PENDING" },
    winnerRegistrationId: { type: Schema.Types.ObjectId, ref: "Registration", default: null },
    resultMethod: { type: String, default: "" },
    scheduledAt: { type: Date, default: null },
    mat: { type: String, default: "" },
    resultRecordedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resultRecordedAt: { type: Date, default: null },
    correctionHistory: { type: [correctionEntrySchema], default: [] },
  },
  { timestamps: true }
);

matchSchema.index({ bracketId: 1, round: 1, order: 1 }, { unique: true });
// rankingService.recalculateRankings scans every decided match across the
// whole collection (Match.find({ status: { $in: ["COMPLETED", "BYE"] } })) —
// without this, that query is a full collection scan as match volume grows.
matchSchema.index({ status: 1 });
// Public/admin schedule and results pages filter by event + status together.
matchSchema.index({ eventId: 1, status: 1 });

export type MatchDoc = InferSchemaType<typeof matchSchema>;

export const Match: Model<MatchDoc> = models.Match ?? model<MatchDoc>("Match", matchSchema);
