"use client";

import { useActionState } from "react";
import { createTeammateTransferAction, type RequestActionState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: RequestActionState = {};

export function TeammateTransferButton({ registrationId }: { registrationId: string }) {
  const [state, formAction, pending] = useActionState(createTeammateTransferAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="registrationId" value={registrationId} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Making the link…" : "Give my spot to a teammate"}
      </Button>
      {state.error && <p className="text-xs text-primary">{state.error}</p>}
      {state.link && (
        <p className="text-xs">
          Free transfer link: <a className="underline" href={state.link}>{state.link}</a>
        </p>
      )}
    </form>
  );
}
