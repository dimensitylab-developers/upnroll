import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const EVENT_STATUSES = ["DRAFT", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

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
    paymentInstructions: {
      feeMinorUnits: { type: Number, required: true, min: 0 },
      currency: { type: String, required: true, default: "INR" },
      qrImageKey: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export type EventDoc = InferSchemaType<typeof eventSchema>;

export const Event: Model<EventDoc> = models.Event ?? model<EventDoc>("Event", eventSchema);
