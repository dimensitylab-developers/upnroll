import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const MATCH_STATUSES = [
  "PENDING",
  "SCHEDULED",
  "LIVE",
  "DELAYED",
  "COMPLETED",
  "BYE",
  "CANCELLED",
  "ERROR",
] as const;
export type MatchStatusDb = (typeof MATCH_STATUSES)[number];

export const MATCH_RESULT_KINDS = ["PROVISIONAL", "OFFICIAL"] as const;
export type MatchResultKind = (typeof MATCH_RESULT_KINDS)[number];

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
    /** PROVISIONAL until judge/admin finalizes; OFFICIAL drives rankings/bracket. */
    resultKind: { type: String, enum: [...MATCH_RESULT_KINDS, null], default: null },
    scheduledAt: { type: Date, default: null },
    /** Bumps when schedule changes so reminder jobs can supersede stale work. */
    scheduleVersion: { type: Number, required: true, default: 0, min: 0 },
    mat: { type: String, default: "" },
    resultRecordedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resultRecordedAt: { type: Date, default: null },
    finalizedByKind: { type: String, enum: ["JUDGE_SESSION", "ADMIN", null], default: null },
    finalizedById: { type: Schema.Types.ObjectId, default: null },
    finalizedAt: { type: Date, default: null },
    correctionHistory: { type: [correctionEntrySchema], default: [] },
    /** Optimistic concurrency for live scoring. */
    scoreVersion: { type: Number, required: true, default: 0, min: 0 },
    scoreEventSeq: { type: Number, required: true, default: 0, min: 0 },
    scoreA: { type: Number, required: true, default: 0 },
    scoreB: { type: Number, required: true, default: 0 },
    penaltiesA: { type: Number, required: true, default: 0 },
    penaltiesB: { type: Number, required: true, default: 0 },
    provisionalWinnerRegistrationId: { type: Schema.Types.ObjectId, ref: "Registration", default: null },
    provisionalResultMethod: { type: String, default: "" },
    /** Set when rankings/bracket side-effects for this official result were applied. */
    effectsAppliedKey: { type: String, default: null },
  },
  { timestamps: true }
);

matchSchema.index({ bracketId: 1, round: 1, order: 1 }, { unique: true });
matchSchema.index({ status: 1 });
matchSchema.index({ eventId: 1, status: 1 });
matchSchema.index({ eventId: 1, scheduledAt: 1, mat: 1 });
matchSchema.index({ competitorARegistrationId: 1, scheduledAt: 1 });
matchSchema.index({ competitorBRegistrationId: 1, scheduledAt: 1 });

export type MatchDoc = InferSchemaType<typeof matchSchema>;

export const Match: Model<MatchDoc> = models.Match ?? model<MatchDoc>("Match", matchSchema);
