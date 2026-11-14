import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  cachedPublicDivisions,
  cachedPublicEvent,
  cachedPublicResults,
  cachedPublishedMediaForEvent,
} from "@/lib/public-reads";
import { HeldRecord, type HeldRecordData } from "@/components/events/held-record";
import { SuperfightLanding } from "@/components/events/superfight-landing";
import { Badge } from "@/components/ui/badge";
import { PageBackLink } from "@/components/layout/page-back-link";
import { getEventAnnouncementBoard } from "@/server/services/announcementService";
import { MatchAnnouncementBanner } from "@/components/events/match-announcement-banner";

function isVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

const SUPERFIGHT_SLUG = "up-n-roll-superfight-series";

export default async function PublicEventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // cacheComponents: Date formatting + live announcement board need request time.
  await connection();
  const { slug } = await params;
  let event;
  try {
    event = await cachedPublicEvent(slug);
  } catch {
    notFound();
  }

  const [divisions, announcementBoard] = await Promise.all([
    cachedPublicDivisions(event._id),
    getEventAnnouncementBoard(slug).catch(() => null),
  ]);

  if (event.status === "COMPLETED") {
    const [media, results] = await Promise.all([
      cachedPublishedMediaForEvent(event._id),
      cachedPublicResults(slug).catch(() => []),
    ]);
    const finals = new Map<string, { name: string; round: number }>();
    for (const match of results) {
      if (!match.winnerName) continue;
      const current = finals.get(match.divisionName);
      if (!current || match.round > current.round) {
        finals.set(match.divisionName, { name: match.winnerName, round: match.round });
      }
    }
    const date = new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const record: HeldRecordData = {
      name: event.name,
      date,
      summary: "This card is finished. The date stays. Photographs, video, the winner, the bracket, and the rankings stay with it.",
      photos: media.filter((item) => !isVideo(item.externalUrl)).map((item) => ({ src: item.externalUrl, alt: item.caption })),
      videos: media.filter((item) => isVideo(item.externalUrl)).map((item) => ({ src: item.externalUrl, caption: item.caption })),
      winners: [...finals.entries()].map(([division, winner]) => ({ name: winner.name, division, photo: null })),
      divisions: divisions.map((division) => ({
        name: division.name,
        detail: `${division.discipline} · ${division.capacity} spots`,
      })),
      rounds: [
        { label: "Mats", detail: `${event.matCount ?? 1} mat${(event.matCount ?? 1) === 1 ? "" : "s"}. Open matches were split across them.` },
      ],
      scoringNote: "",
      scoring: [],
      rules: [],
      bracket: "Winners move forward. If someone is out, they continue on the other side of the card.",
      bracketHref: `/events/${slug}/brackets`,
      rankingsNote: "The public board counts 3 points for each win until the official formula is set. Wins from this card are part of that board once the results are published.",
      rankings: [...finals.values()].map((winner) => ({ name: winner.name, note: "Final" })),
      ending: ["Submission", "Points", "Disqualification", "Referee stoppage", "Withdrawal"],
      endingNote: "A match on this card ended by one of those, and the result stays on the public results list.",
    };

    return (
      <main className="route-enter min-h-screen bg-background halftone-bg px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <PageBackLink href="/events" label="Back to events" />
          <div className="mt-2">
            <HeldRecord record={record} />
          </div>
        </div>
      </main>
    );
  }

  if (slug === SUPERFIGHT_SLUG) {
    const start = new Date(event.startDate);
    return (
      <SuperfightLanding
        name={event.name}
        dateLabel={start.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        weekdayLabel={start.toLocaleDateString("en-IN", { weekday: "long" })}
        venue={event.venue || "Mumbai"}
        status={event.status}
        canRegister={event.status === "REGISTRATION_OPEN"}
        registerUntil={
          event.status === "REGISTRATION_OPEN"
            ? new Date(event.registrationClosesAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : null
        }
      />
    );
  }

  const venue = event.venue || "Venue to be announced";
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;

  return (
    <main className="route-enter min-h-screen bg-background halftone-bg px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <PageBackLink href="/events" label="Back to events" />
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Upcoming event</p>
        <h1 className="text-display mb-2 text-3xl font-semibold break-words sm:text-4xl">
          {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </h1>
        <p className="copy-slab mb-2 text-muted-foreground">{event.name}</p>
        <p className="mb-6">
          <a href={mapsHref} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-red underline">
            {venue}
          </a>
        </p>

        {announcementBoard && (
          <MatchAnnouncementBanner mats={announcementBoard.mats} eventName={announcementBoard.eventName} />
        )}

        <div className="mb-8 flex flex-wrap gap-x-4 gap-y-2">
          {event.status === "REGISTRATION_OPEN" && (
            <Link href="/fighter/registrations/new" className="min-h-11 inline-flex items-center text-sm font-semibold text-brand-red">
              Register now
            </Link>
          )}
        </div>

        <Badge variant="outline" className="mb-3">
          {event.status.replaceAll("_", " ")}
        </Badge>
        <p className="copy-slab text-sm text-muted-foreground">
          Experience level and weight class are chosen on the registration form.
        </p>
      </div>
    </main>
  );
}
