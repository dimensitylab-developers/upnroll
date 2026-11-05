import Link from "next/link";
import { getSession } from "@/server/auth/session";
import { getFighterDashboardData } from "@/server/services/dashboardService";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function FighterDashboardPage() {
  const session = await getSession();
  if (!session) return null; // the fighter layout already redirects unauthenticated visitors to /login

  const data = await getFighterDashboardData(String(session.user._id));

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-2">Fighter dashboard</p>
        <h1 className="text-display text-2xl font-semibold">
          Welcome, {data.profile?.displayName ?? session.user.email}
        </h1>
        {data.profile?.gym && (
          <p className="text-sm text-muted-foreground mt-1">
            {data.profile.gym}
            {data.profile.discipline ? ` · ${data.profile.discipline}` : ""}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Your registrations</h2>
            <Link href="/fighter/registrations" className="text-sm underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data.registrations.slice(0, 5).map((r) => (
              <Link
                key={String(r._id)}
                href={`/fighter/registrations/${r._id}/payment`}
                className="manga-panel p-3 flex items-center justify-between"
              >
                <span>{r.event?.name ?? "Unknown event"} — {r.division?.name ?? "Unknown division"}</span>
                <Badge variant="outline">{r.status.replaceAll("_", " ")}</Badge>
              </Link>
            ))}
            {data.registrations.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t registered for an event yet.{" "}
                <Link href="/fighter/registrations/new" className="underline">Register now</Link>.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Upcoming matches</h2>
            <Link href="/fighter/matches" className="text-sm underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data.upcomingMatches.slice(0, 5).map((m) => (
              <div key={String(m._id)} className="manga-panel p-3">
                <p className="font-medium">{m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}</p>
                <p className="text-xs text-muted-foreground">
                  {m.event?.name ?? "Unknown event"} ·{" "}
                  {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "Not yet scheduled"}
                </p>
              </div>
            ))}
            {data.upcomingMatches.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming matches.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Recent results</h2>
            <Link href="/fighter/matches" className="text-sm underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data.recentResults.map((m) => (
              <div key={String(m._id)} className="manga-panel p-3 flex items-center justify-between">
                <span>{m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}</span>
                <Badge variant={m.outcome === "WIN" ? "default" : m.outcome === "LOSS" ? "destructive" : "outline"}>
                  {m.outcome ?? "BYE"}
                </Badge>
              </div>
            ))}
            {data.recentResults.length === 0 && (
              <p className="text-sm text-muted-foreground">No results yet.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Pending requests</h2>
            <Link href="/fighter/requests" className="text-sm underline">View all</Link>
          </div>
          <div className="space-y-2">
            {data.pendingRequests.map((r) => (
              <div key={String(r._id)} className="manga-panel p-3">
                <p className="font-medium">{r.type}</p>
                <p className="text-xs text-muted-foreground truncate">{r.reason}</p>
              </div>
            ))}
            {data.pendingRequests.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
