import { notFound } from "next/navigation";
import { actorFromSession, getSession } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getRegistrationForFighter } from "@/server/services/registrationService";
import { canSubmitPayment } from "@/server/services/registrationStateMachine";
import { PaymentForm } from "@/features/payments/payment-form";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";

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
  const amount = latestSubmission?.expectedAmountMinorUnits ?? event?.paymentInstructions?.feeMinorUnits ?? 0;
  const currency = event?.paymentInstructions?.currency ?? "INR";

  return (
    <div className="manga-panel p-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold">{event?.name} — {division?.name}</p>
        <Badge variant="outline">
          {(amount / 100).toLocaleString(undefined, { style: "currency", currency })}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Registration status: <span className="text-foreground font-medium">{registration.status.replaceAll("_", " ")}</span>
      </p>

      {registration.status === "AWAITING_PAYMENT" || (registration.status === "REJECTED" && canSubmitPayment(registration.status)) ? (
        <>
          {registration.status === "REJECTED" && latestSubmission?.reviewNote && (
            <p className="text-sm text-primary mb-4">Previous submission rejected: {latestSubmission.reviewNote}</p>
          )}
          <div className="flex items-center justify-center size-40 mx-auto bg-muted rounded-md border border-dashed border-black/20 mb-4">
            <QrCode className="size-16 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground text-center mb-6">
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
        <p className="text-sm text-muted-foreground">No action available for this registration&apos;s current status.</p>
      )}
    </div>
  );
}
