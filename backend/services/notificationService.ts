import "server-only";
import { connectDB } from "@/server/db/connect";
import { Notification, type NotificationType } from "@/server/models/Notification";
import { Match } from "@/server/models/Match";
import { Registration } from "@/server/models/Registration";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Event } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { User } from "@/server/models/User";
import { getEmailAdapter } from "@/server/email/console";
import { assertFighter, assertAdmin, type Actor } from "@/server/auth/actor";
import { NotFoundError } from "@/server/http/errors";
import type { OutboxJobDoc } from "@/server/models/OutboxJob";
import { requireObjectId } from "@/server/validation/objectId";
import { isDuplicateKey as isDup } from "@/server/db/transaction";

async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  eventId?: string | null;
  matchId?: string | null;
  dedupeKey: string;
  meta?: Record<string, unknown>;
}) {
  try {
    return await Notification.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? "",
      eventId: input.eventId ?? null,
      matchId: input.matchId ?? null,
      dedupeKey: input.dedupeKey,
      meta: input.meta ?? {},
    });
  } catch (err) {
    if (isDup(err)) {
      return Notification.findOne({ dedupeKey: input.dedupeKey });
    }
    throw err;
  }
}

export async function listMyNotifications(actor: Actor, limit = 40) {
  assertFighter(actor);
  await connectDB();
  return Notification.find({ userId: actor.userId }).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function markNotificationRead(actor: Actor, notificationId: string) {
  assertFighter(actor);
  requireObjectId(notificationId, "notification");
  await connectDB();
  const n = await Notification.findOne({ _id: notificationId, userId: actor.userId });
  if (!n) throw new NotFoundError("Notification not found.");
  if (!n.readAt) {
    n.readAt = new Date();
    await n.save();
  }
  return n;
}

export async function markAllNotificationsRead(actor: Actor) {
  assertFighter(actor);
  await connectDB();
  await Notification.updateMany({ userId: actor.userId, readAt: null }, { $set: { readAt: new Date() } });
}

export async function countUnreadNotifications(actor: Actor) {
  assertFighter(actor);
  await connectDB();
  return Notification.countDocuments({ userId: actor.userId, readAt: null });
}

async function participantUserIds(match: {
  competitorARegistrationId?: unknown;
  competitorBRegistrationId?: unknown;
}): Promise<string[]> {
  const ids = [match.competitorARegistrationId, match.competitorBRegistrationId].filter(Boolean);
  const regs = await Registration.find({ _id: { $in: ids } }).select("userId").lean();
  return regs.map((r) => String(r.userId));
}

function formatWhen(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export async function processMatchResultNotifyJob(job: OutboxJobDoc & { _id?: unknown }) {
  await connectDB();
  const matchId = String((job.payload as { matchId?: string }).matchId ?? "");
  if (!matchId) return;
  const match = await Match.findById(matchId).lean();
  if (!match || match.status !== "COMPLETED") return;

  const [event, division, userIds] = await Promise.all([
    Event.findById(match.eventId).select("name timezone slug").lean(),
    Division.findById(match.divisionId).select("name").lean(),
    participantUserIds(match),
  ]);
  const profiles = await FighterProfile.find({ userId: { $in: userIds } }).select("displayName userId").lean();
  const nameByUser = new Map(profiles.map((p) => [String(p.userId), p.displayName]));
  const effectsKey = String((job.payload as { effectsKey?: string }).effectsKey ?? match.effectsAppliedKey ?? matchId);

  for (const userId of userIds) {
    await createNotification({
      userId,
      type: "MATCH_RESULT",
      title: `${event?.name ?? "Match"} result posted`,
      body: `Your ${division?.name ?? "division"} match is official (${match.resultMethod || "result"}).`,
      href: `/fighter/matches`,
      eventId: String(match.eventId),
      matchId,
      dedupeKey: `match-result:${effectsKey}:${userId}`,
    });
    const user = await User.findById(userId).select("email").lean();
    if (user?.email) {
      try {
        await getEmailAdapter().send({
          to: user.email,
          subject: `${event?.name ?? "Up 'n Roll"} — match result`,
          body: `Hi ${nameByUser.get(userId) ?? "fighter"},\n\nYour match result is official: ${match.resultMethod || "recorded"}.\n\nOpen your matches: /fighter/matches\n`,
        });
      } catch {
        // Delivery failures are retried via outbox status — do not claim inbox arrival.
      }
    }
  }
}

export async function processScheduleChangedNotifyJob(job: OutboxJobDoc & { _id?: unknown }) {
  await connectDB();
  const matchId = String((job.payload as { matchId?: string }).matchId ?? "");
  const scheduleVersion = Number((job.payload as { scheduleVersion?: number }).scheduleVersion ?? 0);
  if (!matchId) return;
  const match = await Match.findById(matchId).lean();
  if (!match || match.status === "CANCELLED" || match.status === "COMPLETED") return;
  if (match.scheduleVersion !== scheduleVersion) return; // stale

  const [event, division, userIds] = await Promise.all([
    Event.findById(match.eventId).select("name timezone").lean(),
    Division.findById(match.divisionId).select("name").lean(),
    participantUserIds(match),
  ]);
  const tz = event?.timezone ?? "Asia/Kolkata";
  const when = match.scheduledAt ? formatWhen(new Date(match.scheduledAt), tz) : "time TBA";
  const mat = match.mat ? `Mat ${match.mat}` : "mat TBA";

  for (const userId of userIds) {
    await createNotification({
      userId,
      type: "MATCH_SCHEDULE_CHANGED",
      title: "Match schedule updated",
      body: `${event?.name ?? "Event"} · ${division?.name ?? "Division"} · ${mat} · ${when} (${tz})`,
      href: `/fighter/matches`,
      eventId: String(match.eventId),
      matchId,
      dedupeKey: `schedule-change:${matchId}:v${scheduleVersion}:${userId}`,
    });
  }
}

export async function createInAppAndEmailReminder(input: {
  userId: string;
  matchId: string;
  eventId: string;
  type: "MATCH_REMINDER_10M" | "MATCH_STARTING_SOON";
  title: string;
  body: string;
  dedupeKey: string;
  emailSubject: string;
  emailBody: string;
}) {
  await createNotification({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    href: `/fighter/matches`,
    eventId: input.eventId,
    matchId: input.matchId,
    dedupeKey: input.dedupeKey,
  });
  const user = await User.findById(input.userId).select("email").lean();
  if (user?.email) {
    await getEmailAdapter().send({
      to: user.email,
      subject: input.emailSubject,
      body: input.emailBody,
    });
  }
}

export async function listNotificationsForAdmin(actor: Actor, limit = 30) {
  assertAdmin(actor);
  await connectDB();
  return Notification.find().sort({ createdAt: -1 }).limit(limit).lean();
}
