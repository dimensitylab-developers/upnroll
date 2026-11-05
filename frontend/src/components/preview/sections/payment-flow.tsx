"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { previewEvent } from "@/lib/preview/fixtures";
import { QrCode, UploadCloud, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { PaymentReviewStatus } from "@/lib/preview/fixtures";

const states: { key: PaymentReviewStatus; label: string }[] = [
  { key: "AWAITING_SUBMISSION", label: "Awaiting submission" },
  { key: "PENDING_REVIEW", label: "Pending review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

export function PaymentFlow() {
  const [state, setState] = useState<PaymentReviewStatus>("AWAITING_SUBMISSION");
  const [utr, setUtr] = useState("");

  return (
    <Chapter
      id="qr-payment"
      title="QR Payment"
      subtitle="Manual verification flow per Part E — a submitted screenshot and UTR are claims, not proof of payment. Nothing here is auto-approved."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {states.map((s) => (
          <Button key={s.key} size="sm" variant={state === s.key ? "default" : "outline"} onClick={() => setState(s.key)}>
            {s.label}
          </Button>
        ))}
      </div>

      <div className="manga-panel p-8 max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">{previewEvent.name}</p>
          <Badge variant="outline">Amount: ₹1,500 (fictional — OD-005)</Badge>
        </div>

        {state === "AWAITING_SUBMISSION" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center size-40 mx-auto bg-muted rounded-md border border-dashed border-black/20">
              <QrCode className="size-16 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-center">Client-supplied QR image placeholder — pending OD-006</p>
            <p className="text-sm text-muted-foreground">
              Pay ₹1,500 using any UPI app, then enter your transaction reference and upload a screenshot below.
            </p>
            <div>
              <Label className="mb-1.5 block">UTR / transaction reference</Label>
              <Input value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. 409872165310" />
            </div>
            <label className="flex items-center gap-2 border border-dashed border-black/20 rounded-md px-3 py-4 text-sm text-muted-foreground cursor-pointer hover:border-black/40">
              <UploadCloud className="size-4" /> Upload payment screenshot
            </label>
            <Button className="w-full" disabled={!utr} onClick={() => setState("PENDING_REVIEW")}>
              Submit for review
            </Button>
          </div>
        )}

        {state === "PENDING_REVIEW" && (
          <div className="text-center py-6">
            <Clock className="size-10 mx-auto text-brand-gold mb-3" />
            <p className="font-semibold">Submitted — pending admin review</p>
            <p className="text-sm text-muted-foreground mt-1">UTR {utr || "409872165310"} is awaiting manual verification against the organizer&apos;s actual payment records.</p>
          </div>
        )}

        {state === "APPROVED" && (
          <div className="text-center py-6">
            <CheckCircle2 className="size-10 mx-auto text-brand-cyan mb-3" />
            <p className="font-semibold">Payment approved — registration confirmed</p>
            <p className="text-sm text-muted-foreground mt-1">Reviewed by admin · 2026-11-18</p>
          </div>
        )}

        {state === "REJECTED" && (
          <div className="text-center py-6 space-y-4">
            <XCircle className="size-10 mx-auto text-primary mb-1" />
            <p className="font-semibold">Payment rejected</p>
            <p className="text-sm text-muted-foreground">Reason: UTR could not be matched to a received payment. Please resubmit with a valid reference.</p>
            <Button variant="outline" onClick={() => setState("AWAITING_SUBMISSION")}>Resubmit payment proof</Button>
          </div>
        )}
      </div>
      <FixtureBadge>A screenshot and UTR are unverified claims here — no payment has actually occurred</FixtureBadge>
    </Chapter>
  );
}
