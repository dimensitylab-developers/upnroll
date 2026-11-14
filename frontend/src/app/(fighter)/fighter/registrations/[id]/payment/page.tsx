import { notFound } from "next/navigation";
import { actorFromSession, getSession } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getRegistrationForFighter } from "@/server/services/registrationService";
import { canSubmitPayment } from "@/server/services/registrationStateMachine";
import { PaymentForm } from "@/features/payments/payment-form";
import { QrCode } from "lucide-react";
import { PageBackLink } from "@/components/layout/page-back-link";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export default async function RegistrationPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) notFound();

  let data: Awaited<ReturnType<typeof getRegistrationForFighter>>;
  try {
    data = await getRegistrationForFighter(actorFromSession(session), id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  const { registration, event, division, latestSubmission, feeView } = data;
  const eventId = event ? String(event._id) : "";
  const hasQr = Boolean(feeView.qrImageKey);
  const fee = feeView.amountMinorUnits;
  const currency = feeView.currency;
  const qrSrc =
    hasQr && eventId
      ? feeView.paymentOptionId
        ? `/api/v1/fighter/events/${eventId}/payment-qr?registrationId=${id}&paymentOptionId=${feeView.paymentOptionId}`
        : `/api/v1/fighter/events/${eventId}/payment-qr?registrationId=${id}`
      : "";

  return (
    <div className="mx-auto max-w-xl">
      <PageBackLink href="/fighter/registrations" label="Back to registrations" />
      <div className="manga-panel p-5 sm:p-8">
        <div className="mb-4">
          <p className="break-words font-semibold">
            {event?.name} — {division?.name}
          </p>
          {fee > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Entry fee {(fee / 100).toLocaleString("en-IN", { style: "currency", currency })}
              {feeView.paymentOptionLabel ? ` · ${feeView.paymentOptionLabel}` : ""}
              {feeView.couponCode ? ` · coupon ${feeView.couponCode}` : ""}
            </p>
          )}
        </div>

        <p className="mb-4 text-sm text-muted-foreground">
          Registration status:{" "}
          <span className="font-medium text-foreground">{registration.status.replaceAll("_", " ")}</span>
        </p>

        {registration.status === "AWAITING_PAYMENT" ||
        (registration.status === "REJECTED" && canSubmitPayment(registration.status)) ? (
          <>
            {registration.status === "REJECTED" && latestSubmission?.reviewNote && (
              <p className="mb-4 text-sm text-primary" role="alert">
                Previous submission rejected: {latestSubmission.reviewNote}
              </p>
            )}
            <div className="mx-auto mb-4 flex size-48 items-center justify-center overflow-hidden rounded-md border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
              {hasQr && qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrSrc}
                  alt="Payment QR code"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <QrCode className="size-16 text-muted-foreground" />
              )}
            </div>
            <p className="mb-6 text-center text-xs text-muted-foreground">
              {hasQr
                ? "Follow the UPI / QR instructions, pay the entry fee, then submit your UTR and screenshot below."
                : "Organizers have not uploaded a payment QR yet. You can still submit a UTR once you have paid by the house UPI instructions."}
            </p>
            <PaymentForm registrationId={String(registration._id)} />
          </>
        ) : registration.status === "PENDING_VERIFICATION" ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Thank you — payment received for review.</p>
            <p className="text-sm text-muted-foreground">
              An organizer will review your UPI submission before your place is confirmed.
            </p>
          </div>
        ) : registration.status === "CONFIRMED" ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-cyan">Thank you — your place is confirmed.</p>
            <p className="text-sm text-muted-foreground">Payment approved. Your registration is locked for this event.</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No action available for this registration&apos;s current status.</p>
        )}
      </div>
    </div>
  );
}
