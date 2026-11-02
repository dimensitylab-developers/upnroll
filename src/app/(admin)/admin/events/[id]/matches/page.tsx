import { notFound } from "next/navigation";
import { getEventForAdmin } from "@/server/services/eventService";
import { listMatchesForEvent } from "@/server/services/matchService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MatchResultDialog } from "@/features/matches/match-result-dialog";

export default async function AdminMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event;
  try {
    event = await getEventForAdmin(id);
  } catch {
    notFound();
  }
  const matches = await listMatchesForEvent(id);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-6">Matches — {event.name}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Round</TableHead>
            <TableHead>Matchup</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((m) => (
            <TableRow key={String(m._id)}>
              <TableCell>{m.round + 1}.{m.order + 1}</TableCell>
              <TableCell>{m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}</TableCell>
              <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {m.winnerName ? `${m.winnerName} — ${m.resultMethod}` : "—"}
              </TableCell>
              <TableCell>
                {m.status === "SCHEDULED" && m.competitorARegistrationId && m.competitorBRegistrationId ? (
                  <MatchResultDialog
                    eventId={id}
                    matchId={String(m._id)}
                    competitorAId={String(m.competitorARegistrationId)}
                    competitorAName={m.competitorAName ?? "Competitor A"}
                    competitorBId={String(m.competitorBRegistrationId)}
                    competitorBName={m.competitorBName ?? "Competitor B"}
                    mode="record"
                  />
                ) : m.status === "COMPLETED" && m.competitorARegistrationId && m.competitorBRegistrationId ? (
                  <MatchResultDialog
                    eventId={id}
                    matchId={String(m._id)}
                    competitorAId={String(m.competitorARegistrationId)}
                    competitorAName={m.competitorAName ?? "Competitor A"}
                    competitorBId={String(m.competitorBRegistrationId)}
                    competitorBName={m.competitorBName ?? "Competitor B"}
                    mode="correct"
                    currentWinnerId={String(m.winnerRegistrationId)}
                    currentMethod={m.resultMethod}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {matches.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                No matches yet — generate a bracket first.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
