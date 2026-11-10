"use client";

import { useActionState } from "react";
import { updateDivisionAction, type EventActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditDivisionForm({
  eventId,
  divisionId,
  name,
  discipline,
  capacity,
}: {
  eventId: string;
  divisionId: string;
  name: string;
  discipline: string;
  capacity: number;
}) {
  const [state, action, pending] = useActionState(updateDivisionAction, {} as EventActionState);

  return (
    <form action={action} className="grid gap-3 border-t border-black/10 pt-3 sm:grid-cols-[1fr_1fr_5rem_auto]">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="divisionId" value={divisionId} />
      <div className="space-y-1">
        <Label htmlFor={`name-${divisionId}`} className="text-xs">
          Name
        </Label>
        <Input id={`name-${divisionId}`} name="name" defaultValue={name} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`discipline-${divisionId}`} className="text-xs">
          Discipline
        </Label>
        <Input id={`discipline-${divisionId}`} name="discipline" defaultValue={discipline} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`capacity-${divisionId}`} className="text-xs">
          Cap
        </Label>
        <Input id={`capacity-${divisionId}`} name="capacity" type="number" min={1} defaultValue={capacity} required />
      </div>
      <div className="flex items-end">
        <Button type="submit" size="sm" disabled={pending} className="w-full">
          {pending ? "…" : "Save"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-4">{state.error}</p>}
    </form>
  );
}
