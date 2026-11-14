import { AboutStory } from "@/components/home/about-story";
import { FightingGallery } from "@/components/home/photo-crossfade";
import { HomeHero } from "@/components/home/home-hero";
import { HomeFaqSection } from "@/components/home/home-live";
import { HomeMarquee } from "@/components/home/home-marquee";
import { HowYouEnter } from "@/components/home/how-you-enter";
import { NextEventStrip } from "@/components/home/next-event-strip";
import { FIGHTING_MEDIA } from "@/components/home/site-photos";
import { SectionBanner } from "@/components/home/section-banner";
import { cachedPublicEvents } from "@/lib/public-reads";

export default async function HomePage() {
  const events = await cachedPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main className="route-enter relative">
      <HomeHero />
      <HomeMarquee />
      <NextEventStrip event={featured} />

      <section className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <HowYouEnter />
      </section>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-4">
          <SectionBanner>On the mat</SectionBanner>
        </div>
        <FightingGallery media={FIGHTING_MEDIA} />
      </section>

      <section id="about-us" className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <AboutStory eventSlug={featured?.slug} />
      </section>

      <HomeFaqSection />
    </main>
  );
}
