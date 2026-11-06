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
  const [consent, setConsent] = useState(false);
  const [agreement, setAgreement] = useState(false);

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
          <SelectTrigger id="divisionId" aria-label="Division"><SelectValue placeholder="Select a division" /></SelectTrigger>
          <SelectContent>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.eventName} — {d.name} ({d.discipline})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <input type="hidden" name="consent" value={consent ? "yes" : ""} />
      <input type="hidden" name="agreement" value={agreement ? "yes" : ""} />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Consent. I agree to compete under the published rules and I accept the risks of combat sports.</span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={agreement} onChange={(e) => setAgreement(e.target.checked)} />
        <span>Agreement. I agree to the cancellation rule: a cancellation one month before the event is a 50% refund. Inside that month there is no refund.</span>
      </label>
      <Button type="submit" disabled={pending || !divisionId || !consent || !agreement}>
        {pending ? "Registering…" : "Continue to payment"}
      </Button>
    </form>
  );
}
