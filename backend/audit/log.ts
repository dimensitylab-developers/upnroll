import { connectDB } from "@/server/db/connect";
import { AuditLog } from "@/server/models/AuditLog";
import { User } from "@/server/models/User";

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

/** Admin-dashboard feed: most recent audit events, enriched with the actor's email. */
export async function listRecentAuditLogs(limit = 8) {
  await connectDB();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();

  const actorIds = [...new Set(logs.map((l) => l.actorId).filter(Boolean).map(String))];
  const actors = actorIds.length ? await User.find({ _id: { $in: actorIds } }).lean() : [];
  const emailByActorId = new Map(actors.map((u) => [String(u._id), u.email]));

  return logs.map((l) => ({
    ...l,
    actorEmail: l.actorId ? emailByActorId.get(String(l.actorId)) ?? "Unknown user" : "System",
  }));
}
