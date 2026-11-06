import Link from "next/link";
import { listPublicEvents } from "@/server/services/eventService";
import { Button } from "@/components/ui/button";
import { AboutStory } from "@/components/home/about-story";
import { FightingGallery } from "@/components/home/photo-crossfade";
import { FIGHTING_PHOTOS, HAPPY_PHOTOS } from "@/components/home/site-photos";
import { MangaCards } from "@/components/home/manga-cards";
import { SectionBanner } from "@/components/home/section-banner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main>
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] sm:p-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-red">Earn your role</p>
            <h1 id="home-wordmark" className="max-w-xl">
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-auto w-full" />
            </h1>
            <p className="mt-6 max-w-xl text-lg">
              Built for grapplers in India and Brazil. Real fights. Real pay. Real rankings.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-md border-2 border-black bg-black shadow-[6px_6px_0_0_#000]">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              width={1080}
              height={1920}
              className="aspect-[9/16] h-auto w-full bg-black object-contain"
              src="/Videos/IMG_7263.MP4_2.mp4"
            >
              Up &apos;n Roll fight footage
            </video>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionBanner>On the mat</SectionBanner>
        <MangaCards />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionBanner>Fighting</SectionBanner>
        <FightingGallery photos={FIGHTING_PHOTOS} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
        <SectionBanner>Happy moments</SectionBanner>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HAPPY_PHOTOS.map((photo) => (
            <li key={photo.src} className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
              <div className="flex aspect-[4/3] items-center justify-center bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} className="max-h-full max-w-full object-contain" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="about-us" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <AboutStory eventSlug={featured?.slug} />
      </section>
    </main>
  );
}
