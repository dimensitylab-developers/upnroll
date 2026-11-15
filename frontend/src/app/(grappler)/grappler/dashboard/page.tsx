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

/** Session/DB-bound route  allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Desk" };

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function registrationDeskAction(status: string, registrationId: string) {
  const href = `/grappler/registrations/${registrationId}/payment`;
  if (status === "AWAITING_PAYMENT" || status === "REJECTED") {
    return { href, label: "Payment desk" };
  }
  if (status === "PENDING_VERIFICATION") {
    return { href, label: "Payment status" };
  }
  return { href, label: "View seat" };
}

export default async function GrapplerDashboardPage() {
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
  const openRegAction = openReg ? registrationDeskAction(openReg.status, String(openReg._id)) : null;
  const hasPhoto = Boolean(data.profile?.photoKey);
  const publicSlug = data.profile?.slug?.trim() || "";

  return (
    <div className="relative space-y-7 sm:space-y-9">
      <DashboardAtmosphere />

      <div className="relative z-10 space-y-7 sm:space-y-9">
        <DashboardNameplate
          name={name}
          shortName={short}
          greeting={portalGreeting(name, "GRAPPLER")}
          academy={academy}
          beltRank={data.profile?.beltRank}
          weightDivision={data.profile?.weightDivision}
          wins={data.record.wins}
          losses={data.record.losses}
          hasPhoto={hasPhoto}
        />

        {(data.alerts.length > 0 || data.pendingRequests.length > 0) && (
          <div className="space-y-2">
            {data.alerts.map((alert) => (
              <p
                key={alert}
                className="border-2 border-black bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-[4px_4px_0_0_#000]"
              >
                {alert}
              </p>
            ))}
            {data.pendingRequests.length > 0 && (
              <div className="flex flex-col gap-3 border-2 border-black bg-white px-4 py-3 shadow-[4px_4px_0_0_#000] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">
                  {data.pendingRequests.length === 1
                    ? "You have 1 request waiting on the house."
                    : `You have ${data.pendingRequests.length} requests waiting on the house.`}
                </p>
                <Link
                  href="/grappler/requests"
                  className="inline-flex min-h-9 -skew-x-12 items-center justify-center border-2 border-black bg-black px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#c8102e]"
                >
                  <span className="inline-block skew-x-12">Open requests</span>
                </Link>
              </div>
            )}
          </div>
        )}

        <DashboardSection eyebrow="Live" title="What matters now">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <article className="flex flex-col border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Next bout</p>
              {nextMatch ? (
                <>
                  <p className="text-display mt-3 text-xl font-semibold leading-snug sm:text-2xl">
                    {nextMatch.competitorAName ?? "TBD"}
                    <span className="mx-2 text-brand-red">vs</span>
                    {nextMatch.competitorBName ?? "TBD"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nextMatch.mat ? (
                      <span className="border-2 border-black bg-[#f7f4ef] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                        Mat {nextMatch.mat}
                      </span>
                    ) : null}
                    <span className="border-2 border-black bg-[#f7f4ef] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                      {nextMatch.scheduledAt
                        ? new Date(nextMatch.scheduledAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Time TBA"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{nextMatch.event?.name ?? "Event"}</p>
                  <Link
                    href="/grappler/matches"
                    className="mt-6 inline-flex min-h-10 w-fit -skew-x-12 items-center border-2 border-black bg-black px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#c8102e]"
                  >
                    <span className="inline-block skew-x-12">Open match desk</span>
                  </Link>
                </>
              ) : (
                <p className="mt-3 max-w-sm flex-1 text-sm leading-relaxed text-muted-foreground">
                  No bout on the clock. When brackets publish, your mat call lands here first.
                </p>
              )}
            </article>

            <article className="flex flex-col border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Active event</p>
              {openReg ? (
                <>
                  <p className="text-display mt-3 text-xl font-semibold leading-snug sm:text-2xl">
                    {openReg.event?.name ?? "Event"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{openReg.division?.name ?? "Division"}</p>
                  <div className="mt-4">
                    <Badge variant="outline">{statusLabel(openReg.status)}</Badge>
                  </div>
                  {openRegAction ? (
                    <Link
                      href={openRegAction.href}
                      className="mt-6 inline-flex min-h-10 w-fit -skew-x-12 items-center border-2 border-black bg-brand-red px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#000]"
                    >
                      <span className="inline-block skew-x-12">{openRegAction.label}</span>
                    </Link>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="mt-3 max-w-sm flex-1 text-sm leading-relaxed text-muted-foreground">
                    No active seat on an event. When registration opens, take your division here.
                  </p>
                  <Link
                    href="/grappler/registrations/new"
                    className="mt-6 inline-flex min-h-10 w-fit -skew-x-12 items-center border-2 border-black bg-brand-red px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#000]"
                  >
                    <span className="inline-block skew-x-12">Register now</span>
                  </Link>
                </>
              )}
            </article>
          </div>
        </DashboardSection>

        {publicSlug ? (
          <DashboardSection eyebrow="Public" title="Public profile">
            <div className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="mx-auto shrink-0 sm:mx-0 [&_.fighter-playing-card]:origin-top [&_.fighter-playing-card]:scale-[0.92]">
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
                    href={`/grapplers/${publicSlug}`}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-4 sm:pt-2">
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Shareable face on rankings: photo, record, academy. No personal details.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <ShareFighterCardButton slug={publicSlug} displayName={name} />
                    <Link
                      href={`/grapplers/${publicSlug}`}
                      className="inline-flex min-h-10 -skew-x-12 items-center border-2 border-black bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#000]"
                    >
                      <span className="inline-block skew-x-12">Public page</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>
        ) : null}
      </div>
    </div>
  );
}
