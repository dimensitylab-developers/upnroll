import { notFound } from "next/navigation";
import { getEventBySlug, listDivisionsForEvent } from "@/server/services/eventService";
import { getPublishedBracketForDivision } from "@/server/services/bracketService";
import { BracketView } from "@/features/brackets/bracket-view";

export const dynamic = "force-dynamic";

export default async function PublicBracketsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let event;
  try {
    event = await getEventBySlug(slug);
  } catch {
    notFound();
  }
  const divisions = await listDivisionsForEvent(String(event._id));

  const brackets = await Promise.all(
    divisions.map(async (d) => {
      try {
        const result = await getPublishedBracketForDivision(String(d._id));
        return { division: d, ...result };
      } catch {
        return null;
      }
    })
  );
  const published = brackets.filter((b): b is NonNullable<typeof b> => b !== null);

  return (
    <div className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">{event.name} — Brackets</h1>
        {published.length === 0 && <p className="text-sm text-muted-foreground">No brackets published yet.</p>}
        <div className="space-y-10">
          {published.map((b) => (
            <div key={String(b.bracket._id)}>
              <h2 className="text-display text-xl font-semibold mb-4">{b.division.name}</h2>
              <BracketView matches={b.matches} roundsCount={b.bracket.roundsCount} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
