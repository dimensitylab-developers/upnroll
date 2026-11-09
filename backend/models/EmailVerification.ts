import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const emailVerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export type EmailVerificationDoc = InferSchemaType<typeof emailVerificationSchema>;

export const EmailVerification: Model<EmailVerificationDoc> =
  models.EmailVerification ?? model<EmailVerificationDoc>("EmailVerification", emailVerificationSchema);
