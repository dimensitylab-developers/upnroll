import { Badge } from "@/components/ui/badge";

type MatchRow = {
  round: number;
  order: number;
  competitorAName: string | null;
  competitorBName: string | null;
  winnerName: string | null;
  status: string;
};

export function BracketView({ matches, roundsCount }: { matches: MatchRow[]; roundsCount: number }) {
  const rounds = Array.from({ length: roundsCount }, (_, round) => ({
    round,
    matches: matches.filter((m) => m.round === round).sort((a, b) => a.order - b.order),
  }));

  const roundLabel = (round: number) => {
    const remaining = roundsCount - round;
    if (remaining === 1) return "Final";
    if (remaining === 2) return "Semi-finals";
    if (remaining === 3) return "Quarter-finals";
    return `Round of ${2 ** (remaining + 1)}`;
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {rounds.map((r) => (
          <div key={r.round} className="flex flex-col gap-4 justify-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">{roundLabel(r.round)}</p>
            <div className="flex flex-col gap-6 justify-around flex-1">
              {r.matches.map((m) => (
                <div key={`${m.round}-${m.order}`} className="manga-panel w-56 p-3 text-sm">
                  <div className={m.winnerName && m.winnerName === m.competitorAName ? "font-medium" : ""}>
                    {m.competitorAName ?? "TBD"}
                    {m.winnerName === m.competitorAName && m.competitorAName && <span className="text-brand-gold text-xs ml-2">W</span>}
                  </div>
                  <div className="h-px bg-black/10 my-1.5" />
                  <div className={m.winnerName && m.winnerName === m.competitorBName ? "font-medium" : ""}>
                    {m.competitorBName ?? "TBD"}
                    {m.winnerName === m.competitorBName && m.competitorBName && <span className="text-brand-gold text-xs ml-2">W</span>}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">{m.status.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
