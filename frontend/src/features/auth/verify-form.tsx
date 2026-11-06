"use client";

import { useActionState } from "react";
import { resendCodeAction, verifyEmailAction, type AuthActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function VerifyForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(verifyEmailAction, initialState);
  const [resend, resendAction, resendPending] = useActionState(resendCodeAction, initialState);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        {state.error && <p className="text-sm text-primary">{state.error}</p>}
        <div>
          <Label htmlFor="code" className="mb-1.5 block">Code</Label>
          <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Checking…" : "Confirm"}
        </Button>
      </form>
      <form action={resendAction}>
        <input type="hidden" name="email" value={email} />
        {resend.error && <p className="text-sm text-muted-foreground mb-2">{resend.error}</p>}
        <Button type="submit" variant="outline" className="w-full" disabled={resendPending}>
          {resendPending ? "Sending…" : "Send a new code"}
        </Button>
      </form>
    </div>
  );
}
