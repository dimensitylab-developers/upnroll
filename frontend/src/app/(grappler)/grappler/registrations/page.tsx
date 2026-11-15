import type { Metadata } from "next";
import Link from "next/link";
import { actorFromSession, getSession } from "@/server/auth/session";
import { listMyRegistrations } from "@/server/services/registrationService";
import { Badge } from "@/components/ui/badge";

/** Session/DB-bound route  allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Events" };

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function seatActionLabel(status: string) {
  if (status === "AWAITING_PAYMENT" || status === "REJECTED") return "Pay / upload UTR";
  if (status === "PENDING_VERIFICATION") return "Payment status";
  if (status === "CONFIRMED") return "View seat";
  return "Open";
}

export default async function MyRegistrationsPage() {
  const session = await getSession();
  const registrations = session ? await listMyRegistrations(actorFromSession(session)) : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">Event seats</p>
          <h1 className="text-display mt-1 text-2xl font-semibold sm:text-3xl">Your events</h1>
        </div>
        <Link
          href="/grappler/registrations/new"
          className="inline-flex min-h-10 w-fit -skew-x-12 items-center border-2 border-black bg-brand-red px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#000]"
        >
          <span className="inline-block skew-x-12">New registration</span>
        </Link>
      </div>

      {registrations.length === 0 && (
        <p className="border-2 border-black bg-white px-4 py-6 text-sm text-muted-foreground shadow-[4px_4px_0_0_#000]">
          You have no registrations yet.
        </p>
      )}

      <div className="space-y-3">
        {registrations.map((r) => {
          const status = r.status;
          return (
            <Link
              key={String(r._id)}
              href={`/grappler/registrations/${r._id}/payment`}
              className="block border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#c8102e] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-display text-lg font-semibold sm:text-xl">{r.event?.name ?? "Unknown event"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.division?.name ?? "Unknown division"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Registered{" "}
                    {new Date(r.createdAt as Date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge variant="outline">{statusLabel(status)}</Badge>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-red">
                    {seatActionLabel(status)} →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
