import Link from "next/link";
import { cachedPublicEvents } from "@/lib/public-reads";
import { Badge } from "@/components/ui/badge";
import { PastNogiCard } from "@/components/events/past-nogi-card";

export default async function PublicEventsPage() {
  const events = await cachedPublicEvents();

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">Events</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => (
            <Link key={String(e._id)} href={`/events/${e.slug}`} className="manga-panel p-5">
              <p className="font-semibold">{e.name}</p>
              <p className="text-sm text-muted-foreground">{new Date(e.startDate).toLocaleDateString()}</p>
              <Badge variant="outline" className="mt-2">{e.status.replaceAll("_", " ")}</Badge>
            </Link>
          ))}
          {events.length === 0 && <p className="text-sm text-muted-foreground">No events published yet.</p>}
        </div>
        <PastNogiCard />
      </div>
    </main>
  );
}
