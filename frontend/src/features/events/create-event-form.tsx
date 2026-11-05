"use client";

import { useActionState } from "react";
import { createEventAction, type EventActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: EventActionState = {};

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form action={formAction} className="grid sm:grid-cols-2 gap-4">
      {state.error && <p className="text-sm text-primary sm:col-span-2">{state.error}</p>}
      <div>
        <Label htmlFor="name" className="mb-1.5 block">Event name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="slug" className="mb-1.5 block">Slug</Label>
        <Input id="slug" name="slug" required placeholder="underground-arena-vol-5" />
      </div>
      <div>
        <Label htmlFor="venue" className="mb-1.5 block">Venue</Label>
        <Input id="venue" name="venue" />
      </div>
      <div>
        <Label htmlFor="startDate" className="mb-1.5 block">Event date</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>
      <div>
        <Label htmlFor="registrationOpensAt" className="mb-1.5 block">Registration opens</Label>
        <Input id="registrationOpensAt" name="registrationOpensAt" type="date" required />
      </div>
      <div>
        <Label htmlFor="registrationClosesAt" className="mb-1.5 block">Registration closes</Label>
        <Input id="registrationClosesAt" name="registrationClosesAt" type="date" required />
      </div>
      <div>
        <Label htmlFor="feeAmount" className="mb-1.5 block">Registration fee</Label>
        <Input id="feeAmount" name="feeAmount" required placeholder="1500.00" />
      </div>
      <div>
        <Label htmlFor="currency" className="mb-1.5 block">Currency</Label>
        <Input id="currency" name="currency" defaultValue="INR" required />
      </div>
      <Button type="submit" className="sm:col-span-2" disabled={pending}>
        {pending ? "Creating…" : "Create event"}
      </Button>
    </form>
  );
}
