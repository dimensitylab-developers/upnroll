"use client";

import { useActionState } from "react";
import { withdrawRegistrationAction, type RegistrationActionState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: RegistrationActionState = {};

export function WithdrawButton({ registrationId }: { registrationId: string }) {
  const [state, formAction, pending] = useActionState(withdrawRegistrationAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="registrationId" value={registrationId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Withdrawing…" : "Withdraw"}
      </Button>
      {state.error && <span className="text-xs text-primary">{state.error}</span>}
    </form>
  );
}
