import Link from "next/link";
import { listDivisionsForEvent, listPublicEvents } from "@/server/services/eventService";
import { listPublicRankings } from "@/server/services/rankingService";
import { listPublished } from "@/server/services/contentService";
import { listPublishedMedia } from "@/server/services/mediaService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HomeGlimpse } from "@/components/home/home-glimpse";
import { SectionBanner } from "@/components/home/section-banner";

export const dynamic = "force-dynamic";

const GALLERY = [
  { src: "/gallery/grappling-mat.jpg", alt: "Grappling match on the mat" },
  { src: "/gallery/clinch.jpg", alt: "Fighters locked in a clinch" },
  { src: "/gallery/grappling-throw.jpg", alt: "Grappling throw on the blue mat" },
];

const PATH_STEPS = [
  { n: "01", title: "Create an account", body: "Register as a fighter and sign in." },
  { n: "02", title: "Choose a division", body: "Pick an open event and the division you fight in." },
  { n: "03", title: "Submit payment", body: "Send the payment details for an admin to review." },
  { n: "04", title: "Follow the bracket", body: "Once you are in, track every round through to the final." },
];

export default async function HomePage() {
  const [events, rankings, faqs, media] = await Promise.all([
    listPublicEvents(),
    listPublicRankings(),
    listPublished("FAQ"),
    listPublishedMedia(),
  ]);

  const featuredEvent = events.find((e) => e.status === "REGISTRATION_OPEN") ?? events[0] ?? null;
  const upcoming = events.filter((e) => e._id !== featuredEvent?._id).slice(0, 3);
  const topRankings = rankings.slice(0, 5);
  const divisions = featuredEvent ? await listDivisionsForEvent(String(featuredEvent._id)) : [];

  return (
    <main>
      <section className="speed-lines border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-4">The Underground Arena</p>
            <h1 id="home-wordmark" className="max-w-xl">
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="w-full h-auto" />
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
          <div className="mx-auto w-full max-w-[320px] bg-black border-2 border-black rounded-md overflow-hidden shadow-[6px_6px_0_0_#000]">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              width={1080}
              height={1920}
              className="aspect-[9/16] w-full h-auto object-contain bg-black"
              src="/Videos/IMG_7263.MP4_2.mp4"
            >
              Up &apos;n Roll fight footage
            </video>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <SectionBanner>How you enter</SectionBanner>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PATH_STEPS.map((step) => (
            <li key={step.n} className="bg-card border-2 border-black rounded-md p-4 shadow-[6px_6px_0_0_#000]">
              <p className="text-display text-brand-red font-semibold">{step.n}</p>
              <p className="font-semibold mt-2">{step.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Payment uses the organizer&apos;s QR instructions. This site does not take card payments.
        </p>
      </section>

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

      {featuredEvent && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <SectionBanner>Featured event</SectionBanner>
          <div className="bg-card border-2 border-black rounded-md p-6 sm:p-8 shadow-[6px_6px_0_0_#000] halftone-bg">
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
                {divisions.map((d) => (
                  <li key={String(d._id)} className="bg-card border-2 border-black rounded-md p-4">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.discipline} · {d.capacity} spots</p>
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
            {upcoming.map((e) => (
              <Link key={String(e._id)} href={`/events/${e.slug}`} className="manga-panel p-4">
                <p className="font-semibold">{e.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(e.startDate).toLocaleDateString()}
                  {e.venue ? ` · ${e.venue}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <p className="text-sm text-muted-foreground">No events published yet — check back soon.</p>
        </section>
      )}

      {topRankings.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-end justify-between gap-4 mb-2">
            <SectionBanner>Rankings</SectionBanner>
            <Link href="/rankings" className="text-sm underline mb-6">View all</Link>
          </div>
          <div className="bg-card border-2 border-black rounded-md p-6 shadow-[6px_6px_0_0_#000]">
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

      {faqs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-end justify-between gap-4 mb-2">
            <SectionBanner>Frequently asked</SectionBanner>
            <Link href="/faq" className="text-sm underline mb-6">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {faqs.map((f) => (
              <div key={String(f._id)} className="manga-panel p-4">
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-sm text-muted-foreground">
        The on-site assistant answers from the published FAQ.
      </p>
    </main>
  );
}
