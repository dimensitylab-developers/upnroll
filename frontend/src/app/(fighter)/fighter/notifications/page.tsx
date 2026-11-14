import { requireActor } from "@/server/auth/session";
import { listMyNotifications } from "@/server/services/notificationService";
import { FighterNotificationsList } from "@/features/notifications/fighter-notifications-list";
import { FightSoonAlert } from "@/components/fighter/fight-soon-alert";
import { PageBackLink } from "@/components/layout/page-back-link";

export const instant = false;

export default async function FighterNotificationsPage() {
  const actor = await requireActor("FIGHTER");
  const notifications = await listMyNotifications(actor, 50);
  const fightSoon = notifications.find((n) => /fight|mat|warm.?up|ready/i.test(`${n.title} ${n.body}`));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageBackLink href="/fighter/dashboard" label="Back to desk" />
      <h1 className="text-display text-2xl font-semibold">Notifications</h1>
      {fightSoon ? <FightSoonAlert href={fightSoon.href || "/fighter/matches"} /> : null}
      <FighterNotificationsList
        items={notifications.map((n) => ({
          _id: String(n._id),
          title: n.title,
          body: n.body,
          href: n.href || undefined,
          readAt: n.readAt,
          createdAt: n.createdAt as Date,
        }))}
      />
    </div>
  );
}
