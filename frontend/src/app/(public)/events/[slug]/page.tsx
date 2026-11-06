import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug, listDivisionsForEvent } from "@/server/services/eventService";
import { listPublicResults } from "@/server/services/matchService";
import { listPublishedMediaForEvent } from "@/server/services/mediaService";
import { HeldRecord, type HeldRecordData } from "@/components/events/held-record";
import { Badge } from "@/components/ui/badge";

function isVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export const dynamic = "force-dynamic";

export default async function PublicEventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
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
          <Link href="/events" className="text-sm font-semibold text-brand-red">All events</Link>
          <div className="mt-6">
            <HeldRecord record={record} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-3">{event.status.replaceAll("_", " ")}</Badge>
        <h1 className="text-display text-4xl font-semibold mb-2">{event.name}</h1>
        {event.description === "Road to Super Fight." && <p className="mb-2">Road to Super Fight</p>}
        <p className="text-muted-foreground mb-6">
          {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          {` · ${event.venue || "Venue to be announced"}`}
        </p>

        <div className="flex gap-3 mb-8">
          {event.status === "REGISTRATION_OPEN" && <Link href="/register" className="text-sm font-semibold text-brand-red">Register</Link>}
          <Link href={`/events/${slug}/brackets`} className="text-sm underline">Brackets</Link>
          <Link href={`/events/${slug}/schedule`} className="text-sm underline">Schedule</Link>
          <Link href={`/events/${slug}/results`} className="text-sm underline">Results</Link>
        </div>

        <h2 className="text-display text-xl font-semibold mb-3">Divisions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
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
