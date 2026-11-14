"use client";

import { useActionState } from "react";
import { seedRoadToSuperFightDivisionsAction, type EventActionState } from "./actions";

const initialState: EventActionState = {};

export function SeedDivisionsButton({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(seedRoadToSuperFightDivisionsAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="eventId" value={eventId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-10 border-2 border-black bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] disabled:opacity-50"
      >
        {pending ? "Seeding…" : "Seed Road to Super Fight divisions"}
      </button>
      {state.error && <p className="text-sm text-brand-red">{state.error}</p>}
    </form>
  );
}
