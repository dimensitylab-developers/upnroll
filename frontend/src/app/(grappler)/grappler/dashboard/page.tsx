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
  const hasPhoto = Boolean(data.profile?.photoKey);
  const publicSlug = data.profile?.slug?.trim() || "";

  return (
    <div className="relative space-y-8 sm:space-y-10">
      <DashboardAtmosphere name={name} />

      <div className="relative z-10 space-y-8 sm:space-y-10">
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
                    href="/grappler/matches"
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Active event</p>
              {openReg ? (
                <>
                  <p className="text-display mt-3 text-xl font-semibold leading-snug sm:text-2xl">
                    {openReg.event?.name ?? "Event"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{openReg.division?.name ?? "Division"}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{statusLabel(openReg.status)}</Badge>
                    <Link
                      href={`/grappler/registrations/${openReg._id}/payment`}
                      className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-red hover:underline"
                    >
                      Payment desk →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    No active seat on an event. When registration opens, take your division here.
                  </p>
                  <Link
                    href="/grappler/registrations/new"
                    className="mt-4 inline-flex min-h-10 items-center border-2 border-black bg-brand-red px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#000]"
                  >
                    Register now
                  </Link>
                </>
              )}
            </div>
          </div>
        </DashboardSection>

        {publicSlug ? (
          <DashboardSection eyebrow="Public" title="Public profile">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="mx-auto shrink-0 sm:mx-0 [&_.fighter-playing-card]:origin-top [&_.fighter-playing-card]:scale-[0.88]">
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
              <div className="min-w-0 space-y-3 sm:pt-1">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Shareable face on rankings — photo, record, academy. No personal details.
                </p>
                <div className="flex flex-wrap gap-2">
                  <ShareFighterCardButton slug={publicSlug} displayName={name} />
                  <Link
                    href={`/grapplers/${publicSlug}`}
                    className="inline-flex min-h-10 items-center border-2 border-black bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#000]"
                  >
                    Public page →
                  </Link>
                </div>
              </div>
            </div>
          </DashboardSection>
        ) : null}
      </div>
    </div>
  );
}