import Link from "next/link";
import { listEventsForAdmin } from "@/server/services/eventService";
import { Badge } from "@/components/ui/badge";
import { CreateEventForm } from "@/features/events/create-event-form";

export default async function AdminEventsPage() {
  const events = await listEventsForAdmin();

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="manga-panel p-8">
        <h1 className="text-display text-2xl font-semibold mb-6">Create event</h1>
        <CreateEventForm />
      </div>

      <div>
        <h2 className="text-display text-xl font-semibold mb-4">Events</h2>
        <div className="space-y-3">
          {events.map((e) => (
            <Link key={String(e._id)} href={`/admin/events/${e._id}`} className="manga-panel p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.slug}</p>
              </div>
              <Badge variant="outline">{e.status.replaceAll("_", " ")}</Badge>
            </Link>
          ))}
          {events.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
        </div>
      </div>
    </div>
  );
}
