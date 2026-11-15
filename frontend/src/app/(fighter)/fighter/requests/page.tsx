import type { Metadata } from "next";
import { actorFromSession, getSession } from "@/server/auth/session";
import { listMyRegistrations } from "@/server/services/registrationService";
import { listDivisionsForEvent } from "@/server/services/eventService";
import { listRequestsForFighter } from "@/server/services/requestService";
import { isActiveRegistration } from "@/server/services/registrationStateMachine";
import { CreateRequestDialog } from "@/features/requests/create-request-dialog";
import { TeammateTransferButton } from "@/features/requests/teammate-transfer-button";
import { Badge } from "@/components/ui/badge";

/** Session/DB-bound route  allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Requests" };

export default async function FighterRequestsPage() {
  const session = await getSession();
  if (!session) return null;

  const actor = actorFromSession(session);
  const [registrations, requests] = await Promise.all([
    listMyRegistrations(actor),
    listRequestsForFighter(actor),
  ]);
  const active = registrations.filter((r) => isActiveRegistration(r.status));

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <section className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">House desk</p>
          <h1 className="text-display mt-1 text-2xl font-semibold sm:text-3xl">Cancellation / transfer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask to cancel, move division, or pass your seat to a teammate.
          </p>
        </div>

        <div className="space-y-3">
          {await Promise.all(
            active.map(async (r) => {
              const divisions = r.event ? await listDivisionsForEvent(String(r.event._id)) : [];
              const otherDivisions = divisions
                .filter((d) => String(d._id) !== String(r.divisionId))
                .map((d) => ({ id: String(d._id), name: d.name }));
              return (
                <article
                  key={String(r._id)}
                  className="flex flex-col gap-4 border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <p className="text-display text-lg font-semibold">{r.event?.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.division?.name}</p>
                    <div className="mt-2">
                      <Badge variant="outline">{r.status.replaceAll("_", " ")}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                    <CreateRequestDialog registrationId={String(r._id)} otherDivisions={otherDivisions} />
                    <TeammateTransferButton registrationId={String(r._id)} />
                  </div>
                </article>
              );
            })
          )}
          {active.length === 0 && (
            <p className="border-2 border-black bg-white px-4 py-6 text-sm text-muted-foreground shadow-[4px_4px_0_0_#000]">
              No active registrations to request changes for.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">History</p>
          <h2 className="text-display mt-1 text-xl font-semibold sm:text-2xl">Your requests</h2>
        </div>
        <div className="space-y-3">
          {requests.map((r) => (
            <article key={String(r._id)} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{r.type.replaceAll("_", " ")}</p>
                <Badge
                  variant={
                    r.status === "APPROVED" ? "default" : r.status === "REJECTED" ? "destructive" : "secondary"
                  }
                >
                  {r.status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.reason}</p>
              {r.reviewNote && <p className="mt-1 text-sm text-muted-foreground">Admin note: {r.reviewNote}</p>}
              {r.type === "CANCELLATION" && r.status === "APPROVED" && (
                <p className="mt-2 text-sm font-medium">Refund: {r.refundPercent ?? 0}%.</p>
              )}
            </article>
          ))}
          {requests.length === 0 && (
            <p className="border-2 border-black bg-white px-4 py-6 text-sm text-muted-foreground shadow-[4px_4px_0_0_#000]">
              No requests submitted yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
