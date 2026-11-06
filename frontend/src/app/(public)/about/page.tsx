import type { Metadata } from "next";
import { listPublicEvents } from "@/server/services/eventService";
import { AboutStory } from "@/components/home/about-story";

export const metadata: Metadata = { title: "About Us" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const events = await listPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <AboutStory eventSlug={featured?.slug} page />
      </div>
    </main>
  );
}
