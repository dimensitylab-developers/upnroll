import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getEventBySlug, listDivisionsForEvent } from "@/server/services/eventService";
import { listPublicResults } from "@/server/services/matchService";
import { listPublishedMediaForEvent } from "@/server/services/mediaService";
import { HeldRecord, type HeldRecordData } from "@/components/events/held-record";
import { SuperfightLanding } from "@/components/events/superfight-landing";
import { Badge } from "@/components/ui/badge";

function isVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

const SUPERFIGHT_SLUG = "up-n-roll-superfight-series";

export default async function PublicEventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // cacheComponents: DB/mongoose touches current time; opt into request time first.
  await connection();
  const { slug } = await params;
  let event;
  try {
    event = await getEventBySlug(slug);
  } catch {
    notFound();
  }
  const divisions = await listDivisionsForEvent(String(event._id));

  if (event.status === "COMPLETED") {
    const [media, results] = await Promise.all([
      listPublishedMediaForEvent(String(event._id)),
      listPublicResults(slug).catch(() => []),
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
      <main className="min-h-screen bg-background halftone-bg px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <Link href="/events" className="text-sm font-semibold text-brand-red">
            All events
          </Link>
          <div className="mt-6">
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
        slug={slug}
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
        matCount={event.matCount ?? 1}
        divisions={divisions.map((division) => ({
          id: String(division._id),
          name: division.name,
          discipline: division.discipline,
          capacity: division.capacity,
        }))}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <Badge variant="outline" className="mb-3">
          {event.status.replaceAll("_", " ")}
        </Badge>
        <h1 className="text-display mb-2 text-4xl font-semibold">{event.name}</h1>
        {event.description === "Road to Super Fight." && <p className="mb-2">Road to Super Fight</p>}
        <p className="mb-6 text-muted-foreground">
          {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          {` · ${event.venue || "Venue to be announced"}`}
        </p>

        <div className="mb-8 flex gap-3">
          {event.status === "REGISTRATION_OPEN" && (
            <Link href="/register" className="text-sm font-semibold text-brand-red">
              Register
            </Link>
          )}
          <Link href={`/events/${slug}/brackets`} className="text-sm underline">
            Brackets
          </Link>
          <Link href={`/events/${slug}/schedule`} className="text-sm underline">
            Schedule
          </Link>
          <Link href={`/events/${slug}/results`} className="text-sm underline">
            Results
          </Link>
        </div>

        <h2 className="text-display mb-3 text-xl font-semibold">Divisions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {divisions.map((d) => (
            <div key={String(d._id)} className="manga-panel p-4">
              <p className="font-medium">{d.name}</p>
              <p className="text-sm text-muted-foreground">{d.discipline}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
