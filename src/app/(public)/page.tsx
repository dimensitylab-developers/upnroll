import Link from "next/link";
import { listPublicEvents } from "@/server/services/eventService";
import { listPublicRankings } from "@/server/services/rankingService";
import { listPublished } from "@/server/services/contentService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, rankings, faqs] = await Promise.all([
    listPublicEvents(),
    listPublicRankings(),
    listPublished("FAQ"),
  ]);

  const featuredEvent = events.find((e) => e.status === "REGISTRATION_OPEN") ?? events[0] ?? null;
  const upcoming = events.filter((e) => e._id !== featuredEvent?._id).slice(0, 3);
  const topRankings = rankings.slice(0, 5);

  return (
    <main>
      {/* Hero */}
      <section className="speed-lines border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-4">The Underground Arena</p>
          <h1 className="text-display text-5xl sm:text-7xl font-semibold leading-[0.95] max-w-3xl">
            Up &apos;n Roll
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg">
            Combat sports tournaments, run properly. Register for a division, track your record,
            and follow every bracket from first round to final.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button asChild size="lg"><Link href="/register">Register to compete</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/events">Browse events</Link></Button>
          </div>
        </div>
      </section>

      {/* Featured event */}
      {featuredEvent && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">Featured event</p>
          <Link href={`/events/${featuredEvent.slug}`} className="manga-panel block p-8 sm:p-10 halftone-bg">
            <Badge className="mb-4 bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40">
              {featuredEvent.status.replaceAll("_", " ")}
            </Badge>
            <h2 className="text-display text-3xl sm:text-4xl font-semibold mb-2">{featuredEvent.name}</h2>
            <p className="text-muted-foreground">
              {new Date(featuredEvent.startDate).toLocaleDateString(undefined, { dateStyle: "long" })}
              {featuredEvent.venue ? ` · ${featuredEvent.venue}` : ""}
            </p>
          </Link>
        </section>
      )}

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">More events</p>
            <Link href="/events" className="text-sm underline">View all</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {upcoming.map((e) => (
              <Link key={String(e._id)} href={`/events/${e.slug}`} className="manga-panel p-4">
                <p className="font-semibold">{e.name}</p>
                <p className="text-sm text-muted-foreground">{new Date(e.startDate).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-sm text-muted-foreground">No events published yet — check back soon.</p>
        </section>
      )}

      {/* Rankings preview */}
      {topRankings.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Rankings</p>
            <Link href="/rankings" className="text-sm underline">View all</Link>
          </div>
          <div className="manga-panel p-6">
            <ol className="divide-y divide-black/10">
              {topRankings.map((r) => (
                <li key={r.slug ?? r.rank} className="flex items-center justify-between py-2.5">
                  <span>
                    <span className="text-brand-gold font-semibold mr-3">#{r.rank}</span>
                    {r.slug ? <Link href={`/fighters/${r.slug}`} className="hover:underline">{r.displayName}</Link> : r.displayName}
                  </span>
                  <span className="text-sm text-muted-foreground">{r.wins}-{r.losses}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* FAQ preview */}
      {faqs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Frequently asked</p>
            <Link href="/faq" className="text-sm underline">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {faqs.slice(0, 4).map((f) => (
              <div key={String(f._id)} className="manga-panel p-4">
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
