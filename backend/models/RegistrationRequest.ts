import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const REQUEST_TYPES = ["CANCELLATION", "TRANSFER"] as const;
export const REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

const registrationRequestSchema = new Schema(
  {
    type: { type: String, enum: REQUEST_TYPES, required: true },
    registrationId: { type: Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Only set for TRANSFER requests.
    requestedDivisionId: { type: Schema.Types.ObjectId, ref: "Division", default: null },
    reason: { type: String, required: true },
    status: { type: String, enum: REQUEST_STATUSES, required: true, default: "PENDING" },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
    refundPercent: { type: Number, default: null },
  },
  { timestamps: true }
);

export type RegistrationRequestDoc = InferSchemaType<typeof registrationRequestSchema>;

export const RegistrationRequest: Model<RegistrationRequestDoc> =
  models.RegistrationRequest ?? model<RegistrationRequestDoc>("RegistrationRequest", registrationRequestSchema);
