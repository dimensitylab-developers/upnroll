"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ScoringRulesConfig } from "@/server/services/tournamentRules";
import type { JudgeFighterCard } from "./actions";
import {
  judgeFinalizeAction,
  judgeLogoutAction,
  judgeScorePointAction,
  judgeUndoScoreAction,
  type JudgeActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { FighterPhoto } from "@/features/fighters/fighter-photo";
import { cn } from "@/lib/utils";

type TimelineItem = {
  id: string;
  type: string;
  side: string;
  label: string;
  sequence: number;
  reversedByEventId?: string | null;
};

type ConsoleProps = {
  matchId: string;
  username: string;
  status: string;
  scoreA: number;
  scoreB: number;
  penaltiesA: number;
  penaltiesB: number;
  scoreVersion: number;
  rules: ScoringRulesConfig;
  rulesReady: boolean;
  fighterA: JudgeFighterCard;
  fighterB: JudgeFighterCard;
  competitorAName: string;
  competitorBName: string;
  registrationAId: string | null;
  registrationBId: string | null;
  timeline: TimelineItem[];
  provisionalMethod: string;
  provisionalWinnerId: string | null;
};

function newIdempotencyKey() {
  return crypto.randomUUID();
}

function FighterMatCard({
  side,
  fighter,
  score,
  penalties,
  selected,
  onSelect,
}: {
  side: "A" | "B";
  fighter: JudgeFighterCard;
  score: number;
  penalties: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const team = fighter.academy || fighter.gym || "Independent";
  const meta = [fighter.beltRank, fighter.weightDivision, fighter.discipline].filter(Boolean).join(" · ");
  const initials = fighter.displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full border-2 border-black bg-white p-4 text-left shadow-[6px_6px_0_0_#000] transition-transform sm:p-5",
        selected ? "ring-2 ring-brand-red ring-offset-2" : "hover:-translate-y-0.5"
      )}
    >
      <div className="flex gap-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden border-2 border-black bg-[#f3f1ec] sm:h-28 sm:w-24">
          {fighter.hasPhoto && fighter.slug ? (
            <FighterPhoto
              slug={fighter.slug}
              displayName={fighter.displayName}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-display text-xl font-semibold text-black/30">
              {initials || side}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-red">
            Corner {side}
            {selected ? " · scoring" : ""}
          </p>
          <h2 className="text-display mt-1 truncate text-xl font-semibold sm:text-2xl">{fighter.displayName}</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">{team}</p>
          {meta ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p> : null}
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-display text-4xl font-semibold tabular-nums" aria-live="polite">
              {score}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {penalties} penalt{penalties === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        {selected ? "Assign marks below for this fighter." : "Tap to open this profile for scoring."}
      </p>
    </button>
  );
}

export function ScoringConsole(props: ConsoleProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [activeSide, setActiveSide] = useState<"A" | "B">("A");
  const versionRef = useRef(props.scoreVersion);
  useEffect(() => {
    versionRef.current = props.scoreVersion;
  }, [props.scoreVersion]);
  const [, startTransition] = useTransition();

  const runAction = useCallback(
    async (key: string, formData: FormData, action: (_p: JudgeActionState, fd: FormData) => Promise<JudgeActionState>) => {
      if (pendingKey) return;
      setPendingKey(key);
      setError(null);
      try {
        const result = await action({}, formData);
        if (result.error) {
          setError(result.error);
        } else {
          setLastSavedAt(new Date());
          startTransition(() => router.refresh());
        }
      } finally {
        setPendingKey(null);
      }
    },
    [pendingKey, router]
  );

  const score = (side: "A" | "B", code: string, kind: "POINT" | "PENALTY") => {
    const fd = new FormData();
    fd.set("matchId", props.matchId);
    fd.set("side", side);
    fd.set("code", code);
    fd.set("kind", kind);
    fd.set("idempotencyKey", newIdempotencyKey());
    fd.set("expectedVersion", String(versionRef.current));
    void runAction(`${kind}-${side}-${code}`, fd, judgeScorePointAction);
  };

  const undoLast = (eventId: string) => {
    const fd = new FormData();
    fd.set("matchId", props.matchId);
    fd.set("eventId", eventId);
    fd.set("idempotencyKey", newIdempotencyKey());
    fd.set("expectedVersion", String(versionRef.current));
    void runAction(`undo-${eventId}`, fd, judgeUndoScoreAction);
  };

  const finalize = (outcomeCode: string, winnerRegistrationId: string | null) => {
    const fd = new FormData();
    fd.set("matchId", props.matchId);
    fd.set("outcomeCode", outcomeCode);
    if (winnerRegistrationId) fd.set("winnerRegistrationId", winnerRegistrationId);
    fd.set("idempotencyKey", newIdempotencyKey());
    fd.set("expectedVersion", String(versionRef.current));
    void runAction(`finalize-${outcomeCode}`, fd, judgeFinalizeAction);
  };

  const busy = Boolean(pendingKey);
  const lastReversible = [...props.timeline]
    .reverse()
    .find((e) => !e.reversedByEventId && e.type !== "UNDO" && e.type !== "FINALIZE");
  const activeFighter = activeSide === "A" ? props.fighterA : props.fighterB;
  const activeScore = activeSide === "A" ? props.scoreA : props.scoreB;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-2 border-black bg-black px-5 py-6 text-white shadow-[8px_8px_0_0_#c8102e]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Live mat</p>
          <p className="text-display mt-1 text-xl font-semibold">
            {props.competitorAName} vs {props.competitorBName}
          </p>
          <p className="mt-1 text-xs text-white/70">
            Signed in as {props.username} · {props.status.replaceAll("_", " ")}
          </p>
        </div>
        <form action={judgeLogoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-black"
          >
            Sign out
          </Button>
        </form>
      </header>

      {!props.rulesReady && (
        <p className="border-2 border-black bg-brand-red/10 px-4 py-3 text-sm" role="alert">
          Scoring rules are not configured yet. Ask an organizer to set up scoring rules before recording points.
        </p>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-display text-lg font-semibold">Fighter profiles</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open the fighter fighting now, then assign the mark that fits the action on the mat.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FighterMatCard
            side="A"
            fighter={props.fighterA}
            score={props.scoreA}
            penalties={props.penaltiesA}
            selected={activeSide === "A"}
            onSelect={() => setActiveSide("A")}
          />
          <FighterMatCard
            side="B"
            fighter={props.fighterB}
            score={props.scoreB}
            penalties={props.penaltiesB}
            selected={activeSide === "B"}
            onSelect={() => setActiveSide("B")}
          />
        </div>
      </section>

      <section className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">Scoring</p>
            <h2 className="text-display mt-1 text-xl font-semibold">
              Marks for {activeFighter.displayName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Current total {activeScore}. Pick the point or penalty that matches what just happened.
            </p>
          </div>
          <div className="flex gap-2">
            {(["A", "B"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setActiveSide(side)}
                className={cn(
                  "min-h-10 border-2 border-black px-3 text-xs font-semibold uppercase tracking-wider",
                  activeSide === side ? "bg-brand-red text-white" : "bg-white hover:bg-black hover:text-white"
                )}
              >
                Corner {side}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Points</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {props.rules.points.length === 0 && (
                <p className="text-sm text-muted-foreground">No point marks configured for this event.</p>
              )}
              {props.rules.points.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  disabled={busy || !props.rulesReady}
                  onClick={() => score(activeSide, p.code, "POINT")}
                  className={cn(
                    "min-h-11 border-2 border-black px-3 py-2 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#c8102e] transition-colors",
                    busy ? "opacity-50" : "bg-white hover:bg-black hover:text-white"
                  )}
                >
                  +{p.points} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Penalties</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {props.rules.penalties.length === 0 && (
                <p className="text-sm text-muted-foreground">No penalty marks configured for this event.</p>
              )}
              {props.rules.penalties.map((p) => (
                <button
                  key={p.code}
                  type="button"
                  disabled={busy || !props.rulesReady}
                  onClick={() => score(activeSide, p.code, "PENALTY")}
                  className={cn(
                    "min-h-11 border-2 border-black px-3 py-2 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] transition-colors",
                    busy ? "opacity-50" : "bg-brand-red/10 hover:bg-brand-red hover:text-white"
                  )}
                >
                  {p.label}
                  {p.pointsAgainst ? ` (−${p.pointsAgainst})` : ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000]">
        <h2 className="text-display text-lg font-semibold">Finalize</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {props.provisionalWinnerId
            ? `Provisional: ${props.provisionalMethod || "points"} — confirm with an official outcome.`
            : "Pick the official outcome when the match ends."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {props.rules.outcomes.map((o) => {
            const needsWinner = o.requiresExplicitWinner;
            const winner = needsWinner && props.provisionalWinnerId ? props.provisionalWinnerId : null;
            return (
              <button
                key={o.code}
                type="button"
                disabled={busy || !props.rulesReady || (needsWinner && !winner && !props.registrationAId)}
                onClick={() => {
                  if (needsWinner && !winner) {
                    const pickA = window.confirm(
                      `Winner: ${props.competitorAName}? Cancel for ${props.competitorBName}.`
                    );
                    const w = pickA ? props.registrationAId : props.registrationBId;
                    if (!w) {
                      setError("Winner is required for this outcome.");
                      return;
                    }
                    finalize(o.code, w);
                    return;
                  }
                  finalize(o.code, winner);
                }}
                className="min-h-11 border-2 border-black bg-black px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#c8102e] disabled:opacity-50"
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Timeline</h2>
          {lastReversible && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              className="border-2 border-black"
              onClick={() => undoLast(lastReversible.id)}
            >
              Undo last event
            </Button>
          )}
        </div>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
          {props.timeline.length === 0 && <li className="text-muted-foreground">No score events yet.</li>}
          {[...props.timeline].reverse().map((e) => (
            <li key={e.id} className={cn(e.reversedByEventId && "text-muted-foreground line-through")}>
              #{e.sequence} · {e.side} · {e.label} ({e.type})
            </li>
          ))}
        </ul>
      </section>

      <footer className="text-xs text-muted-foreground" aria-live="polite">
        {busy && <span>Saving…</span>}
        {!busy && lastSavedAt && <span>Last saved {lastSavedAt.toLocaleTimeString()}.</span>}
        {!busy && !lastSavedAt && <span>Scores update only after the server confirms a save.</span>}
      </footer>

      {error && (
        <p className="border-2 border-black bg-destructive/10 px-3 py-2 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
