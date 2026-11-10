"use client";

import { useActionState } from "react";
import { updateEventDetailsAction, type EventActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toLocalInput(value: Date | string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function EditEventForm({
  eventId,
  name,
  description,
  venue,
  startDate,
  registrationOpensAt,
  registrationClosesAt,
  feeMinorUnits,
  currency,
}: {
  eventId: string;
  name: string;
  description: string;
  venue: string;
  startDate: Date | string;
  registrationOpensAt: Date | string;
  registrationClosesAt: Date | string;
  feeMinorUnits: number;
  currency: string;
}) {
  const [state, action, pending] = useActionState(updateEventDetailsAction, {} as EventActionState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="currency" value={currency || "INR"} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="name">Event name</Label>
          <Input id="name" name="name" defaultValue={name} required />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={description} rows={3} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="venue">Venue</Label>
          <Input id="venue" name="venue" defaultValue={venue} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="feeAmount">Fee (INR)</Label>
          <Input id="feeAmount" name="feeAmount" defaultValue={(feeMinorUnits / 100).toFixed(2)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start</Label>
          <Input id="startDate" name="startDate" type="datetime-local" defaultValue={toLocalInput(startDate)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="registrationOpensAt">Registration opens</Label>
          <Input
            id="registrationOpensAt"
            name="registrationOpensAt"
            type="datetime-local"
            defaultValue={toLocalInput(registrationOpensAt)}
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="registrationClosesAt">Registration closes</Label>
          <Input
            id="registrationClosesAt"
            name="registrationClosesAt"
            type="datetime-local"
            defaultValue={toLocalInput(registrationClosesAt)}
            required
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save event details"}
      </Button>
    </form>
  );
}
