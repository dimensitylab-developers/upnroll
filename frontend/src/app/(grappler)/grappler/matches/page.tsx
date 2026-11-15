import type { Metadata } from "next";
import { actorFromSession, getSession } from "@/server/auth/session";
import { listMatchesForFighter } from "@/server/services/matchService";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Session/DB-bound route  allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Matches" };

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default async function FighterMatchesPage() {
  const session = await getSession();
  const matches = session ? await listMatchesForFighter(actorFromSession(session)) : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">Mat board</p>
        <h1 className="text-display mt-1 text-2xl font-semibold sm:text-3xl">Your matches</h1>
        <p className="mt-2 text-sm text-muted-foreground">You only see the mat you are assigned to.</p>
      </div>

      {matches.length === 0 && (
        <p className="border-2 border-black bg-white px-4 py-6 text-sm text-muted-foreground shadow-[4px_4px_0_0_#000]">
          No matches assigned yet.
        </p>
      )}

      <div className="space-y-3">
        {matches.map((m) => {
          const done = m.status === "COMPLETED" || m.status === "BYE";
          return (
            <article
              key={String(m._id)}
              className={cn(
                "border-2 border-black p-4 shadow-[4px_4px_0_0_#000] sm:p-5",
                done ? "bg-[#f7f4ef] text-black/80" : "bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{m.event?.name ?? "Unknown event"}</p>
                <Badge variant="outline">{statusLabel(m.status)}</Badge>
              </div>
              <p className="text-display mt-2 text-lg font-semibold leading-snug sm:text-xl">
                {m.competitorAName ?? "TBD"}
                <span className="mx-2 text-brand-red">vs</span>
                {m.competitorBName ?? "TBD"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="border-2 border-black bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Round {m.round + 1}
                </span>
                <span className="border-2 border-black bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Mat {m.mat || "TBA"}
                </span>
                {m.scheduledAt ? (
                  <span className="border-2 border-black bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                    {new Date(m.scheduledAt as Date).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                ) : null}
              </div>
              {m.winnerName && (
                <p className="mt-3 text-sm font-semibold text-brand-red">
                  Winner: {m.winnerName}
                  {m.resultMethod ? ` · ${m.resultMethod}` : ""}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}