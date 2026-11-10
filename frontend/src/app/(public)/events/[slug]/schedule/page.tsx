import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cachedPublicEvent, cachedPublicSchedule } from "@/lib/public-reads";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NotFoundError } from "@/server/http/errors";
import { PageBackLink } from "@/components/layout/page-back-link";
import { ScrollRegion } from "@/components/layout/scroll-region";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await cachedPublicEvent(slug);
    return { title: `${event.name} schedule` };
  } catch {
    return { title: "Schedule" };
  }
}

export default async function PublicSchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let matches;
  try {
    matches = await cachedPublicSchedule(slug);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <PageBackLink href={`/events/${slug}`} label="Back to event" />
        <h1 className="text-display mb-6 text-3xl font-semibold sm:mb-8 sm:text-4xl">Schedule</h1>
        <ScrollRegion label="Swipe for full schedule">
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Matchup</TableHead>
                <TableHead>Mat</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => (
                <TableRow key={String(m._id)}>
                  <TableCell>{m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}</TableCell>
                  <TableCell>{m.mat || "—"}</TableCell>
                  <TableCell>{m.scheduledAt ? new Date(m.scheduledAt as Date).toLocaleString() : "TBA"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{m.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {matches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No published matches yet.
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
