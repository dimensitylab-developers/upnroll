"use client";

import { useActionState } from "react";
import { createDivisionAction, type EventActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: EventActionState = {};

export function CreateDivisionForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(createDivisionAction, initialState);

  return (
    <form action={formAction} className="grid sm:grid-cols-2 gap-4">
      <input type="hidden" name="eventId" value={eventId} />
      {state.error && <p className="text-sm text-primary sm:col-span-2">{state.error}</p>}
      <div>
        <Label htmlFor="name" className="mb-1.5 block">Division name</Label>
        <Input id="name" name="name" required placeholder="Lightweight" />
      </div>
      <div>
        <Label htmlFor="discipline" className="mb-1.5 block">Discipline</Label>
        <Input id="discipline" name="discipline" required placeholder="Grappling" />
      </div>
      <div>
        <Label htmlFor="capacity" className="mb-1.5 block">Capacity</Label>
        <Input id="capacity" name="capacity" type="number" min={1} required />
      </div>
      <Button type="submit" className="sm:col-span-2 self-end" disabled={pending}>
        {pending ? "Creating…" : "Create division"}
      </Button>
    </form>
  );
}
