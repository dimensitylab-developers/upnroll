"use client";

import { useActionState } from "react";
import { recalculateRankingsAction, type RankingActionState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: RankingActionState = {};

export function RecalculateRankingsButton() {
  const [state, formAction, pending] = useActionState(recalculateRankingsAction, initialState);

  return (
    <form action={formAction} className="mb-6">
      <Button type="submit" disabled={pending}>{pending ? "Recalculating…" : "Recalculate rankings"}</Button>
      {state.message && <p className="text-sm text-brand-cyan mt-2">{state.message}</p>}
      {state.error && <p className="text-sm text-primary mt-2">{state.error}</p>}
      <p className="text-xs text-muted-foreground mt-2">
        Placeholder points formula (3 per win) pending OD-004 — not an approved ranking methodology.
      </p>
    </form>
  );
}
