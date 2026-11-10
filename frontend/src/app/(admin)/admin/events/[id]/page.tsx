import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin, listDivisionsForEvent } from "@/server/services/eventService";
import { EventStatusForm } from "@/features/events/event-status-form";
import { MatCountForm } from "@/features/events/mat-count-form";
import { EditEventForm } from "@/features/events/edit-event-form";
import { EditDivisionForm } from "@/features/events/edit-division-form";
import { PaymentQrForm } from "@/features/events/payment-qr-form";
import { listRegistrationsForEvent } from "@/server/services/registrationService";
import { isActiveRegistration } from "@/server/services/registrationStateMachine";
import { WithdrawButton } from "@/features/registrations/withdraw-button";
import { AdminEmpty } from "@/features/admin/ui/admin-empty";
import { AdminSection } from "@/features/admin/ui/admin-section";
import { AdminStamp } from "@/features/admin/ui/admin-stamp";
import { Badge } from "@/components/ui/badge";
import { PageBackLink } from "@/components/layout/page-back-link";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

const DOORS = [
  { path: "divisions", label: "Divisions" },
  { path: "brackets", label: "Brackets" },
  { path: "matches", label: "Matches" },
] as const;

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
  const [divisions, registrations] = await Promise.all([listDivisionsForEvent(id), listRegistrationsForEvent(actor, id)]);
  const hasQr = Boolean(event.paymentInstructions?.qrImageKey);

  return (
    <div className="space-y-10">
      <PageBackLink href="/admin/events" label="Back to events" />

      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Event hub</p>
            <h1 className="text-display mt-2 text-3xl font-semibold break-words">{event.name}</h1>
            <p className="mt-2 text-sm text-white/70">
              {event.slug} · {event.venue || "Venue TBA"} ·{" "}
              {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Badge className="border-white bg-brand-red text-white">{event.status.replaceAll("_", " ")}</Badge>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {DOORS.map((door) => (
            <Link
              key={door.path}
              href={`/admin/events/${id}/${door.path}`}
              className="inline-flex -skew-x-12 border-2 border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black shadow-[4px_4px_0_0_#c8102e]"
            >
              <span className="inline-block skew-x-12">{door.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
          <AdminStamp>Status & mats</AdminStamp>
          <EventStatusForm eventId={id} currentStatus={event.status} />
          <div className="mt-6">
            <MatCountForm eventId={id} matCount={event.matCount ?? 1} />
          </div>
        </div>
        <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
          <AdminStamp>Payment QR</AdminStamp>
          <p className="mb-4 text-sm text-muted-foreground">Fighters see this image on the payment page once it is uploaded.</p>
          <PaymentQrForm eventId={id} hasQr={hasQr} />
        </div>
      </div>

      <AdminSection title="Overview">
        <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
          <EditEventForm
            eventId={id}
            name={event.name}
            description={event.description ?? ""}
            venue={event.venue ?? ""}
            startDate={event.startDate}
            registrationOpensAt={event.registrationOpensAt}
            registrationClosesAt={event.registrationClosesAt}
            feeMinorUnits={event.paymentInstructions?.feeMinorUnits ?? 0}
            currency={event.paymentInstructions?.currency ?? "INR"}
          />
        </div>
      </AdminSection>

      <AdminSection title="Divisions" actionHref={`/admin/events/${id}/divisions`} actionLabel="Full divisions page →">
        <div className="space-y-3">
          {divisions.map((d) => (
            <div key={String(d._id)} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
              <p className="text-sm text-muted-foreground">
                Filled {d.filledCount ?? 0} / {d.capacity}
              </p>
              <EditDivisionForm
                eventId={id}
                divisionId={String(d._id)}
                name={d.name}
                discipline={d.discipline}
                capacity={d.capacity}
              />
            </div>
          ))}
          {divisions.length === 0 && <AdminEmpty>No divisions yet. Create them on the divisions page.</AdminEmpty>}
        </div>
      </AdminSection>

      <AdminSection title="Registrations">
        <p className="mb-4 text-sm text-muted-foreground">
          Open a fighter sheet for the full registration profile. Withdraw incomplete or unpaid spots so the bracket stays clean.
        </p>
        <div className="space-y-3">
          {registrations.map((registration) => (
            <article key={String(registration._id)} className="border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Full name (as per ID)</p>
                  <p className="text-display text-xl font-semibold">{registration.fighterName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{registration.divisionName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground">{registration.status.replaceAll("_", " ")}</span>
                  {registration.fighter ? (
                    <Link
                      href={`/admin/fighters/${registration.fighter.userId}`}
                      className="text-xs font-semibold uppercase tracking-wider text-brand-red"
                    >
                      Open sheet →
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">No profile yet</span>
                  )}
                  {isActiveRegistration(registration.status) && <WithdrawButton registrationId={String(registration._id)} />}
                </div>
              </div>
            </article>
          ))}
          {registrations.length === 0 && <AdminEmpty>No registrations yet.</AdminEmpty>}
        </div>
      </AdminSection>
    </div>
  );
}
