import type { Metadata } from "next";
import { cachedPublicEvents } from "@/lib/public-reads";
import { AboutStory } from "@/components/home/about-story";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const events = await cachedPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main className="route-enter min-h-screen">
      <AboutStory eventSlug={featured?.slug} page />
    </main>
  );
}
