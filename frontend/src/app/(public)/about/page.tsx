import type { Metadata } from "next";
import { listPublicEvents } from "@/server/services/eventService";
import { AboutStory } from "@/components/home/about-story";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const events = await listPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main className="min-h-screen">
      <AboutStory eventSlug={featured?.slug} page />
    </main>
  );
}
