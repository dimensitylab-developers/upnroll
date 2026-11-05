"use client";

import { useActionState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { claimTeammateTransferAction, type RequestActionState } from "@/features/requests/actions";
import { Button } from "@/components/ui/button";

const initialState: RequestActionState = {};

export default function ClaimTransferPage() {
  const params = useParams<{ token: string }>();
  const [state, formAction, pending] = useActionState(claimTeammateTransferAction, initialState);

  return (
    <div className="manga-panel p-8 max-w-lg mx-auto space-y-4">
      <h1 className="text-display text-2xl font-semibold">Take a teammate&apos;s spot</h1>
      <p className="text-sm text-muted-foreground">
        This is free. You replace them in the same division and the same bracket spot. They are no longer on the card.
      </p>
      {state.success ? (
        <p className="text-sm">
          The spot is yours. <Link href="/fighter/dashboard" className="underline">Go to your dashboard</Link>.
        </p>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="token" value={params.token} />
          {state.error && <p className="text-sm text-primary">{state.error}</p>}
          <Button type="submit" disabled={pending}>{pending ? "Taking the spot…" : "Take this spot"}</Button>
        </form>
      )}
    </div>
  );
}
