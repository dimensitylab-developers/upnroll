import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin, listDivisionsForEvent } from "@/server/services/eventService";
import { CreateDivisionForm } from "@/features/events/create-division-form";
import { SeedDivisionsButton } from "@/features/events/seed-divisions-button";
import { PageBackLink } from "@/components/layout/page-back-link";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export default async function AdminDivisionsPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mx-auto max-w-2xl space-y-8 px-0 sm:px-6">
      <PageBackLink href={`/admin/events/${id}`} label="Back to event" />
      <div className="manga-panel p-5 sm:p-8">
        <h1 className="text-display mb-1 text-2xl font-semibold break-words">Divisions — {event.name}</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Use the seed for the approved Road to Super Fight grid (women ±65 and men bands × beginner/intermediate), or add a custom division below.
        </p>
        <div className="mb-6">
          <SeedDivisionsButton eventId={id} />
        </div>
        <CreateDivisionForm eventId={id} />
      </div>

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
  );
}
