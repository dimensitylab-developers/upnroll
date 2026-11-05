import { notFound } from "next/navigation";
import { getPublicFighterBySlug } from "@/server/services/fighterService";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { NotFoundError } from "@/server/http/errors";

export const dynamic = "force-dynamic";

export default async function PublicFighterProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data;
  try {
    data = await getPublicFighterBySlug(slug);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const { profile, record, history } = data;

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-2">{profile.displayName}</h1>
        <p className="text-muted-foreground mb-4">{profile.gym || "Independent"}{profile.discipline ? ` · ${profile.discipline}` : ""}</p>
        <Badge variant="outline" className="mb-8">{record.wins}-{record.losses}</Badge>

        <h2 className="text-display text-xl font-semibold mb-3">Match history</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Opponent(s)</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((m) => (
              <TableRow key={String(m._id)}>
                <TableCell>{m.event?.name ?? "Unknown"}</TableCell>
                <TableCell>{m.competitorAName} vs {m.competitorBName}</TableCell>
                <TableCell>{m.winnerName ? `${m.winnerName} — ${m.resultMethod}` : "—"}</TableCell>
              </TableRow>
            ))}
            {history.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">No completed matches yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
