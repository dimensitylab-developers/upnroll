import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin } from "@/server/services/eventService";
import { ScoringRulesForm } from "@/features/scoring/scoring-rules-form";
import type { ScoringRulesConfig } from "@/server/services/tournamentRules";
import { PageBackLink } from "@/components/layout/page-back-link";
import { PageHeader } from "@/components/page-header";

export const instant = false;

export default async function AdminScoringRulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireActor("ADMIN");
  let event;
  try {
    event = await getEventForAdmin(actor, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageBackLink href={`/admin/events/${id}`} label="Back to event" />
      <PageHeader title={`Scoring rules — ${event.name}`} />
      <ScoringRulesForm eventId={id} rules={event.scoringRules as ScoringRulesConfig | undefined} />
    </div>
  );
}
