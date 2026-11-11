import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const OUTBOX_JOB_TYPES = [
  "MATCH_REMINDER",
  "MATCH_SCHEDULE_CHANGED",
  "MATCH_RESULT_NOTIFY",
  "EMAIL_DISPATCH",
  "RANKINGS_RECALC",
] as const;
export type OutboxJobType = (typeof OUTBOX_JOB_TYPES)[number];

export const OUTBOX_JOB_STATUSES = [
  "PENDING",
  "PROCESSING",
  "DONE",
  "FAILED",
  "CANCELLED",
  "SUPERSEDED",
] as const;
export type OutboxJobStatus = (typeof OUTBOX_JOB_STATUSES)[number];

const outboxJobSchema = new Schema(
  {
    type: { type: String, enum: OUTBOX_JOB_TYPES, required: true, index: true },
    status: { type: String, enum: OUTBOX_JOB_STATUSES, required: true, default: "PENDING", index: true },
    runAt: { type: Date, required: true, index: true },
    attempts: { type: Number, required: true, default: 0, min: 0 },
    maxAttempts: { type: Number, required: true, default: 5, min: 1 },
    lastError: { type: String, default: "" },
    /** Unique business key — duplicate inserts become no-ops / supersede siblings. */
    idempotencyKey: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true, default: {} },
    processingStartedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    supersededBy: { type: Schema.Types.ObjectId, ref: "OutboxJob", default: null },
  },
  { timestamps: true }
);

outboxJobSchema.index({ idempotencyKey: 1 }, { unique: true });
outboxJobSchema.index({ status: 1, runAt: 1 });

export type OutboxJobDoc = InferSchemaType<typeof outboxJobSchema>;

export const OutboxJob: Model<OutboxJobDoc> = models.OutboxJob ?? model<OutboxJobDoc>("OutboxJob", outboxJobSchema);
