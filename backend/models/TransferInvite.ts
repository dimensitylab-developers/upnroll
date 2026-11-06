import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const transferInviteSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
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
