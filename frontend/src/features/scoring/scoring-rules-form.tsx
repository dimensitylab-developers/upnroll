"use client";

import { useActionState } from "react";
import { saveScoringRulesAction, type ScoringAdminActionState } from "./admin-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ScoringRulesConfig } from "@/server/services/tournamentRules";
import { emptyScoringRules } from "@/server/services/tournamentRules";
import { ALLOWED_SUBMISSIONS } from "@/server/content/allowedSubmissions";

export function ScoringRulesForm({ eventId, rules }: { eventId: string; rules: ScoringRulesConfig | null | undefined }) {
  const initial = rules ?? emptyScoringRules();
  const [state, action, pending] = useActionState(saveScoringRulesAction, {} as ScoringAdminActionState);

  return (
    <form action={action} className="space-y-4 border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
      <input type="hidden" name="eventId" value={eventId} />
      <MotionIntro />
      <AllowedSubmissionList />
      <MotionSample />
      <div>
        <Label htmlFor="rulesJson">Scoring rules JSON</Label>
        <textarea
          id="rulesJson"
          name="rulesJson"
          rows={18}
          defaultValue={JSON.stringify(initial, null, 2)}
          className="mt-2 w-full border-2 border-black bg-white p-3 font-mono text-xs shadow-[3px_3px_0_0_#c8102e]"
          spellCheck={false}
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p className="text-sm text-brand-cyan">Rules saved.</p>}
      <Button type="submit" disabled={pending} className="border-2 border-black shadow-[4px_4px_0_0_#c8102e]">
        {pending ? "Saving…" : "Save scoring rules"}
      </Button>
    </form>
  );
}

function MotionIntro() {
  return (
    <div>
      <h2 className="text-display text-lg font-semibold">Tournament scoring rules</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Configure point buttons, penalties, and final outcomes before judges can score. Set <code className="text-xs">configured</code>{" "}
        to true when ready.
      </p>
    </div>
  );
}

function AllowedSubmissionList() {
  return (
    <div className="border-2 border-black bg-[#f7f6f4] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">Allowed submissions</p>
      <p className="mt-1 text-sm text-muted-foreground">
        When a match ends by submission, judges/admins should pick from this list (and the belt rules for the event).
      </p>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2">
        {ALLOWED_SUBMISSIONS.map((item) => (
          <li key={item} className="text-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MotionSample() {
  return (
    <details className="border-2 border-dashed border-black/40 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-semibold">Example structure</summary>
      <pre className="mt-2 overflow-x-auto text-xs">{`{
  "configured": true,
  "winByHighestScore": true,
  "allowTies": false,
  "points": [
    { "code": "T2", "label": "Takedown", "points": 2 },
    { "code": "GP3", "label": "Guard pass", "points": 3 },
    { "code": "M4", "label": "Mount", "points": 4 }
  ],
  "penalties": [{ "code": "STALL", "label": "Stalling", "pointsAgainst": 1 }],
  "outcomes": [
    { "code": "PTS", "label": "Points win", "requiresExplicitWinner": true },
    { "code": "SUB", "label": "Submission", "requiresExplicitWinner": true },
    { "code": "DQ", "label": "Disqualification", "requiresExplicitWinner": true }
  ]
}`}</pre>
    </details>
  );
}
