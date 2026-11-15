import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: false },
    before: { type: Schema.Types.Mixed, required: false },
    after: { type: Schema.Types.Mixed, required: false },
    correlationId: { type: String, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// audit/log.ts's listRecentAuditLogs/listAuditLogsPage sort the whole collection by createdAt
// on every admin dashboard load and on /admin/audit.
auditLogSchema.index({ createdAt: -1 });
// listRecentAuditLogsByActions and getAdminPresenceStats filter by action + a createdAt range.
auditLogSchema.index({ action: 1, createdAt: -1 });

export type AuditLogDoc = InferSchemaType<typeof auditLogSchema>;

export const AuditLog: Model<AuditLogDoc> =
  models.AuditLog ?? model<AuditLogDoc>("AuditLog", auditLogSchema);
