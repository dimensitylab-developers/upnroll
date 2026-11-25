import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireActor } from "@/server/auth/session";
import { countPaymentsByStatus, listPaymentQueue } from "@/server/services/paymentService";
import { listEventsForAdmin } from "@/server/services/eventService";
import { PAYMENT_SUBMISSION_STATUSES } from "@/server/models/PaymentSubmission";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { PaymentReviewDialog } from "@/features/admin-payments/payment-review-dialog";
import { PaymentsFilters } from "@/features/admin-payments/payments-filters";
import { AdminStamp } from "@/features/admin/ui/admin-stamp";

/** Session/DB-bound route  allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Payments" };

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  AWAITING_SUBMISSION: "outline",
};

const STATUS_LABELS: Record<(typeof PAYMENT_SUBMISSION_STATUSES)[number], string> = {
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  AWAITING_SUBMISSION: "Awaiting submission",
};

function formatQueueDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildFilterHref(params: {
  status?: string;
  event?: string;
  q?: string;
  from?: string;
  to?: string;
}) {
  const next = new URLSearchParams();
  if (params.status) next.set("status", params.status);
  if (params.event) next.set("event", params.event);
  if (params.q) next.set("q", params.q);
  if (params.from) next.set("from", params.from);
  if (params.to) next.set("to", params.to);
  const qs = next.toString();
  return qs ? `/admin/payments?${qs}` : "/admin/payments";
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    event?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const actor = await requireActor("ADMIN");

  const statusFilter = PAYMENT_SUBMISSION_STATUSES.includes(
    params.status as (typeof PAYMENT_SUBMISSION_STATUSES)[number]
  )
    ? (params.status as (typeof PAYMENT_SUBMISSION_STATUSES)[number])
    : undefined;

  const eventId = params.event?.trim() || undefined;
  const q = params.q?.trim() || "";
  const from = params.from?.trim() || "";
  const to = params.to?.trim() || "";

  const [queue, events, pending] = await Promise.all([
    listPaymentQueue(actor, {
      status: statusFilter,
      eventId,
      q: q || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    listEventsForAdmin(actor),
    countPaymentsByStatus(actor, "PENDING_REVIEW"),
  ]);
  const eventOptions = events.map((event) => ({
    id: String(event._id),
    name: event.name,
  }));
  const sharedParams = {
    event: eventId,
    q: q || undefined,
    from: from || undefined,
    to: to || undefined,
  };
  const hasActiveFilters = Boolean(statusFilter || eventId || q || from || to);

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Money on the mat</p>
        <h1 className="text-display mt-2 text-3xl font-semibold">Payment verification</h1>
        <p className="mt-2 text-sm text-white/70">
          {pending} awaiting review · {queue.length} shown in queue
          {hasActiveFilters ? " (filtered)" : ""}
        </p>
        <p className="mt-3 text-sm text-white/80">
          To create fee tiers or coupon codes, open an event →{" "}
          <Link href="/admin/events" className="font-semibold text-white underline underline-offset-2">
            Fees &amp; coupons
          </Link>
          .
        </p>
      </section>

      <div className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <AdminStamp>Queue</AdminStamp>
          {hasActiveFilters && (
            <Link
              href="/admin/payments"
              className="text-xs font-semibold uppercase tracking-wider text-brand-red underline underline-offset-2"
            >
              Clear filters
            </Link>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href={buildFilterHref(sharedParams)}
            className={`border-2 border-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] ${!statusFilter ? "bg-brand-red text-white" : "bg-white"}`}
          >
            All
          </Link>
          {PAYMENT_SUBMISSION_STATUSES.map((status) => (
            <Link
              key={status}
              href={buildFilterHref({ ...sharedParams, status })}
              className={`border-2 border-black px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] ${statusFilter === status ? "bg-brand-red text-white" : "bg-white"}`}
            >
              {STATUS_LABELS[status]}
            </Link>
          ))}
        </div>

        <Suspense fallback={null}>
          <PaymentsFilters
            events={eventOptions}
            defaultQ={q}
            defaultEventId={eventId ?? ""}
            defaultFrom={from}
            defaultTo={to}
          />
        </Suspense>

        <div className="mt-5 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Grappler</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>UTR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((p) => {
                const when = p.submittedAt ?? p.createdAt;
                return (
                  <TableRow key={p.id} className={p.status === "PENDING_REVIEW" ? "bg-brand-red/5" : undefined}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatQueueDate(when)}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">{p.user?.email ?? "Unknown"}</TableCell>
                    <TableCell className="max-w-[260px]">
                      {p.eventId ? (
                        <Link
                          href={`/admin/events/${String(p.eventId)}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {p.event?.name ?? "Unknown"}
                        </Link>
                      ) : (
                        (p.event?.name ?? "Unknown")
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {(p.expectedAmountMinorUnits / 100).toLocaleString(undefined, {
                        style: "currency",
                        currency: p.event?.paymentInstructions?.currency ?? "INR",
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <span className="inline-flex items-center gap-1.5">
                        {p.submittedUtr ?? "—"}
                        {p.duplicateUtr && (
                          <span title="Duplicate UTR flagged for review">
                            <AlertTriangle className="size-3.5 text-brand-gold" />
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[p.status]}>{p.status.replaceAll("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      {p.status === "PENDING_REVIEW" ? (
                        <PaymentReviewDialog
                          paymentId={p.id}
                          fighterLabel={p.user?.email ?? "Unknown"}
                          utr={p.submittedUtr}
                          duplicateUtr={p.duplicateUtr}
                          hasScreenshot={Boolean(p.screenshotStorageKey)}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">Decided</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {queue.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    {hasActiveFilters ? "No payments match these filters." : "No payment submissions yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
