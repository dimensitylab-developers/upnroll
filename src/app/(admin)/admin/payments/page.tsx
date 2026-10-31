import { listPaymentQueue } from "@/server/services/paymentService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { PaymentReviewDialog } from "@/features/admin-payments/payment-review-dialog";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  AWAITING_SUBMISSION: "outline",
};

export default async function AdminPaymentsPage() {
  const queue = await listPaymentQueue();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-6">Payment verification</h1>
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
            <TableRow key={p.id}>
              <TableCell>{p.user?.email ?? "Unknown"}</TableCell>
              <TableCell>{p.event?.name ?? "Unknown"}</TableCell>
              <TableCell>{(p.expectedAmountMinorUnits / 100).toLocaleString(undefined, { style: "currency", currency: p.event?.paymentInstructions?.currency ?? "INR" })}</TableCell>
              <TableCell className="font-mono text-xs flex items-center gap-1.5">
                {p.submittedUtr ?? "—"}
                {p.duplicateUtr && (
                  <span title="Duplicate UTR — flagged for review"><AlertTriangle className="size-3.5 text-brand-gold" /></span>
                )}
              </TableCell>
              <TableCell><Badge variant={statusVariant[p.status]}>{p.status.replaceAll("_", " ")}</Badge></TableCell>
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
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                No payment submissions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
