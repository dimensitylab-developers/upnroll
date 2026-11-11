"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  type NotificationActionState,
} from "./actions";
import { Button } from "@/components/ui/button";

type Row = {
  _id: string;
  title: string;
  body: string;
  href?: string;
  readAt?: Date | string | null;
  createdAt: Date | string;
};

export function FighterNotificationsList({ items }: { items: Row[] }) {
  const [, markRead, marking] = useActionState(markNotificationReadAction, {} as NotificationActionState);

  return (
    <div className="space-y-4">
      <form action={markAllNotificationsReadAction}>
        <Button type="submit" size="sm" variant="outline" className="border-2 border-black">
          Mark all read
        </Button>
      </form>
      <ul className="space-y-3">
        {items.map((n) => (
          <li
            key={n._id}
            className={`border-2 border-black p-4 shadow-[4px_4px_0_0_#000] ${n.readAt ? "bg-white" : "bg-brand-red/5"}`}
          >
            <p className="text-display font-semibold">{n.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {n.href && (
                <Link href={n.href} className="text-xs font-semibold uppercase tracking-wider text-brand-red">
                  Open →
                </Link>
              )}
              {!n.readAt && (
                <form action={markRead}>
                  <input type="hidden" name="notificationId" value={n._id} />
                  <Button type="submit" size="sm" disabled={marking} variant="outline" className="border-2 border-black">
                    Mark read
                  </Button>
                </form>
              )}
            </div>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No notifications yet.</p>}
      </ul>
    </div>
  );
}
