"use client";

import { useActionState } from "react";
import { submitPaymentAction, type SubmitPaymentActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SubmitPaymentActionState = {};

export function PaymentForm({ registrationId }: { registrationId: string }) {
  const [state, formAction, pending] = useActionState(submitPaymentAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="registrationId" value={registrationId} />
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-cyan">Submitted — awaiting admin review.</p>}
      <div>
        <Label htmlFor="utr" className="mb-1.5 block">UTR / transaction reference</Label>
        <Input id="utr" name="utr" required placeholder="e.g. 409872165310" />
      </div>
      <div>
        <Label htmlFor="screenshot" className="mb-1.5 block">Payment screenshot</Label>
        <Input id="screenshot" name="screenshot" type="file" accept="image/png,image/jpeg,image/webp" required />
        <p className="text-xs text-muted-foreground mt-1">PNG, JPEG, or WEBP, up to 5MB.</p>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
