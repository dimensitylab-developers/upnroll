import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const PAYMENT_SUBMISSION_STATUSES = [
  "AWAITING_SUBMISSION",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;
export type PaymentSubmissionStatus = (typeof PAYMENT_SUBMISSION_STATUSES)[number];

const paymentSubmissionSchema = new Schema(
  {
    registrationId: { type: Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    // Server-derived at creation time from Division/Event — never trust client input (Part E).
    expectedAmountMinorUnits: { type: Number, required: true, min: 0 },
    submittedUtr: { type: String, default: null, index: true },
    screenshotStorageKey: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    status: { type: String, enum: PAYMENT_SUBMISSION_STATUSES, required: true, default: "AWAITING_SUBMISSION" },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export type PaymentSubmissionDoc = InferSchemaType<typeof paymentSubmissionSchema>;

export const PaymentSubmission: Model<PaymentSubmissionDoc> =
  models.PaymentSubmission ?? model<PaymentSubmissionDoc>("PaymentSubmission", paymentSubmissionSchema);
