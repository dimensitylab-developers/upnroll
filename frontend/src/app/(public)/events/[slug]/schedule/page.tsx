import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cachedPublicEvent, cachedPublicSchedule } from "@/lib/public-reads";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NotFoundError } from "@/server/http/errors";


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
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">Schedule</h1>
        <Table>
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
                <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
              </TableRow>
            ))}
            {matches.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No published matches yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
