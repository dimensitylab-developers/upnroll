"use client";

import { useActionState, useState } from "react";
import { updateEventStatusAction, type EventActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EVENT_STATUS_OPTIONS } from "./event-status";

const initialState: EventActionState = {};

export function EventStatusForm({ eventId, currentStatus }: { eventId: string; currentStatus: string }) {
  const [state, formAction, pending] = useActionState(updateEventStatusAction, initialState);
  const [status, setStatus] = useState(currentStatus);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="status" value={status} />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
        <SelectContent>
          {EVENT_STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Update status"}</Button>
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
    </form>
  );
}
