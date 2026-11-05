"use client";

import { FORWARD_ROUNDS, OUT_ROUNDS, type BracketFlow, type FlowMatch } from "./bracket-flow";

function NameRow({
  name,
  winnerId,
  fighterId,
  ready,
  onPick,
}: {
  name: string | null;
  winnerId: string | null;
  fighterId: string | null;
  ready: boolean;
  onPick: () => void;
}) {
  const won = Boolean(fighterId && winnerId === fighterId);
  const lost = Boolean(winnerId && fighterId && winnerId !== fighterId);
  return (
    <button
      type="button"
      disabled={!ready}
      onClick={onPick}
      className={`block w-full px-2 py-1.5 text-left text-sm truncate ${
        won ? "bg-brand-red text-white" : lost ? "text-muted-foreground line-through" : "bg-white"
      } ${ready ? "hover:bg-brand-red hover:text-white" : ""}`}
    >
      {name ?? "Waiting"}
    </button>
  );
}

function MatchBox({ match, onPick }: { match: FlowMatch; onPick: (winnerId: string) => void }) {
  const ready = Boolean(match.top && match.bottom && !match.winnerId);
  return (
    <div className="w-40 border-2 border-black bg-white shadow-[3px_3px_0_0_#000]">
      <NameRow
        name={match.top?.name ?? null}
        fighterId={match.top?.id ?? null}
        winnerId={match.winnerId}
        ready={ready}
        onPick={() => match.top && onPick(match.top.id)}
      />
      <div className="border-t-2 border-black" />
      <NameRow
        name={match.bottom?.name ?? null}
        fighterId={match.bottom?.id ?? null}
        winnerId={match.winnerId}
        ready={ready}
        onPick={() => match.bottom && onPick(match.bottom.id)}
      />
    </div>
  );
}

function Lane({
  rounds,
  matches,
  onPick,
}: {
  rounds: { title: string; ids: string[] }[];
  matches: FlowMatch[];
  onPick: (matchId: string, winnerId: string) => void;
}) {
  return (
    <div className="flex items-stretch gap-3 min-w-max">
      {rounds.map((round) => (
        <div key={round.title} className="flex flex-col">
          <p className="text-xs uppercase tracking-wider mb-2">{round.title}</p>
          <div className="flex flex-col justify-around gap-6 flex-1">
            {Array.from({ length: Math.ceil(round.ids.length / 2) }, (_, index) => round.ids.slice(index * 2, index * 2 + 2)).map((pair) => (
              <div key={pair.join("-")} className="flex items-center">
                <div className="flex flex-col gap-3">
                  {pair.map((id) => {
                    const match = matches.find((entry) => entry.id === id)!;
                    return <MatchBox key={id} match={match} onPick={(winnerId) => onPick(match.id, winnerId)} />;
                  })}
                </div>
                {pair.length === 2 ? (
                  <div className="w-6 self-stretch my-4 border-y-2 border-r-2 border-black" aria-hidden="true" />
                ) : (
                  <div className="w-6 h-0.5 bg-black" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BracketChart({
  flow,
  onDecide,
}: {
  flow: BracketFlow;
  onDecide: (matchId: string, winnerId: string) => void;
}) {
  return (
    <div className="space-y-6 overflow-x-auto pb-2">
      <div>
        <h3 className="text-display font-semibold mb-1">Moving forward</h3>
        <p className="text-sm text-muted-foreground mb-3">Names sit one under the other. Click the winner and they slide to the next box.</p>
        <Lane rounds={FORWARD_ROUNDS} matches={flow.forward} onPick={onDecide} />
      </div>
      <div className="flex items-center gap-3 text-sm" aria-hidden="true">
        <span className="h-8 border-l-2 border-black" />
        <span className="uppercase tracking-wider text-xs">If you&apos;re out, you drop down and keep going</span>
      </div>
      <div>
        <h3 className="text-display font-semibold mb-1">Out, still going</h3>
        <p className="text-sm text-muted-foreground mb-3">A loss in the opening or the semis lands here. That name keeps moving forward on this line.</p>
        <Lane rounds={OUT_ROUNDS} matches={flow.out} onPick={onDecide} />
      </div>
    </div>
  );
}
