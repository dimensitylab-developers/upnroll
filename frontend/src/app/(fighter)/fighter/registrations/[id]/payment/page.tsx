import { notFound } from "next/navigation";
import { actorFromSession, getSession } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getRegistrationForFighter } from "@/server/services/registrationService";
import { canSubmitPayment } from "@/server/services/registrationStateMachine";
import { PaymentForm } from "@/features/payments/payment-form";
import { QrCode } from "lucide-react";
import { PageBackLink } from "@/components/layout/page-back-link";

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

  const { registration, event, division, latestSubmission } = data;

  return (
    <div className="mx-auto max-w-xl">
      <PageBackLink href="/fighter/registrations" label="Back to registrations" />
      <div className="manga-panel p-5 sm:p-8">
        <div className="mb-4">
          <p className="break-words font-semibold">
            {event?.name} — {division?.name}
          </p>
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
            <div className="mx-auto mb-4 flex size-40 items-center justify-center rounded-md border border-dashed border-black/20 bg-muted">
              <QrCode className="size-16 text-muted-foreground" />
            </div>
            <p className="mb-6 text-center text-xs text-muted-foreground">
              Client-supplied QR image placeholder — pending OD-006.
            </p>
            <PaymentForm registrationId={String(registration._id)} />
          </>
        ) : registration.status === "PENDING_VERIFICATION" ? (
          <p className="text-sm text-muted-foreground">
            Your payment submission is pending manual review by an organizer. This is not yet confirmation of payment.
          </p>
        ) : registration.status === "CONFIRMED" ? (
          <p className="text-sm text-brand-cyan">Payment approved — your registration is confirmed.</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No action available for this registration&apos;s current status.
          </p>
        )}
      </div>
    </div>
  );
}
