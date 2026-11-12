import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin } from "@/server/services/eventService";
import { listCouponsForEvent } from "@/server/services/couponService";
import { listPaymentOptionsForAdmin } from "@/server/services/paymentOptionService";
import { EventPaymentsPanel } from "@/features/payments/event-payments-panel";
import { PageBackLink } from "@/components/layout/page-back-link";
import { PageHeader } from "@/components/page-header";

export const instant = false;

export default async function AdminEventPaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireActor("ADMIN");
  let event;
  try {
    event = await getEventForAdmin(actor, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const [options, coupons] = await Promise.all([
    listPaymentOptionsForAdmin(actor, id),
    listCouponsForEvent(actor, id),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 sm:px-0">
      <PageBackLink href={`/admin/events/${id}`} label="Back to event" />
      <PageHeader title={`Payments — ${event.name}`} />
      <EventPaymentsPanel
        eventId={id}
        options={options}
        coupons={coupons.map((c) => ({
          _id: String(c._id),
          code: c.code,
          status: c.status,
          paymentOptionId: String(c.paymentOptionId),
          effectivelyExpired: Boolean(c.effectivelyExpired),
        }))}
      />
    </div>
  );
}
