import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cachedPublicDivisions, cachedPublicEvent, cachedPublishedBracket } from "@/lib/public-reads";
import { BracketView } from "@/features/brackets/bracket-view";
import { PageBackLink } from "@/components/layout/page-back-link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await cachedPublicEvent(slug);
    return { title: `${event.name} brackets` };
  } catch {
    return { title: "Brackets" };
  }
}

export default async function PublicBracketsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let event;
  try {
    event = await cachedPublicEvent(slug);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <PageBackLink href={`/events/${slug}`} label="Back to event" />
        <h1 className="text-display mb-6 text-3xl font-semibold break-words sm:mb-8 sm:text-4xl">
          {event.name} — Brackets
        </h1>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading brackets…</p>}>
          <DivisionBrackets eventId={String(event._id)} />
        </Suspense>
      </div>
    </main>
  );
}

async function DivisionBrackets({ eventId }: { eventId: string }) {
  const divisions = await cachedPublicDivisions(eventId);
  const brackets = await Promise.all(
    divisions.map(async (division) => {
      try {
        const result = await cachedPublishedBracket(division._id);
        return { division, ...result };
      } catch {
        return null;
      }
    })
  );
  const published = brackets.filter((bracket): bracket is NonNullable<typeof bracket> => bracket !== null);

  return (
    <>
      {published.length === 0 && <p className="text-sm text-muted-foreground">No brackets published yet.</p>}
      <div className="space-y-10">
        {published.map((bracket) => (
          <div key={String(bracket.bracket._id)}>
            <h2 className="text-display mb-4 text-xl font-semibold">{bracket.division.name}</h2>
            <BracketView matches={bracket.matches} roundsCount={bracket.bracket.roundsCount} />
          </div>
        ))}
      </div>
    </>
  );
}
