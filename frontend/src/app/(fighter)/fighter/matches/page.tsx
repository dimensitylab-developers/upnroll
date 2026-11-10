import type { Metadata } from "next";
import { actorFromSession, getSession } from "@/server/auth/session";
import { listMatchesForFighter } from "@/server/services/matchService";
import { Badge } from "@/components/ui/badge";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Matches" };

export default async function FighterMatchesPage() {
  const session = await getSession();
  const matches = session ? await listMatchesForFighter(actorFromSession(session)) : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-2">Your matches</h1>
      <p className="text-sm text-muted-foreground mb-6">You only see the mat you are assigned to.</p>
      {matches.length === 0 && <p className="text-sm text-muted-foreground">No matches assigned yet.</p>}
      <div className="space-y-3">
        {matches.map((m) => (
          <div key={String(m._id)} className="manga-panel p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{m.event?.name ?? "Unknown event"}</p>
              <Badge variant="outline">{m.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Round {m.round + 1} — {m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}
            </p>
            <p className="text-xs text-muted-foreground">
              Mat {m.mat || "not assigned yet"}
              {m.scheduledAt ? ` · ${new Date(m.scheduledAt as Date).toLocaleString()}` : ""}
            </p>
            {m.winnerName && <p className="text-sm text-brand-gold mt-1">Winner: {m.winnerName} ({m.resultMethod})</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
