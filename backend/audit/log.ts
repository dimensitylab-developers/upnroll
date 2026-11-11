import { connectDB } from "@/server/db/connect";
import { sessionOpts, type DbSession } from "@/server/db/transaction";
import { AuditLog } from "@/server/models/AuditLog";
import { User } from "@/server/models/User";
import { FighterProfile } from "@/server/models/FighterProfile";
import { assertAdmin, type Actor } from "@/server/auth/actor";

export async function writeAuditLog(entry: {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  before?: unknown;
  after?: unknown;
  correlationId?: string;
}, session?: DbSession): Promise<void> {
  await connectDB();
  await AuditLog.create([entry], sessionOpts(session));
}

type AuditRow = {
  _id: unknown;
  action: string;
  createdAt: Date;
  actorEmail: string;
  detail?: string;
};

function startOfLocalDay(now = new Date()) {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  return day;
}

async function enrichAuditRows(
  logs: Array<{ _id: unknown; action: string; actorId?: unknown; createdAt?: Date }>
): Promise<AuditRow[]> {
  const actorIds = [...new Set(logs.map((l) => l.actorId).filter(Boolean).map(String))];
  const [actors, profiles] = await Promise.all([
    actorIds.length ? User.find({ _id: { $in: actorIds } }).select("email").lean() : [],
    actorIds.length
      ? FighterProfile.find({ userId: { $in: actorIds } }).select("displayName userId").lean()
      : [],
  ]);
  const emailById = new Map(actors.map((u) => [String(u._id), u.email]));
  const nameByUserId = new Map(profiles.map((p) => [String(p.userId), p.displayName]));

  return logs.map((l) => {
    const actorId = l.actorId ? String(l.actorId) : "";
    const email = actorId ? emailById.get(actorId) ?? "Unknown user" : "System";
    const name = actorId ? nameByUserId.get(actorId) : undefined;
    return {
      _id: l._id,
      action: l.action,
      createdAt: l.createdAt as Date,
      actorEmail: email,
      detail: name && name.trim() ? name : undefined,
    };
  });
}

/** Admin-dashboard feed: most recent audit events, enriched with the actor's email. */
export async function listRecentAuditLogs(actor: Actor, limit = 8) {
  assertAdmin(actor);
  await connectDB();
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("action actorId targetType targetId createdAt")
    .lean();
  return enrichAuditRows(logs);
}

/** Filtered audit timeline for dashboard sections (entries, profiles, etc.). */
export async function listRecentAuditLogsByActions(actor: Actor, actions: string[], limit = 8) {
  assertAdmin(actor);
  await connectDB();
  const logs = await AuditLog.find({ action: { $in: actions } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("action actorId targetType targetId createdAt")
    .lean();
  return enrichAuditRows(logs);
}

/** New accounts for the admin “who signed up” timeline. */
export async function listRecentAccountsForAdmin(actor: Actor, limit = 8) {
  assertAdmin(actor);
  await connectDB();
  const users = await User.find({ role: "FIGHTER" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("email createdAt emailVerified")
    .lean();
  const profiles = await FighterProfile.find({ userId: { $in: users.map((u) => u._id) } })
    .select("displayName userId")
    .lean();
  const nameByUserId = new Map(profiles.map((p) => [String(p.userId), p.displayName]));

  return users.map((u) => ({
    _id: u._id,
    userId: String(u._id),
    email: u.email,
    displayName: nameByUserId.get(String(u._id)) ?? "",
    emailVerified: u.emailVerified !== false,
    createdAt: u.createdAt as Date,
  }));
}

/** Paginated audit feed for the admin audit page. */
export async function listAuditLogsPage(actor: Actor, options: { limit?: number; skip?: number } = {}) {
  assertAdmin(actor);
  const limit = Math.min(100, Math.max(1, options.limit ?? 50));
  const skip = Math.max(0, options.skip ?? 0);
  await connectDB();
  const [logs, total] = await Promise.all([
    AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("action actorId targetType targetId before after createdAt")
      .lean(),
    AuditLog.countDocuments(),
  ]);
  const rows = await enrichAuditRows(logs);
  return {
    rows: logs.map((l, i) => ({
      id: String(l._id),
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId ?? "",
      createdAt: l.createdAt as Date,
      actorEmail: rows[i]?.actorEmail ?? "System",
      actorName: rows[i]?.detail,
      before: l.before,
      after: l.after,
    })),
    total,
    limit,
    skip,
  };
}

/** Counts for the “are people showing up?” strip on the admin home. */
export async function getAdminPresenceStats(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  const since = startOfLocalDay();
  const [entriesToday, newAccountsToday] = await Promise.all([
    AuditLog.countDocuments({ action: "USER_LOGIN", createdAt: { $gte: since } }),
    User.countDocuments({ role: "FIGHTER", createdAt: { $gte: since } }),
  ]);
  return { entriesToday, newAccountsToday };
}
