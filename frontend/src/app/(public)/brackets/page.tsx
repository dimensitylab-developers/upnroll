import Link from "next/link";
import {
  cachedPublicDivisions,
  cachedPublicEvents,
  cachedPublicSchedule,
  cachedPublishedBracketOrNull,
} from "@/lib/public-reads";
import { BracketView } from "@/features/brackets/bracket-view";
import { LiveRefresh } from "@/components/home/live-refresh";
import { EmojiStrip, MatEmojis } from "@/components/home/mat-emojis";
import { SectionBanner } from "@/components/home/section-banner";
import { Badge } from "@/components/ui/badge";

export default async function LiveBracketsPage() {
  // Cached public reads with minute freshness; LiveRefresh soft-revalidates the tree.
  const events = await cachedPublicEvents();
  const focus =
    events.find((event) => event.status === "REGISTRATION_OPEN" || event.status === "REGISTRATION_CLOSED") ??
    events.find((event) => event.status === "COMPLETED") ??
    events[0] ??
    null;

  const [divisions, schedule] = focus
    ? await Promise.all([cachedPublicDivisions(focus._id), cachedPublicSchedule(focus.slug).catch(() => [])])
    : [[], []];

  const brackets = focus
    ? (
        await Promise.all(
          divisions.map(async (division) => {
            const result = await cachedPublishedBracketOrNull(division._id);
            return result ? { division, ...result } : null;
          })
        )
      ).filter((row): row is NonNullable<typeof row> => row !== null)
    : [];

  const live = schedule.filter((match) => match.status === "SCHEDULED");
  const decided = schedule.filter((match) => match.status === "COMPLETED" || match.status === "BYE");
  const waiting = schedule.filter((match) => match.status === "PENDING");

  return (
    <main className="route-enter relative min-h-screen overflow-hidden px-4 py-16">
      <MatEmojis className="absolute inset-0" />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <LiveRefresh seconds={8} />
          <EmojiStrip emojis={["double-leg-takedown", "armbar", "hip-throw", "triangle-choke"]} />
        </div>
        <h1 className="text-display text-4xl font-semibold">Brackets</h1>
        <p className="mt-2 max-w-2xl bg-white px-2 py-1 text-sm">
          Live board for the open card. Wins, losses, and every published bracket refresh as matches finish.
        </p>

        {!focus && (
          <p className="mt-10 text-sm text-muted-foreground">No public card is up yet. Check back when an event opens.</p>
        )}

        {focus && (
          <>
            <section className="mt-10 border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">On the board</p>
              <h2 className="text-display mt-1 text-2xl font-semibold">{focus.name}</h2>
              <p className="mt-1 text-sm">
                {new Date(focus.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                <Link href={`/events/${focus.slug}`} className="underline">
                  Event page
                </Link>
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">Live / called {live.length}</Badge>
                <Badge variant="outline">Waiting {waiting.length}</Badge>
                <Badge variant="outline">Decided {decided.length}</Badge>
              </div>
            </section>

            <section className="mt-12">
              <SectionBanner>Called to the mat</SectionBanner>
              {live.length === 0 ? (
                <p className="bg-white px-2 py-1 text-sm">No bout is scheduled on the mat right now.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {live.map((match) => (
                    <li key={`${match.round}-${match.order}-${match.competitorAName}-${match.competitorBName}`} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">
                        Mat {match.mat || "TBD"} · Round {match.round + 1}
                      </p>
                      <p className="mt-2 font-semibold">
                        {match.competitorAName ?? "TBD"} <span className="text-muted-foreground">vs</span> {match.competitorBName ?? "TBD"}
                      </p>
                      {match.scheduledAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(match.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-12">
              <SectionBanner>Just decided</SectionBanner>
              {decided.length === 0 ? (
                <p className="bg-white px-2 py-1 text-sm">Results will land here as soon as a bout ends.</p>
              ) : (
                <ul className="space-y-2">
                  {[...decided].reverse().slice(0, 12).map((match) => (
                    <li key={`${match.round}-${match.order}-${match.winnerName}`} className="flex flex-wrap items-center justify-between gap-2 border-2 border-black bg-white px-4 py-3 text-sm shadow-[3px_3px_0_0_#000]">
                      <span>
                        {match.competitorAName ?? "TBD"} vs {match.competitorBName ?? "TBD"}
                      </span>
                      <span className="font-semibold">
                        {match.winnerName ? `🏆 ${match.winnerName}` : "Bye"}
                        {match.resultMethod ? ` · ${match.resultMethod}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-12">
              <SectionBanner>Published brackets</SectionBanner>
              {brackets.length === 0 ? (
                <p className="bg-white px-2 py-1 text-sm">No bracket has been published for this card yet.</p>
              ) : (
                <div className="space-y-10">
                  {brackets.map((row) => (
                    <div key={row.bracket._id}>
                      <h3 className="mb-4 text-display text-xl font-semibold">{row.division.name}</h3>
                      <BracketView matches={row.matches} roundsCount={row.bracket.roundsCount} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
