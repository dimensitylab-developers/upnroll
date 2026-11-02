import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug, listDivisionsForEvent } from "@/server/services/eventService";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Badge variant="outline" className="mb-3">{event.status.replaceAll("_", " ")}</Badge>
        <h1 className="text-display text-4xl font-semibold mb-2">{event.name}</h1>
        <p className="text-muted-foreground mb-6">
          {new Date(event.startDate).toLocaleDateString()} · {event.venue || "Venue TBA"}
        </p>

        <div className="flex gap-3 mb-8">
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
    </div>
  );
}
