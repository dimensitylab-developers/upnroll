"use client";

import { useActionState } from "react";
import { updateEventMatCountAction, type EventActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: EventActionState = {};

export function MatCountForm({ eventId, matCount }: { eventId: string; matCount: number }) {
  const [state, formAction, pending] = useActionState(updateEventMatCountAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="eventId" value={eventId} />
      <div>
        <Label htmlFor="matCount" className="mb-1.5 block">Active mats</Label>
        <Input id="matCount" name="matCount" type="number" min={1} defaultValue={matCount} className="w-28" required />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Assign mats"}</Button>
      {state.error && <p className="text-sm text-primary w-full">{state.error}</p>}
      <p className="text-xs text-muted-foreground w-full">
        Open matches are split across these mats in order. An athlete only sees the mat they are on.
      </p>
    </form>
  );
}
