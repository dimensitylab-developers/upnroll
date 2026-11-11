import { requireActor } from "@/server/auth/session";
import { listMyNotifications } from "@/server/services/notificationService";
import { FighterNotificationsList } from "@/features/notifications/fighter-notifications-list";
import { PageBackLink } from "@/components/layout/page-back-link";

export const instant = false;

export default async function FighterNotificationsPage() {
  const actor = await requireActor("FIGHTER");
  const notifications = await listMyNotifications(actor, 50);

  return (
    <div className="mx-auto max-w-2xl">
      <PageBackLink href="/fighter/dashboard" label="Back to desk" />
      <h1 className="text-display mb-6 text-2xl font-semibold">Notifications</h1>
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
