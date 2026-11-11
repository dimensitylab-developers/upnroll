import type { Metadata } from "next";
import { requireActor } from "@/server/auth/session";
import { listPaymentQueue } from "@/server/services/paymentService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { PaymentReviewDialog } from "@/features/admin-payments/payment-review-dialog";
import { AdminStamp } from "@/features/admin/ui/admin-stamp";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Payments" };

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  AWAITING_SUBMISSION: "outline",
};

export default async function AdminPaymentsPage() {
  const queue = await listPaymentQueue(await requireActor("ADMIN"));
  const pending = queue.filter((p) => p.status === "PENDING_REVIEW").length;

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Money on the mat</p>
        <h1 className="text-display mt-2 text-3xl font-semibold">Payment verification</h1>
        <p className="mt-2 text-sm text-white/70">
          {pending} awaiting review · {queue.length} in the recent queue
        </p>
        <p className="mt-3 text-sm text-white/80">
          To create fee tiers or coupon codes, open an event → <span className="font-semibold text-white">Fees &amp; coupons</span>.
        </p>
      </section>

      <div className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-6">
        <AdminStamp>Queue</AdminStamp>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fighter</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>UTR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((p) => (
                <TableRow key={p.id} className={p.status === "PENDING_REVIEW" ? "bg-brand-red/5" : undefined}>
                  <TableCell>{p.user?.email ?? "Unknown"}</TableCell>
                  <TableCell>{p.event?.name ?? "Unknown"}</TableCell>
                  <TableCell>
                    {(p.expectedAmountMinorUnits / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: p.event?.paymentInstructions?.currency ?? "INR",
                    })}
                  </TableCell>
                  <TableCell className="flex items-center gap-1.5 font-mono text-xs">
                    {p.submittedUtr ?? "—"}
                    {p.duplicateUtr && (
                      <span title="Duplicate UTR — flagged for review">
                        <AlertTriangle className="size-3.5 text-brand-gold" />
                      </span>
                    )}
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
              ))}
              {queue.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No payment submissions yet.
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
