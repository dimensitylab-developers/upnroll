"use client";

import { useActionState, useState } from "react";
import { approvePaymentAction, rejectPaymentAction, type AdminPaymentActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const initialState: AdminPaymentActionState = {};

export function PaymentReviewDialog({
  paymentId,
  fighterLabel,
  utr,
  duplicateUtr,
  hasScreenshot,
}: {
  paymentId: string;
  fighterLabel: string;
  utr: string | null;
  duplicateUtr: boolean;
  hasScreenshot: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [approveState, approveAction, approvePending] = useActionState(approvePaymentAction, initialState);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectPaymentAction, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review payment — {fighterLabel}</DialogTitle>
          <DialogDescription>
            Check UTR {utr ?? "—"} against the organizer&apos;s actual bank/UPI records before deciding.
            {duplicateUtr && " This UTR also appears on another submission — verify carefully."}
          </DialogDescription>
        </DialogHeader>

        {hasScreenshot ? (
          <a
            href={`/api/v1/admin/payments/${paymentId}/screenshot`}
            className="text-sm underline"
          >
            Download payment screenshot
          </a>
        ) : (
          <div className="h-32 rounded-md border border-dashed border-black/20 flex items-center justify-center text-xs text-muted-foreground">
            No screenshot on file
          </div>
        )}

        <form action={approveAction}>
          <input type="hidden" name="paymentId" value={paymentId} />
          {approveState.error && <p className="text-sm text-primary mb-2">{approveState.error}</p>}
          <Button type="submit" className="w-full" disabled={approvePending}>
            {approvePending ? "Approving…" : "Approve"}
          </Button>
        </form>

        <form action={rejectAction} className="space-y-2">
          <input type="hidden" name="paymentId" value={paymentId} />
          <Textarea name="note" placeholder="Reason for rejection (required)" required />
          {rejectState.error && <p className="text-sm text-primary">{rejectState.error}</p>}
          <DialogFooter>
            <Button type="submit" variant="destructive" className="w-full" disabled={rejectPending}>
              {rejectPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
