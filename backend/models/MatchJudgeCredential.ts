import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const JUDGE_CREDENTIAL_STATUSES = ["ACTIVE", "REVOKED"] as const;
export type JudgeCredentialStatus = (typeof JUDGE_CREDENTIAL_STATUSES)[number];

const matchJudgeCredentialSchema = new Schema(
  {
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 10, maxlength: 10 },
    passwordHash: { type: String, required: true },
    /** Increments on each regenerate; sessions must match the current generation. */
    generation: { type: Number, required: true, default: 1, min: 1 },
    status: { type: String, enum: JUDGE_CREDENTIAL_STATUSES, required: true, default: "ACTIVE" },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issuedAt: { type: Date, required: true, default: Date.now },
    revokedAt: { type: Date, default: null },
    revokedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

matchJudgeCredentialSchema.index({ matchId: 1, status: 1 });

export type MatchJudgeCredentialDoc = InferSchemaType<typeof matchJudgeCredentialSchema>;

export const MatchJudgeCredential: Model<MatchJudgeCredentialDoc> =
  models.MatchJudgeCredential ?? model<MatchJudgeCredentialDoc>("MatchJudgeCredential", matchJudgeCredentialSchema);
