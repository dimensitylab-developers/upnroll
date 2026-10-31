"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { previewPaymentQueue } from "@/lib/preview/fixtures";
import { AlertTriangle } from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  AWAITING_SUBMISSION: "outline",
};

export function PaymentVerification() {
  const [queue] = useState(previewPaymentQueue);

  return (
    <Chapter id="payment-verification" title="Payment Verification" subtitle="Admin review queue. Approve/reject here would be idempotent, server-checked, and audit-logged in production — this view simulates the decision UI only.">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fighter</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>UTR</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queue.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.fighter}</TableCell>
              <TableCell>{p.division}</TableCell>
              <TableCell>₹{p.amount}</TableCell>
              <TableCell className="font-mono text-xs flex items-center gap-1.5">
                {p.utr}
                {p.duplicateFlag && (
                  <span title="Duplicate UTR — flagged for review"><AlertTriangle className="size-3.5 text-brand-gold" /></span>
                )}
              </TableCell>
              <TableCell><Badge variant={statusVariant[p.status]}>{p.status.replaceAll("_", " ")}</Badge></TableCell>
              <TableCell>
                {p.status === "PENDING_REVIEW" ? (
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm" variant="outline">Review</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Review payment — {p.fighter}</DialogTitle>
                        <DialogDescription>
                          Check UTR {p.utr} against the organizer&apos;s actual bank/UPI records before deciding.
                          {p.duplicateFlag && " This UTR also appears on another submission — verify carefully."}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="h-32 rounded-md border border-dashed border-black/20 flex items-center justify-center text-xs text-muted-foreground">
                        Payment screenshot preview (private, admin-only)
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="destructive">Reject</Button>
                        <Button>Approve</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <span className="text-xs text-muted-foreground">Decided</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FixtureBadge>No real approval/rejection is recorded — this is a decision-UI simulation</FixtureBadge>
    </Chapter>
  );
}
