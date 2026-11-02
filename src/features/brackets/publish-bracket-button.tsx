"use client";

import { useActionState } from "react";
import { publishBracketAction, type BracketActionState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: BracketActionState = {};

export function PublishBracketButton({ eventId, bracketId }: { eventId: string; bracketId: string }) {
  const [state, formAction, pending] = useActionState(publishBracketAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="bracketId" value={bracketId} />
      {state.error && <p className="text-sm text-primary mb-2">{state.error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Publishing…" : "Publish bracket"}</Button>
    </form>
  );
}
