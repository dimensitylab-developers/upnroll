import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const judgeSessionSchema = new Schema(
  {
    credentialId: { type: Schema.Types.ObjectId, ref: "MatchJudgeCredential", required: true, index: true },
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true, index: true },
    generation: { type: Number, required: true, min: 1 },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    userAgent: { type: String, default: "" },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

judgeSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type JudgeSessionDoc = InferSchemaType<typeof judgeSessionSchema>;

export const JudgeSession: Model<JudgeSessionDoc> =
  models.JudgeSession ?? model<JudgeSessionDoc>("JudgeSession", judgeSessionSchema);
