import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const NOTIFICATION_TYPES = [
  "MATCH_REMINDER_10M",
  "MATCH_STARTING_SOON",
  "MATCH_SCHEDULE_CHANGED",
  "MATCH_CANCELLED",
  "MATCH_RESULT",
  "PAYMENT_DECISION",
  "GENERIC",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    href: { type: String, default: "" },
    readAt: { type: Date, default: null },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", default: null },
    matchId: { type: Schema.Types.ObjectId, ref: "Match", default: null },
    /** Dedup key for a specific delivery intent (e.g. matchId+type+scheduleVersion). */
    dedupeKey: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });
notificationSchema.index({ dedupeKey: 1 }, { unique: true });

export type NotificationDoc = InferSchemaType<typeof notificationSchema>;

export const Notification: Model<NotificationDoc> =
  models.Notification ?? model<NotificationDoc>("Notification", notificationSchema);
