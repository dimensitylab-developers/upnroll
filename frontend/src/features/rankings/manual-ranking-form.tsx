"use client";

import { useActionState } from "react";
import { upsertManualRankingAction, type RankingActionState } from "./actions";

const initialState: RankingActionState = {};

export function ManualRankingForm() {
  const [state, formAction, pending] = useActionState(upsertManualRankingAction, initialState);

  return (
    <form action={formAction} className="space-y-3 border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">Manual ranking entry</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <input name="displayName" required className="mt-1 w-full border-2 border-black px-3 py-2" />
        </label>
        <label className="text-sm">
          Rank number
          <input name="rank" type="number" min={1} required defaultValue={1} className="mt-1 w-full border-2 border-black px-3 py-2" />
        </label>
        <label className="text-sm">
          Weight band
          <input name="weightBand" placeholder="e.g. -65 or 55-65" className="mt-1 w-full border-2 border-black px-3 py-2" />
        </label>
        <label className="text-sm">
          Gender
          <select name="gender" className="mt-1 w-full border-2 border-black px-3 py-2">
            <option value="">—</option>
            <option value="FEMALE">Women</option>
            <option value="MALE">Men</option>
          </select>
        </label>
        <label className="text-sm">
          Experience
          <select name="experienceLevel" className="mt-1 w-full border-2 border-black px-3 py-2">
            <option value="">—</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
          </select>
        </label>
        <label className="text-sm">
          Gym / academy
          <input name="gym" className="mt-1 w-full border-2 border-black px-3 py-2" />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" value="yes" defaultChecked />
        Published on public rankings
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-10 border-2 border-black bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save ranking"}
      </button>
      {state.error && <p className="text-sm text-brand-red">{state.error}</p>}
      {state.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
    </form>
  );
}
