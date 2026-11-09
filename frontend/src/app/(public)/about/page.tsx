import type { Metadata } from "next";
import { connection } from "next/server";
import { listPublicEvents } from "@/server/services/eventService";
import { AboutStory } from "@/components/home/about-story";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  // cacheComponents: DB/mongoose touches current time; opt into request time first.
  await connection();
  const events = await listPublicEvents();
  const featured = events.find((event) => event.status === "REGISTRATION_OPEN") ?? events[0] ?? null;

  return (
    <main className="min-h-screen">
      <AboutStory eventSlug={featured?.slug} page />
    </main>
  );
}
