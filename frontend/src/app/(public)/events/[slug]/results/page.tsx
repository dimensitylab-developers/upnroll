import { notFound } from "next/navigation";
import { cachedPublicResults } from "@/lib/public-reads";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { NotFoundError } from "@/server/http/errors";


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
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">Results</h1>
        <Table>
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
                <TableCell className="text-brand-gold font-medium">{m.winnerName ?? "—"}</TableCell>
                <TableCell>{m.resultMethod || "—"}</TableCell>
              </TableRow>
            ))}
            {matches.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">No results published yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
