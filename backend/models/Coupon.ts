import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const COUPON_STATUSES = ["AVAILABLE", "RESERVED", "REDEEMED", "DISABLED", "EXPIRED"] as const;
export type CouponStatus = (typeof COUPON_STATUSES)[number];

const couponSchema = new Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    paymentOptionId: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, enum: COUPON_STATUSES, required: true, default: "AVAILABLE", index: true },
    expiresAt: { type: Date, default: null },
    intendedUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reservedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reservedUntil: { type: Date, default: null },
    /** Opaque client intent id for an in-progress registration attempt. */
    reservationIntentId: { type: String, default: null },
    redeemedByRegistrationId: { type: Schema.Types.ObjectId, ref: "Registration", default: null },
    redeemedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    disabledAt: { type: Date, default: null },
    disabledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    releasedAt: { type: Date, default: null },
    releasedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    releaseReason: { type: String, default: "" },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, eventId: 1 }, { unique: true });
couponSchema.index({ status: 1, reservedUntil: 1 });
couponSchema.index({ reservedByUserId: 1, status: 1 });

export type CouponDoc = InferSchemaType<typeof couponSchema>;

export const Coupon: Model<CouponDoc> = models.Coupon ?? model<CouponDoc>("Coupon", couponSchema);
