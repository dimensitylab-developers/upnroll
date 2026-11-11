import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cachedPublicEvent, cachedPublicResults } from "@/lib/public-reads";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { NotFoundError } from "@/server/http/errors";
import { PageBackLink } from "@/components/layout/page-back-link";
import { ScrollRegion } from "@/components/layout/scroll-region";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await cachedPublicEvent(slug);
    return { title: `${event.name} results` };
  } catch {
    return { title: "Results" };
  }
}

export default async function PublicResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let matches;
  try {
    matches = await cachedPublicResults(slug);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <PageBackLink href={`/events/${slug}`} label="Back to event" />
        <h1 className="text-display copy-slab mb-6 text-3xl font-semibold sm:mb-8 sm:text-4xl">Results</h1>
        <ScrollRegion label="Swipe for full results">
          <Table className="min-w-[32rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Matchup</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => (
                <TableRow key={String(m._id)}>
                  <TableCell>{m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}</TableCell>
                  <TableCell className="font-medium text-brand-gold">{m.winnerName ?? "—"}</TableCell>
                  <TableCell>{m.resultMethod || "—"}</TableCell>
                </TableRow>
              ))}
              {matches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    No results published yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollRegion>
      </div>
    </main>
  );
}
