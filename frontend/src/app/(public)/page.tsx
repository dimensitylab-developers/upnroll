import Link from "next/link";
import { listDivisionsForEvent, listPublicEvents } from "@/server/services/eventService";
import { listPublicRankings } from "@/server/services/rankingService";
import { listPublished } from "@/server/services/contentService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HomeGlimpse } from "@/components/home/home-glimpse";
import { PhotoCrossfade } from "@/components/home/photo-crossfade";
import { FIGHTING_PHOTOS, HAPPY_PHOTOS } from "@/components/home/site-photos";
import { SectionBanner } from "@/components/home/section-banner";
import { FaqBoard } from "@/features/content/faq-board";

export const dynamic = "force-dynamic";

const PATH_STEPS = [
  { n: "01", title: "Create an account", body: "Register as a grappler and sign in." },
  { n: "02", title: "Choose a division", body: "Pick the open card and the division you fight in." },
  { n: "03", title: "Follow the bracket", body: "Once you are in, track every round through to the final." },
];

const MEDALS = ["Gold", "Silver", "Bronze"];

export default async function HomePage() {
  const [events, rankings, faqs] = await Promise.all([
    listPublicEvents(),
    listPublicRankings(),
    listPublished("FAQ"),
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
            <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-4">Earn your role</p>
            <h1 id="home-wordmark" className="max-w-xl">
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="w-full h-auto" />
            </h1>
            <p className="mt-6 max-w-xl text-lg">
              Built for grapplers in India and Brazil. Real fights. Real pay. Real rankings.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild size="lg">
                <Link href={featuredEvent ? `/events/${featuredEvent.slug}` : "/register"}>Register for the card</Link>
              </Button>
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
        <ol className="grid sm:grid-cols-3 gap-4">
          {PATH_STEPS.map((step) => (
            <li key={step.n} className="bg-card border-2 border-black rounded-md p-4 shadow-[6px_6px_0_0_#000]">
              <p className="text-display text-brand-red font-semibold">{step.n}</p>
              <p className="font-semibold mt-2">{step.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <SectionBanner>The rules</SectionBanner>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">Beginner</p>
            <p className="mt-2 font-semibold">White belts.</p>
            <p className="mt-2 text-sm">Permitted: standard chokes, armbar, kimura, americana, omoplata, straight foot lock.</p>
            <p className="mt-2 text-sm">Prohibited: heel hooks, toe holds, knee bars, calf slicers, flying submissions, jumping guard, neck cranks, spine cranks, twisters, slams.</p>
          </div>
          <div className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">Intermediate</p>
            <p className="mt-2 font-semibold">Blue and purple belts.</p>
            <p className="mt-2 text-sm">Also permitted: toe hold, knee bar, calf slicer, flying submissions, jumping guard.</p>
            <p className="mt-2 text-sm">Still prohibited: heel hooks, neck cranks, spine cranks, twisters, slams.</p>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm">
          A penalty takes a point off. A repeated penalty can end the match. The full 12 July card stays on its{" "}
          <Link href="/events/held/no-gi-12-july-2026" className="underline">record</Link>.
        </p>
      </section>

      <HomeGlimpse
        eventSlug={featuredEvent?.slug}
        fighting={<PhotoCrossfade photos={FIGHTING_PHOTOS} />}
        happy={
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HAPPY_PHOTOS.map((photo) => (
              <li key={photo.src} className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} className="h-auto w-full object-contain" />
              </li>
            ))}
          </ul>
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
              {featuredEvent.description === "Road to Super Fight." ? "Road to Super Fight. " : ""}
              {new Date(featuredEvent.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {` · ${featuredEvent.venue || "Venue to be announced"}`}
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
                    <span className="text-brand-gold font-semibold mr-3">{MEDALS[r.rank - 1] ?? `#${r.rank}`}</span>
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
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="flex items-end justify-between gap-4 mb-2">
            <SectionBanner>Frequently asked</SectionBanner>
            <Link href="/faq" className="text-sm underline mb-6">View all</Link>
          </div>
          <FaqBoard
            items={faqs.slice(0, 4).map((f) => ({
              id: String(f._id),
              question: f.title,
              answer: f.body,
            }))}
          />
        </section>
      )}
    </main>
  );
}
