import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin, listDivisionsForEvent } from "@/server/services/eventService";
import { EventStatusForm } from "@/features/events/event-status-form";
import { MatCountForm } from "@/features/events/mat-count-form";
import { listRegistrationsForEvent } from "@/server/services/registrationService";
import { isActiveRegistration } from "@/server/services/registrationStateMachine";
import { WithdrawButton } from "@/features/registrations/withdraw-button";
import { FighterRecord } from "@/features/admin/fighter-record";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageBackLink } from "@/components/layout/page-back-link";

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
  const [divisions, registrations] = await Promise.all([
    listDivisionsForEvent(id),
    listRegistrationsForEvent(actor, id),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-0 sm:px-6">
      <PageBackLink href="/admin/events" label="Back to events" />
      <div className="manga-panel p-5 sm:p-8">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-display text-2xl font-semibold break-words">{event.name}</h1>
          <Badge variant="outline">{event.status.replaceAll("_", " ")}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{event.slug} · {event.venue || "No venue set"}</p>
        <EventStatusForm eventId={id} currentStatus={event.status} />
        <div className="mt-6">
          <MatCountForm eventId={id} matCount={event.matCount ?? 1} />
        </div>
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

      <div>
        <h2 className="text-display text-xl font-semibold mb-3">Registrations</h2>
        <p className="text-sm text-muted-foreground mb-3">
          The full form is listed with each entry. Withdraw an incomplete, abandoned, or unpaid registration so the bracket stays intact.
        </p>
        <div className="space-y-4">
          {registrations.map((registration) => (
            <article key={String(registration._id)} className="manga-panel p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <span className="font-medium">{registration.fighterName} — {registration.divisionName}</span>
                <span className="flex items-center gap-3">
                  <span className="text-muted-foreground">{registration.status.replaceAll("_", " ")}</span>
                  {isActiveRegistration(registration.status) && <WithdrawButton registrationId={String(registration._id)} />}
                </span>
              </div>
              {registration.fighter ? (
                <FighterRecord fighter={registration.fighter} />
              ) : (
                <p className="text-sm text-muted-foreground">This registration has no fighter profile yet.</p>
              )}
            </article>
          ))}
          {registrations.length === 0 && <p className="text-sm text-muted-foreground">No registrations yet.</p>}
        </div>
      </div>
    </div>
  );
}
