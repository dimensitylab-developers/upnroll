import { listPublicEvents } from "@/server/services/eventService";
import { AboutStory } from "@/components/home/about-story";
import { FightingGallery } from "@/components/home/photo-crossfade";
import { HappyStack } from "@/components/home/happy-stack";
import { HomeHero } from "@/components/home/home-hero";
import { FIGHTING_PHOTOS, HAPPY_PHOTOS } from "@/components/home/site-photos";
import { MangaCards } from "@/components/home/manga-cards";
import { SectionBanner } from "@/components/home/section-banner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main>
      <HomeHero />

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
        <HappyStack photos={HAPPY_PHOTOS} />
      </section>

      <section id="about-us" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <AboutStory eventSlug={featured?.slug} />
      </section>
    </main>
  );
}
