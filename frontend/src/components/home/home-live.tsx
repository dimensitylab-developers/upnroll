import Link from "next/link";
import { cachedPublicDivisions, cachedPublicEvents, cachedPublishedContent, cachedPublishedMedia, cachedPublicRankings } from "@/lib/public-reads";
import { Badge } from "@/components/ui/badge";
import { HomeGlimpse } from "@/components/home/home-glimpse";
import { pickHomeFaqs } from "@/components/home/home-faq-data";
import { HomeFaqTimeline } from "@/components/home/home-faq-timeline";
import { SectionBanner } from "@/components/home/section-banner";

const GALLERY = [
  { src: "/gallery/grappling-mat.jpg", alt: "Grappling match on the mat" },
  { src: "/gallery/clinch.jpg", alt: "Fighters locked in a clinch" },
  { src: "/gallery/grappling-throw.jpg", alt: "Grappling throw on the blue mat" },
];

export async function HomeGlimpseSection() {
  const [events, media] = await Promise.all([cachedPublicEvents(), cachedPublishedMedia()]);
  const featuredEvent = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <HomeGlimpse
      eventSlug={featuredEvent?.slug}
      fighting={
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY.map((shot) => (
              <figure key={shot.src} className="bg-card border-2 border-black rounded-md overflow-hidden shadow-[6px_6px_0_0_#000]">
                <img src={shot.src} alt={shot.alt} className="w-full h-auto" />
              </figure>
            ))}
          </div>
          {media.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              {media.map((item) => (
                <figure key={String(item._id)} className="bg-card border-2 border-black rounded-md overflow-hidden shadow-[6px_6px_0_0_#000]">
                  <img src={item.externalUrl} alt={item.caption} className="w-full h-auto" />
                  <figcaption className="px-3 py-2 text-sm">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </>
      }
      happy={
        <figure className="bg-card border-2 border-black rounded-md overflow-hidden shadow-[6px_6px_0_0_#000]">
          <img src="/gallery/happy-medal.jpg" alt="Fighter with a medal beside a friend at the event" className="w-full h-auto" />
        </figure>
      }
    />
  );
}

export async function HomeEventsSection() {
  const events = await cachedPublicEvents();
  const featuredEvent = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;
  const upcoming = events.filter((event) => event._id !== featuredEvent?._id).slice(0, 3);
  const divisions = featuredEvent ? await cachedPublicDivisions(featuredEvent._id) : [];

  return (
    <>
      {featuredEvent && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <SectionBanner>Featured event</SectionBanner>
          <div className="bg-card border-2 border-black rounded-md p-6 sm:p-8 shadow-[6px_6px_0_0_#000]">
            <Badge className="mb-4 bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40">
              {featuredEvent.status.replaceAll("_", " ")}
            </Badge>
            <h3 className="text-display text-3xl sm:text-4xl font-semibold mb-2">
              <Link href={`/events/${featuredEvent.slug}`} className="hover:underline">{featuredEvent.name}</Link>
            </h3>
            <p className="text-muted-foreground">
              {new Date(featuredEvent.startDate).toLocaleDateString(undefined, { dateStyle: "long" })}
              {featuredEvent.venue ? ` · ${featuredEvent.venue}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <Link href={`/events/${featuredEvent.slug}/brackets`} className="underline">Brackets</Link>
              <Link href={`/events/${featuredEvent.slug}/schedule`} className="underline">Schedule</Link>
              <Link href={`/events/${featuredEvent.slug}/results`} className="underline">Results</Link>
            </div>
            {divisions.length > 0 && (
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {divisions.map((division) => (
                  <li key={String(division._id)} className="bg-card border-2 border-black rounded-md p-4">
                    <p className="font-semibold">{division.name}</p>
                    <p className="text-sm text-muted-foreground">{division.discipline} · {division.capacity} spots</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-end justify-between gap-4 mb-2">
            <SectionBanner>More events</SectionBanner>
            <Link href="/events" className="text-sm underline mb-6">View all</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {upcoming.map((event) => (
              <Link key={String(event._id)} href={`/events/${event.slug}`} className="manga-panel p-4">
                <p className="font-semibold">{event.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString()}
                  {event.venue ? ` · ${event.venue}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <p className="copy-slab text-sm text-muted-foreground">No events published yet. Check back soon.</p>
        </section>
      )}
    </>
  );
}

export async function HomeRankingsSection() {
  const rankings = await cachedPublicRankings();
  const topRankings = rankings.slice(0, 5);
  if (topRankings.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
      <div className="flex items-end justify-between gap-4 mb-2">
        <SectionBanner>Rankings</SectionBanner>
        <Link href="/rankings" className="text-sm underline mb-6">View all</Link>
      </div>
      <div className="bg-card border-2 border-black rounded-md p-6 shadow-[6px_6px_0_0_#000]">
        <ol className="divide-y divide-black/10">
          {topRankings.map((row) => (
            <li key={row.slug ?? row.rank} className="flex items-center justify-between py-2.5">
              <span>
                <span className="text-brand-gold font-semibold mr-3">#{row.rank}</span>
                {row.slug ? <Link href={`/fighters/${row.slug}`} className="hover:underline">{row.displayName}</Link> : row.displayName}
              </span>
              <span className="text-sm text-muted-foreground">{row.wins}-{row.losses}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export async function HomeFaqSection() {
  const faqs = await cachedPublishedContent("FAQ");
  const items = pickHomeFaqs(faqs, 5);
  if (items.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="mb-2 flex items-end justify-between gap-4">
        <SectionBanner>Asked on the mat</SectionBanner>
        <Link href="/faq" className="mb-6 text-sm font-semibold underline underline-offset-2">
          Full FAQ
        </Link>
      </div>
      <HomeFaqTimeline items={items} />
    </section>
  );
}
