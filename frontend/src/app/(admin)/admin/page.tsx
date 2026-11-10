import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { actorFromSession, getSession } from "@/server/auth/session";
import { portalGreeting, portalWelcomeLine, resolveDisplayName } from "@/server/auth/display-name";
import { getAdminDashboardData } from "@/server/services/dashboardService";
import { AdminEmpty } from "@/features/admin/ui/admin-empty";
import { AdminSection } from "@/features/admin/ui/admin-section";
import { AdminStatCard } from "@/features/admin/ui/admin-stat-card";
import { AdminTimeline, formatTimelineStamp } from "@/features/admin/ui/admin-timeline";
import { Badge } from "@/components/ui/badge";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Desk" };

function actionLabel(action: string) {
  if (action === "USER_LOGIN") return "Signed in";
  if (action === "FIGHTER_PROFILE_CREATED") return "Profile created";
  if (action === "FIGHTER_PROFILE_UPDATED") return "Profile updated";
  if (action === "USER_REGISTERED") return "Account created";
  return action.replaceAll("_", " ");
}

export default async function AdminOverviewPage() {
  await connection();
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  const [data, displayName] = await Promise.all([
    getAdminDashboardData(actorFromSession(session)),
    resolveDisplayName(session.user._id, session.user.email),
  ]);
  const openCard = data.upcomingEvents.find((e) => e.status === "REGISTRATION_OPEN") ?? data.upcomingEvents[0] ?? null;
  const greeting = portalGreeting(displayName, "ADMIN");
  const welcome = portalWelcomeLine(displayName, "ADMIN");

  const entryItems = data.recentEntries.map((a) => ({
    id: String(a._id),
    title: a.detail?.trim() || a.actorEmail,
    meta: `${actionLabel(a.action)} · ${a.actorEmail}`,
    stamp: formatTimelineStamp(a.createdAt as Date),
  }));

  const accountItems = data.recentAccounts.map((a) => ({
    id: String(a._id),
    title: a.displayName.trim() || a.email,
    meta: `${a.email}${a.emailVerified ? "" : " · awaiting email confirm"}`,
    stamp: formatTimelineStamp(a.createdAt),
  }));

  const profileItems = data.recentProfiles.map((a) => ({
    id: String(a._id),
    title: a.detail?.trim() || a.actorEmail,
    meta: `${actionLabel(a.action)} · ${a.actorEmail}`,
    stamp: formatTimelineStamp(a.createdAt as Date),
  }));

  const registrationItems = data.recentRegistrations.map((r) => ({
    id: String(r._id),
    title: r.fighterName,
    meta: `${r.event?.name ?? "Event"} — ${r.division?.name ?? "Division"}${r.status ? ` · ${r.status.replaceAll("_", " ")}` : ""}`,
    stamp: r.createdAt ? formatTimelineStamp(r.createdAt) : "—",
  }));

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <section className="border-2 border-black bg-black px-4 py-5 text-white shadow-[6px_6px_0_0_#c8102e] sm:px-6 sm:py-7 sm:shadow-[8px_8px_0_0_#c8102e] lg:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red sm:text-[11px] sm:tracking-[0.22em]">
          House control
        </p>
        <p className="mt-2 text-xs text-brand-red sm:mt-3 sm:text-sm">{greeting}</p>
        <h1 className="text-display mt-1 text-2xl font-semibold leading-tight break-words sm:mt-2 sm:text-3xl lg:text-4xl">
          {welcome}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/70">
          Watch who signs up, who walks in, and who registers for a card — then keep the house moving.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
          <Link
            href="/admin/events"
            className="inline-flex min-h-11 items-center justify-center -skew-x-12 border-2 border-black bg-brand-red px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#fff]"
          >
            <span className="inline-block skew-x-12">Manage events</span>
          </Link>
          <Link
            href="/admin/fighters"
            className="inline-flex min-h-11 items-center justify-center border-2 border-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider"
          >
            Fighters
          </Link>
          <Link
            href="/admin/payments"
            className="inline-flex min-h-11 items-center justify-center border-2 border-white/40 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white/80"
          >
            Payment queue
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <AdminStatCard label="Fighters" value={data.fighterCount} href="/admin/fighters" hint="Full roster" />
        <AdminStatCard
          label="Entries today"
          value={data.presence.entriesToday}
          href="/admin"
          hint="Logins / verify"
          accent={data.presence.entriesToday > 0}
        />
        <AdminStatCard
          label="New accounts today"
          value={data.presence.newAccountsToday}
          href="/admin/fighters"
          hint="Sign-ups"
          accent={data.presence.newAccountsToday > 0}
        />
        <AdminStatCard
          label="Pending payments"
          value={data.pendingPayments.length}
          href="/admin/payments"
          hint="Needs review"
          accent={data.pendingPayments.length > 0}
        />
      </div>

      {openCard && (
        <AdminSection title="Next card" actionHref={`/admin/events/${openCard._id}`} actionLabel="Open hub →">
          <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge variant="outline">{openCard.status.replaceAll("_", " ")}</Badge>
                <h2 className="text-display mt-2 text-2xl font-semibold">{openCard.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(openCard.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}
                  {openCard.venue || "Venue TBA"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/events/${openCard._id}/divisions`} className="border-2 border-black bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000]">
                  Divisions
                </Link>
                <Link href={`/admin/events/${openCard._id}/brackets`} className="border-2 border-black bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000]">
                  Brackets
                </Link>
                <Link href={`/admin/events/${openCard._id}/matches`} className="border-2 border-black bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000]">
                  Matches
                </Link>
              </div>
            </div>
          </div>
        </AdminSection>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminSection title="Who came in" actionHref="/admin/fighters" actionLabel="Roster">
          <AdminTimeline items={entryItems} empty="No sign-ins recorded yet." />
        </AdminSection>

        <AdminSection title="New accounts" actionHref="/admin/fighters" actionLabel="Fighters">
          <AdminTimeline items={accountItems} empty="No fighter accounts yet." />
        </AdminSection>

        <AdminSection title="Profiles" actionHref="/admin/fighters" actionLabel="Open sheets">
          <AdminTimeline items={profileItems} empty="No profile create/update activity yet." />
        </AdminSection>

        <AdminSection title="Event registrations" actionHref="/admin/events" actionLabel="Events">
          <AdminTimeline items={registrationItems} empty="No event registrations yet." />
        </AdminSection>

        <AdminSection title="Needs attention" actionHref="/admin/payments" actionLabel="All payments">
          <div className="space-y-2">
            {data.pendingPayments.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
                <span className="text-sm font-medium">{p.user?.email ?? "Unknown"}</span>
                <Badge variant="secondary">{p.event?.name ?? "Event"}</Badge>
              </div>
            ))}
            {data.pendingPayments.length === 0 && <AdminEmpty>No payments awaiting review.</AdminEmpty>}
            {data.pendingRequests.slice(0, 3).map((r) => (
              <Link
                key={String(r._id)}
                href="/admin/requests"
                className="block border-2 border-black bg-black p-3 text-white shadow-[4px_4px_0_0_#c8102e]"
              >
                <p className="text-sm font-semibold">
                  {r.userEmail} · {r.type}
                </p>
                <p className="mt-1 truncate text-xs text-white/60">{r.reason}</p>
              </Link>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="House activity">
          <AdminTimeline
            items={data.recentActivity.map((a) => ({
              id: String(a._id),
              title: actionLabel(a.action),
              meta: a.detail ? `${a.detail} · ${a.actorEmail}` : a.actorEmail,
              stamp: formatTimelineStamp(a.createdAt as Date),
            }))}
            empty="No activity recorded yet."
          />
        </AdminSection>
      </div>
    </div>
  );
}
