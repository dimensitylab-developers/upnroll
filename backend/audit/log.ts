import { connectDB } from "@/server/db/connect";
import { AuditLog } from "@/server/models/AuditLog";
import { User } from "@/server/models/User";
import { assertAdmin, type Actor } from "@/server/auth/actor";

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
export async function listRecentAuditLogs(actor: Actor, limit = 8) {
  assertAdmin(actor);
  await connectDB();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).select("action actorId createdAt").lean();

  const actorIds = [...new Set(logs.map((l) => l.actorId).filter(Boolean).map(String))];
  const actors = actorIds.length ? await User.find({ _id: { $in: actorIds } }).select("email").lean() : [];
  const emailByActorId = new Map(actors.map((u) => [String(u._id), u.email]));

  return logs.map((l) => ({
    _id: l._id,
    action: l.action,
    createdAt: l.createdAt,
    actorEmail: l.actorId ? emailByActorId.get(String(l.actorId)) ?? "Unknown user" : "System",
  }));
}
