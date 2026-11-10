import { AboutStory } from "@/components/home/about-story";
import { FightingGallery } from "@/components/home/photo-crossfade";
import { HappyStack } from "@/components/home/happy-stack";
import { HomeHero } from "@/components/home/home-hero";
import { EventPitchPopup } from "@/components/home/event-pitch-popup";
import { EmojiStrip, MatEmojis } from "@/components/home/mat-emojis";
import { FIGHTING_MEDIA, HAPPY_PHOTOS } from "@/components/home/site-photos";
import { MangaBackdrop, MangaCards } from "@/components/home/manga-cards";
import { SectionBanner } from "@/components/home/section-banner";
import { cachedPublicEvents } from "@/lib/public-reads";

export default async function HomePage() {
  // Published event list is cross-request cached; mutations invalidate the "events" tag.
  const events = await cachedPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main className="route-enter relative">
      <EventPitchPopup />
      <MangaBackdrop className="top-[28rem] hidden min-h-[80vh] lg:block" />
      <HomeHero />

      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
        <MatEmojis className="absolute inset-0 opacity-35" />
        <div className="relative mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionBanner>On the mat</SectionBanner>
            <p className="mt-3 max-w-xl bg-white px-2 py-1 text-sm">
              Manga panels from the fight tape — slam, clinch, lock, sweep, choke.
            </p>
          </div>
          <EmojiStrip
            className="justify-end"
            size={38}
            emojis={["double-leg-takedown", "armbar", "hip-throw", "rear-naked-choke"]}
          />
        </div>
        <div className="relative">
          <MangaCards />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionBanner>Fighting</SectionBanner>
          <EmojiStrip size={30} emojis={["knee-slice", "mount", "clinch-collar-tie", "triangle-choke"]} />
        </div>
        <FightingGallery media={FIGHTING_MEDIA} />
      </section>

      <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionBanner>Happy moments</SectionBanner>
          <EmojiStrip size={30} emojis={["hip-throw", "armbar", "double-leg-takedown", "rear-naked-choke"]} />
        </div>
        <HappyStack photos={HAPPY_PHOTOS} />
      </section>

      <section id="about-us" className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <AboutStory eventSlug={featured?.slug} />
      </section>
    </main>
  );
}
