"use client";

import { useActionState, useState } from "react";
import { createRegistrationAction, type RegistrationActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type DivisionOption = {
  id: string;
  name: string;
  discipline: string;
  eventName: string;
};

const initialState: RegistrationActionState = {};

export function NewRegistrationForm({ divisions }: { divisions: DivisionOption[] }) {
  const [state, formAction, pending] = useActionState(createRegistrationAction, initialState);
  // Radix Select doesn't bubble to native FormData by itself — mirror the
  // selection into a hidden input the Server Action can actually read.
  const [divisionId, setDivisionId] = useState("");

  if (divisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No divisions are currently open for registration.</p>;
  }

  return (
    <form action={formAction} className="space-y-4 max-w-sm">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      <div>
        <Label htmlFor="divisionId" className="mb-1.5 block">Division</Label>
        <input type="hidden" name="divisionId" value={divisionId} />
        <Select value={divisionId} onValueChange={setDivisionId}>
          <SelectTrigger id="divisionId"><SelectValue placeholder="Select a division" /></SelectTrigger>
          <SelectContent>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.eventName} — {d.name} ({d.discipline})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending || !divisionId}>{pending ? "Registering…" : "Register"}</Button>
    </form>
  );
}
