import Link from "next/link";
import { getSession } from "@/server/auth/session";
import { getAdminDashboardData } from "@/server/services/dashboardService";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await getSession();
  const data = await getAdminDashboardData();

  const stats = [
    { label: "Registered fighters", value: data.fighterCount },
    { label: "Upcoming events", value: data.upcomingEvents.length },
    { label: "Pending payments", value: data.pendingPayments.length },
    { label: "Pending requests", value: data.pendingRequests.length },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-2">Admin overview</p>
        <h1 className="text-display text-2xl font-semibold">Signed in as {session?.user.email}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="manga-panel p-5">
            <p className="text-display text-3xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Upcoming events</h2>
            <Link href="/admin/events" className="text-sm underline">Manage</Link>
          </div>
          <div className="space-y-2">
            {data.upcomingEvents.map((e) => (
              <Link key={String(e._id)} href={`/admin/events/${e._id}`} className="manga-panel p-3 flex items-center justify-between">
                <span className="font-medium">{e.name}</span>
                <span className="text-xs text-muted-foreground">{new Date(e.startDate).toLocaleDateString()}</span>
              </Link>
            ))}
            {data.upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Pending payments</h2>
            <Link href="/admin/payments" className="text-sm underline">Review</Link>
          </div>
          <div className="space-y-2">
            {data.pendingPayments.slice(0, 5).map((p) => (
              <div key={p.id} className="manga-panel p-3 flex items-center justify-between">
                <span>{p.user?.email ?? "Unknown"}</span>
                <Badge variant="secondary">{p.event?.name ?? "Unknown event"}</Badge>
              </div>
            ))}
            {data.pendingPayments.length === 0 && (
              <p className="text-sm text-muted-foreground">No payments awaiting review.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Recent registrations</h2>
            <Link href="/admin/events" className="text-sm underline">View events</Link>
          </div>
          <div className="space-y-2">
            {data.recentRegistrations.map((r) => (
              <div key={String(r._id)} className="manga-panel p-3">
                <p className="font-medium">{r.fighterName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.event?.name ?? "Unknown event"} — {r.division?.name ?? "Unknown division"}
                </p>
              </div>
            ))}
            {data.recentRegistrations.length === 0 && (
              <p className="text-sm text-muted-foreground">No registrations yet.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-display text-lg font-semibold">Pending requests</h2>
            <Link href="/admin/requests" className="text-sm underline">Decide</Link>
          </div>
          <div className="space-y-2">
            {data.pendingRequests.slice(0, 5).map((r) => (
              <div key={String(r._id)} className="manga-panel p-3">
                <p className="font-medium">{r.userEmail} — {r.type}</p>
                <p className="text-xs text-muted-foreground truncate">{r.reason}</p>
              </div>
            ))}
            {data.pendingRequests.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending requests.</p>
            )}
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-display text-lg font-semibold mb-3">Recent tournament activity</h2>
        <div className="manga-panel p-4">
          <ul className="divide-y divide-black/10">
            {data.recentActivity.map((a) => (
              <li key={String(a._id)} className="py-2.5 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4">
                <span>{a.action.replaceAll("_", " ")}</span>
                <span className="text-xs text-muted-foreground sm:shrink-0 break-words">
                  {a.actorEmail} · {new Date(a.createdAt as Date).toLocaleString()}
                </span>
              </li>
            ))}
            {data.recentActivity.length === 0 && (
              <li className="py-6 text-sm text-muted-foreground text-center">No activity recorded yet.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
