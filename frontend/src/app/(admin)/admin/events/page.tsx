import type { Metadata } from "next";
import Link from "next/link";
import { requireActor } from "@/server/auth/session";
import { listEventsForAdmin } from "@/server/services/eventService";
import { Badge } from "@/components/ui/badge";
import { CreateEventForm } from "@/features/events/create-event-form";
import { AdminEmpty } from "@/features/admin/ui/admin-empty";
import { AdminSection } from "@/features/admin/ui/admin-section";
import { AdminStamp } from "@/features/admin/ui/admin-stamp";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Events" };

export default async function AdminEventsPage() {
  const events = await listEventsForAdmin(await requireActor("ADMIN"));

  return (
    <div className="space-y-10">
      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Cards</p>
        <h1 className="text-display mt-2 text-3xl font-semibold">Events</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">Create a card, then open its hub to edit details, QR, divisions, brackets, and matches.</p>
      </section>

      <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-8">
        <AdminStamp>Create event</AdminStamp>
        <CreateEventForm />
      </div>

      <AdminSection title="All events">
        <div className="space-y-3">
          {events.map((e) => (
            <Link
              key={String(e._id)}
              href={`/admin/events/${e._id}`}
              className="flex flex-col gap-2 border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#c8102e] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-muted-foreground">
                  {e.slug}
                  {e.venue ? ` · ${e.venue}` : ""}
                  {" · "}
                  {new Date(e.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <Badge variant="outline">{e.status.replaceAll("_", " ")}</Badge>
            </Link>
          ))}
          {events.length === 0 && <AdminEmpty>No events yet.</AdminEmpty>}
        </div>
      </AdminSection>
    </div>
  );
}
