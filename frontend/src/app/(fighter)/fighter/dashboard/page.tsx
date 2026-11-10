import type { Metadata } from "next";
import Link from "next/link";
import { actorFromSession, getSession } from "@/server/auth/session";
import { firstName, portalGreeting, resolveDisplayName } from "@/server/auth/display-name";
import { getFighterDashboardData } from "@/server/services/dashboardService";
import { DashboardAtmosphere } from "@/features/fighter/dashboard-atmosphere";
import { DashboardNameplate } from "@/features/fighter/dashboard-nameplate";
import { DashboardSection } from "@/features/fighter/dashboard-section";
import { FighterHypeCard } from "@/features/fighters/fighter-hype-card";
import { ShareFighterCardButton } from "@/features/fighters/share-fighter-card-button";
import { Badge } from "@/components/ui/badge";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Desk" };

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default async function FighterDashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const [data, displayName] = await Promise.all([
    getFighterDashboardData(actorFromSession(session)),
    resolveDisplayName(session.user._id, session.user.email),
  ]);
  const name = data.profile?.displayName?.trim() || displayName;
  const short = firstName(name);
  const academy = data.profile?.academy || data.profile?.gym || "";
  const nextMatch = data.upcomingMatches[0] ?? null;
  const openReg = data.registrations.find((r) =>
    ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"].includes(r.status)
  );
  const missing = data.profileHealth.checks.filter((c) => !c.done);
  const hasPhoto = Boolean(data.profile?.photoKey);
  const sheetReady = data.profileHealth.percent >= 100;
  const publicSlug = data.profile?.slug?.trim() || "";

  return (
    <div className="relative space-y-8 sm:space-y-10">
      <DashboardAtmosphere name={name} />

      <div className="relative z-10 space-y-8 sm:space-y-10">
        <DashboardNameplate
          name={name}
          shortName={short}
          greeting={portalGreeting(name, "FIGHTER")}
          academy={academy}
          beltRank={data.profile?.beltRank}
          weightDivision={data.profile?.weightDivision}
          wins={data.record.wins}
          losses={data.record.losses}
          sheetPercent={data.profileHealth.percent}
          hasPhoto={hasPhoto}
          sheetReady={sheetReady}
        />

        {data.alerts.length > 0 && (
          <div className="space-y-2">
            {data.alerts.map((alert) => (
              <p
                key={alert}
                className="border-2 border-black bg-brand-red px-4 py-3 text-sm font-medium text-white shadow-[4px_4px_0_0_#000]"
              >
                {alert}
              </p>
            ))}
          </div>
        )}

        <DashboardSection eyebrow="Live" title="What matters now">
          <div className="grid gap-0 overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0_0_#000] sm:grid-cols-2">
            <div className="border-b-2 border-black p-4 sm:border-b-0 sm:border-r-2 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Next bout</p>
              {nextMatch ? (
                <>
                  <p className="text-display mt-3 text-xl font-semibold leading-snug sm:text-2xl">
                    {nextMatch.competitorAName ?? "TBD"}
                    <span className="mx-2 text-brand-red">vs</span>
                    {nextMatch.competitorBName ?? "TBD"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {nextMatch.event?.name ?? "Event"}
                    {nextMatch.mat ? ` · Mat ${nextMatch.mat}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nextMatch.scheduledAt
                      ? new Date(nextMatch.scheduledAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Time TBA"}
                  </p>
                  <Link
                    href="/fighter/matches"
                    className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-brand-red hover:underline"
                  >
                    Open match desk →
                  </Link>
                </>
              ) : (
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  No bout on the clock. When brackets publish, your mat call lands here first.
                </p>
              )}
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Active card</p>
              {openReg ? (
                <>
                  <p className="text-display mt-3 text-xl font-semibold leading-snug sm:text-2xl">
                    {openReg.event?.name ?? "Event"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{openReg.division?.name ?? "Division"}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{statusLabel(openReg.status)}</Badge>
                    <Link
                      href={`/fighter/registrations/${openReg._id}/payment`}
                      className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-red hover:underline"
                    >
                      Payment desk →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    No active seat on a card. When registration opens, take your division here.
                  </p>
                  <Link
                    href="/fighter/registrations/new"
                    className="mt-4 inline-flex min-h-10 items-center border-2 border-black bg-brand-red px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#000]"
                  >
                    Register now
                  </Link>
                </>
              )}
            </div>
          </div>
        </DashboardSection>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {publicSlug ? (
            <DashboardSection eyebrow="Public" title="Playing card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto shrink-0 sm:mx-0 [&_.fighter-playing-card]:scale-[0.88] [&_.fighter-playing-card]:origin-top">
                  <FighterHypeCard
                    fighter={{
                      displayName: name,
                      slug: publicSlug,
                      gym: data.profile?.gym || "",
                      academy,
                      discipline: data.profile?.discipline || "",
                      beltRank: data.profile?.beltRank || "",
                      weightDivision: data.profile?.weightDivision || "",
                      hasPhoto,
                      wins: data.record.wins,
                      losses: data.record.losses,
                    }}
                    href={`/fighters/${publicSlug}`}
                  />
                </div>
                <div className="min-w-0 space-y-3 sm:pt-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Shareable face on rankings — photo, record, academy. No personal details.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <ShareFighterCardButton slug={publicSlug} displayName={name} />
                    <Link
                      href={`/fighters/${publicSlug}`}
                      className="inline-flex min-h-10 items-center border-2 border-black bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#000]"
                    >
                      Public page →
                    </Link>
                  </div>
                </div>
              </div>
            </DashboardSection>
          ) : null}

          <DashboardSection title="Sheet readiness" actionHref="/fighter/profile" actionLabel="Edit sheet →">
            <div className="border-2 border-black bg-white">
              <div className="flex items-end justify-between gap-3 border-b-2 border-black px-4 py-3">
                <div>
                  <p className="text-display text-3xl font-semibold leading-none">{data.profileHealth.percent}%</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.profileHealth.done}/{data.profileHealth.total} locked in
                  </p>
                </div>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    missing.length ? "text-brand-red" : "text-muted-foreground"
                  }`}
                >
                  {missing.length ? `${missing.length} open` : "Ready"}
                </p>
              </div>
              <div className="h-2 bg-[#efeae2]">
                <div className="h-full bg-brand-red transition-[width] duration-500" style={{ width: `${data.profileHealth.percent}%` }} />
              </div>
              <ul className="divide-y divide-black/10">
                {data.profileHealth.checks.map((check) => (
                  <li key={check.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className={check.done ? "text-foreground" : "text-muted-foreground"}>{check.label}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
                        check.done ? "text-black/50" : "text-brand-red"
                      }`}
                    >
                      {check.done ? "In" : "Need"}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t-2 border-black px-4 py-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Academy</dt>
                  <dd className="mt-0.5 break-words font-medium">{academy || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Coach</dt>
                  <dd className="mt-0.5 break-words font-medium">{data.profile?.headCoach || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">City</dt>
                  <dd className="mt-0.5 break-words font-medium">{data.profile?.cityState || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Fit to fight</dt>
                  <dd className="mt-0.5 font-medium">
                    {data.profile?.medicallyFit ? "Yes" : data.profile?.dateOfBirth ? "No" : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </DashboardSection>

          <DashboardSection title="Your cards" actionHref="/fighter/registrations" actionLabel="All cards →">
            <div className="border-2 border-black bg-white">
              {data.registrations.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No cards yet.{" "}
                  <Link href="/fighter/registrations/new" className="font-semibold text-brand-red underline">
                    Take a seat
                  </Link>
                </p>
              ) : (
                <ul className="divide-y divide-black/10">
                  {data.registrations.slice(0, 5).map((r) => (
                    <li key={String(r._id)}>
                      <Link
                        href={`/fighter/registrations/${r._id}/payment`}
                        className="flex flex-col gap-2 px-4 py-3 transition hover:bg-[#f7f4ef] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="min-w-0">
                          <span className="block break-words font-medium">{r.event?.name ?? "Unknown event"}</span>
                          <span className="text-xs text-muted-foreground">{r.division?.name ?? "Unknown division"}</span>
                        </span>
                        <Badge variant="outline" className="w-fit shrink-0">
                          {statusLabel(r.status)}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DashboardSection>

          <DashboardSection title="Recent results" actionHref="/fighter/matches" actionLabel="All matches →">
            <div className="border-2 border-black bg-white">
              {data.recentResults.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Results land here after the bout.</p>
              ) : (
                <ul className="divide-y divide-black/10">
                  {data.recentResults.slice(0, 5).map((m) => (
                    <li
                      key={String(m._id)}
                      className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-medium">
                          {m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}
                        </span>
                        {m.resultMethod ? <span className="text-xs text-muted-foreground">{m.resultMethod}</span> : null}
                      </span>
                      <Badge
                        variant={m.outcome === "WIN" ? "default" : m.outcome === "LOSS" ? "destructive" : "outline"}
                        className="w-fit shrink-0"
                      >
                        {m.outcome ?? "BYE"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DashboardSection>

          <DashboardSection title="Open requests" actionHref="/fighter/requests" actionLabel="All requests →">
            <div className="border-2 border-black bg-white">
              {data.pendingRequests.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">No open cancel or transfer asks.</p>
              ) : (
                <ul className="divide-y divide-black/10">
                  {data.pendingRequests.map((r) => (
                    <li key={String(r._id)} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{r.type}</p>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <p className="mt-1 break-words text-xs text-muted-foreground">{r.reason}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
