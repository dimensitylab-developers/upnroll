import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin, listDivisionsForEvent } from "@/server/services/eventService";
import { listEligibleParticipants, getBracketForDivision } from "@/server/services/bracketService";
import { ParticipantOrderForm } from "@/features/brackets/participant-order-form";
import { PublishBracketButton } from "@/features/brackets/publish-bracket-button";
import { BracketView } from "@/features/brackets/bracket-view";
import { Badge } from "@/components/ui/badge";
import { PageBackLink } from "@/components/layout/page-back-link";
import Link from "next/link";

export default async function AdminBracketsPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="mx-auto max-w-4xl space-y-10 px-0 sm:px-6">
      <PageBackLink href={`/admin/events/${id}`} label="Back to event" />
      <h1 className="text-display text-2xl font-semibold break-words">
        Brackets — <Link href={`/admin/events/${id}`} className="underline">{event.name}</Link>
      </h1>

      {divisions.length === 0 && <p className="text-sm text-muted-foreground">No divisions yet — create one first.</p>}

      {await Promise.all(
        divisions.map(async (d) => {
          const divisionId = String(d._id);
          const [participants, existing] = await Promise.all([
            listEligibleParticipants(actor, divisionId),
            getBracketForDivision(actor, divisionId),
          ]);

          return (
            <div key={divisionId} className="manga-panel p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-display text-xl font-semibold">{d.name}</h2>
                {existing && <Badge variant="outline">{existing.bracket.status} · v{existing.bracket.version}</Badge>}
              </div>

              <ParticipantOrderForm eventId={id} divisionId={divisionId} participants={participants} />

              {existing && (
                <div className="mt-6">
                  <BracketView matches={existing.matches} roundsCount={existing.bracket.roundsCount} />
                  {existing.bracket.status === "DRAFT" && (
                    <PublishBracketButton eventId={id} bracketId={String(existing.bracket._id)} />
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
