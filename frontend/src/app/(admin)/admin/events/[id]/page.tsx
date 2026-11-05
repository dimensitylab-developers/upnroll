import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin, listDivisionsForEvent } from "@/server/services/eventService";
import { EventStatusForm } from "@/features/events/event-status-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireActor("ADMIN");
  let event;
  try {
    event = await getEventForAdmin(actor, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const divisions = await listDivisionsForEvent(id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="manga-panel p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <h1 className="text-display text-2xl font-semibold">{event.name}</h1>
          <Badge variant="outline">{event.status.replaceAll("_", " ")}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{event.slug} · {event.venue || "No venue set"}</p>
        <EventStatusForm eventId={id} currentStatus={event.status} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline"><Link href={`/admin/events/${id}/divisions`}>Divisions</Link></Button>
        <Button asChild variant="outline"><Link href={`/admin/events/${id}/brackets`}>Brackets</Link></Button>
        <Button asChild variant="outline"><Link href={`/admin/events/${id}/matches`}>Matches</Link></Button>
      </div>

      <div>
        <h2 className="text-display text-xl font-semibold mb-3">Divisions</h2>
        <div className="space-y-2">
          {divisions.map((d) => (
            <div key={String(d._id)} className="manga-panel p-3 text-sm flex flex-col sm:flex-row sm:justify-between gap-1">
              <span>{d.name} — {d.discipline}</span>
              <span className="text-muted-foreground">Capacity {d.capacity}</span>
            </div>
          ))}
          {divisions.length === 0 && <p className="text-sm text-muted-foreground">No divisions yet.</p>}
        </div>
      </div>
    </div>
  );
}
