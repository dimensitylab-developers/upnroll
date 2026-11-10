import { Badge } from "@/components/ui/badge";
import { ScrollRegion } from "@/components/layout/scroll-region";

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
    <ScrollRegion label="Swipe to see later rounds" className="pb-2">
      <div className="flex min-w-max gap-6 sm:gap-8">
        {rounds.map((r) => (
          <div key={r.round} className="flex flex-col justify-center gap-4">
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground">{roundLabel(r.round)}</p>
            <div className="flex flex-1 flex-col justify-around gap-6">
              {r.matches.map((m) => (
                <div key={`${m.round}-${m.order}`} className="manga-panel w-52 p-3 text-sm sm:w-56">
                  <div className={m.winnerName && m.winnerName === m.competitorAName ? "font-medium" : ""}>
                    {m.competitorAName ?? "TBD"}
                    {m.winnerName === m.competitorAName && m.competitorAName && (
                      <span className="ml-2 text-xs text-brand-gold">W</span>
                    )}
                  </div>
                  <div className="my-1.5 h-px bg-black/10" />
                  <div className={m.winnerName && m.winnerName === m.competitorBName ? "font-medium" : ""}>
                    {m.competitorBName ?? "TBD"}
                    {m.winnerName === m.competitorBName && m.competitorBName && (
                      <span className="ml-2 text-xs text-brand-gold">W</span>
                    )}
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {m.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollRegion>
  );
}
