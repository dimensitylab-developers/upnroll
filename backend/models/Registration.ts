import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const REGISTRATION_STATUSES = [
  "AWAITING_PAYMENT",
  "PENDING_VERIFICATION",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export const ACTIVE_REGISTRATION_STATUSES: RegistrationStatus[] = ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"];

const feeSnapshotSchema = new Schema(
  {
    amountMinorUnits: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    paymentOptionId: { type: Schema.Types.ObjectId, default: null },
    paymentOptionLabel: { type: String, default: "" },
    qrImageKey: { type: String, default: "" },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponCode: { type: String, default: "" },
    snapshottedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const registrationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    divisionId: { type: Schema.Types.ObjectId, ref: "Division", required: true, index: true },
    status: { type: String, enum: REGISTRATION_STATUSES, required: true, default: "AWAITING_PAYMENT" },
    consentAcceptedAt: { type: Date, default: null },
    agreementAcceptedAt: { type: Date, default: null },
    /** Authoritative fee/QR/coupon capture at registration time — later fee edits must not rewrite this. */
    feeSnapshot: { type: feeSnapshotSchema, default: null },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: REGISTRATION_STATUSES, required: true },
          at: { type: Date, required: true, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

registrationSchema.index(
  { userId: 1, divisionId: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ACTIVE_REGISTRATION_STATUSES } } }
);

export type RegistrationDoc = InferSchemaType<typeof registrationSchema>;

export const Registration: Model<RegistrationDoc> =
  models.Registration ?? model<RegistrationDoc>("Registration", registrationSchema);
