"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { generateBracketAction, type BracketActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown } from "lucide-react";

type Participant = { registrationId: string; displayName: string };

const initialState: BracketActionState = {};

export function ParticipantOrderForm({
  eventId,
  divisionId,
  participants,
}: {
  eventId: string;
  divisionId: string;
  participants: Participant[];
}) {
  const [order, setOrder] = useState(participants);
  const [state, formAction, pending] = useActionState(generateBracketAction, initialState);

  // Default the seed field imperatively after mount, not during render —
  // Date.now() is impure and must not run in the render body.
  const seedInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (seedInputRef.current && !seedInputRef.current.value) {
      seedInputRef.current.value = String(Date.now() % 100000);
    }
  }, []);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  if (participants.length === 0) {
    return <p className="text-sm text-muted-foreground">No confirmed registrations in this division yet.</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="divisionId" value={divisionId} />
      <input type="hidden" name="orderedRegistrationIds" value={order.map((p) => p.registrationId).join(",")} />

      {state.error && <p className="text-sm text-primary">{state.error}</p>}

      <ol className="space-y-1.5">
        {order.map((p, i) => (
          <li key={p.registrationId} className="flex items-center justify-between manga-panel px-3 py-2 text-sm">
            <span>
              <span className="text-muted-foreground mr-2">Seed {i + 1}</span>
              {p.displayName}
            </span>
            <span className="flex gap-1">
              <Button type="button" size="icon" variant="ghost" className="size-6" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="size-3.5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="size-6" disabled={i === order.length - 1} onClick={() => move(i, 1)}>
                <ArrowDown className="size-3.5" />
              </Button>
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" name="mode" value="manual" disabled={pending}>
          {pending ? "Generating…" : "Generate from this order"}
        </Button>
        <span className="text-sm text-muted-foreground">or</span>
        <Input
          ref={seedInputRef}
          name="seed"
          defaultValue=""
          placeholder="seed"
          className="w-28"
          aria-label="Random seed"
        />
        <Button type="submit" name="mode" value="random" variant="outline" disabled={pending}>
          Randomize with this seed
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Regenerating replaces the current draft bracket entirely. Has no effect once published.
      </p>
    </form>
  );
}
