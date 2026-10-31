import { connectDB } from "@/server/db/connect";
import { AuditLog } from "@/server/models/AuditLog";

export async function writeAuditLog(entry: {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  correlationId?: string;
}): Promise<void> {
  await connectDB();
  await AuditLog.create(entry);
}
