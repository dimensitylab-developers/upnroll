import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Transfer invite tokens are stored only as SHA-256 hashes (`tokenHash`).
 * The raw token is returned once to the creator and never persisted.
 * Legacy documents that still have a plaintext `token` field are ignored by lookups.
 */
const transferInviteSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    registrationId: { type: Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    claimedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    claimedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type TransferInviteDoc = InferSchemaType<typeof transferInviteSchema>;

export const TransferInvite: Model<TransferInviteDoc> =
  models.TransferInvite ?? model<TransferInviteDoc>("TransferInvite", transferInviteSchema);
