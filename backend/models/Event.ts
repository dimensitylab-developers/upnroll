import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const EVENT_STATUSES = ["DRAFT", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

const paymentOptionSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    amountMinorUnits: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    qrImageKey: { type: String, default: "" },
    active: { type: Boolean, required: true, default: true },
    isDefault: { type: Boolean, required: true, default: false },
  },
  { _id: true }
);

const scoringPointRuleSchema = new Schema(
  {
    code: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    points: { type: Number, required: true },
  },
  { _id: false }
);

const scoringPenaltyRuleSchema = new Schema(
  {
    code: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    pointsAgainst: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const scoringOutcomeSchema = new Schema(
  {
    code: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    /** When true, numerical score is ignored and an explicit winner side is required. */
    requiresExplicitWinner: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const scoringRulesSchema = new Schema(
  {
    configured: { type: Boolean, required: true, default: false },
    winByHighestScore: { type: Boolean, required: true, default: false },
    allowTies: { type: Boolean, required: true, default: false },
    points: { type: [scoringPointRuleSchema], default: [] },
    penalties: { type: [scoringPenaltyRuleSchema], default: [] },
    outcomes: { type: [scoringOutcomeSchema], default: [] },
  },
  { _id: false }
);

const eventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    venue: { type: String, default: "" },
    startDate: { type: Date, required: true },
    registrationOpensAt: { type: Date, required: true },
    registrationClosesAt: { type: Date, required: true },
    status: { type: String, enum: EVENT_STATUSES, required: true, default: "DRAFT" },
    matCount: { type: Number, required: true, default: 1, min: 1 },
    /** Timezone for schedule display and reminder copy (IANA). */
    timezone: { type: String, required: true, default: "Asia/Kolkata" },
    /**
     * Legacy single-fee + QR mirror. Kept for backward compatibility; the
     * authoritative multi-option list is `paymentOptions`. The default option
     * is kept in sync by paymentOptionService.
     */
    paymentInstructions: {
      feeMinorUnits: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: "INR" },
      qrImageKey: { type: String, default: "" },
    },
    paymentOptions: { type: [paymentOptionSchema], default: [] },
    scoringRules: { type: scoringRulesSchema, default: () => ({ configured: false }) },
    /** Optional Google Calendar / Sheets / external schedule link. */
    scheduleExternalUrl: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export type EventDoc = InferSchemaType<typeof eventSchema>;
export type PaymentOptionDoc = EventDoc["paymentOptions"] extends (infer U)[] | undefined ? U : never;

export const Event: Model<EventDoc> = models.Event ?? model<EventDoc>("Event", eventSchema);
