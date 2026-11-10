import { notFound } from "next/navigation";
import { requireActor } from "@/server/auth/session";
import { NotFoundError } from "@/server/http/errors";
import { getEventForAdmin } from "@/server/services/eventService";
import { listMatchesForEvent } from "@/server/services/matchService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { MatchResultDialog } from "@/features/matches/match-result-dialog";
import { ScheduleMatchDialog } from "@/features/matches/schedule-match-dialog";
import { PageBackLink } from "@/components/layout/page-back-link";

const UPCOMING_STATUSES = new Set(["PENDING", "SCHEDULED"]);
const COMPLETED_STATUSES = new Set(["COMPLETED", "BYE"]);

type EnrichedMatch = Awaited<ReturnType<typeof listMatchesForEvent>>[number];

function groupByDivisionAndRound(matches: EnrichedMatch[]) {
  const byDivision = new Map<string, Map<number, EnrichedMatch[]>>();
  for (const m of matches) {
    if (!byDivision.has(m.divisionName)) byDivision.set(m.divisionName, new Map());
    const byRound = byDivision.get(m.divisionName)!;
    if (!byRound.has(m.round)) byRound.set(m.round, []);
    byRound.get(m.round)!.push(m);
  }
  return byDivision;
}

function ScheduleStatusBadge({ scheduledAt, mat }: { scheduledAt: Date | string | null | undefined; mat: string }) {
  if (!scheduledAt && !mat) {
    return <Badge variant="outline">Unscheduled</Badge>;
  }
  const dateLabel = scheduledAt
    ? new Date(scheduledAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "No time set";
  return (
    <Badge variant="secondary">
      {dateLabel}
      {mat ? ` · ${mat}` : ""}
    </Badge>
  );
}

function MatchTable({ eventId, matches }: { eventId: string; matches: EnrichedMatch[] }) {
  const grouped = groupByDivisionAndRound(matches);

  if (matches.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-8">No matches in this view.</p>;
  }

  return (
    <div className="space-y-8">
      {[...grouped.entries()].map(([divisionName, byRound]) => (
        <div key={divisionName}>
          <h2 className="text-display text-lg font-semibold mb-3">{divisionName}</h2>
          {[...byRound.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([round, roundMatches]) => (
              <div key={round} className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Round {round + 1}</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matchup</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roundMatches.map((m) => (
                        <TableRow key={String(m._id)}>
                          <TableCell>{m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}</TableCell>
                          <TableCell><Badge variant="outline">{m.status}</Badge></TableCell>
                          <TableCell>
                            <ScheduleStatusBadge scheduledAt={m.scheduledAt} mat={m.mat} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.winnerName ? `${m.winnerName} — ${m.resultMethod}` : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {m.competitorARegistrationId && m.competitorBRegistrationId && (
                                <ScheduleMatchDialog
                                  eventId={eventId}
                                  matchId={String(m._id)}
                                  currentScheduledAt={m.scheduledAt}
                                  currentMat={m.mat}
                                />
                              )}
                              {m.status === "SCHEDULED" && m.competitorARegistrationId && m.competitorBRegistrationId ? (
                                <MatchResultDialog
                                  eventId={eventId}
                                  matchId={String(m._id)}
                                  competitorAId={String(m.competitorARegistrationId)}
                                  competitorAName={m.competitorAName ?? "Competitor A"}
                                  competitorBId={String(m.competitorBRegistrationId)}
                                  competitorBName={m.competitorBName ?? "Competitor B"}
                                  mode="record"
                                />
                              ) : m.status === "COMPLETED" && m.competitorARegistrationId && m.competitorBRegistrationId ? (
                                <MatchResultDialog
                                  eventId={eventId}
                                  matchId={String(m._id)}
                                  competitorAId={String(m.competitorARegistrationId)}
                                  competitorAName={m.competitorAName ?? "Competitor A"}
                                  competitorBId={String(m.competitorBRegistrationId)}
                                  competitorBName={m.competitorBName ?? "Competitor B"}
                                  mode="correct"
                                  currentWinnerId={String(m.winnerRegistrationId)}
                                  currentMethod={m.resultMethod}
                                />
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default async function AdminMatchesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await requireActor("ADMIN");
  let event;
  try {
    event = await getEventForAdmin(actor, id);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    throw err;
  }
  const matches = await listMatchesForEvent(actor, id);
  const upcoming = matches.filter((m) => UPCOMING_STATUSES.has(m.status));
  const completed = matches.filter((m) => COMPLETED_STATUSES.has(m.status));

  return (
    <div className="mx-auto max-w-6xl px-0 sm:px-6">
      <PageBackLink href={`/admin/events/${id}`} label="Back to event" />
      <PageHeader title={`Matches — ${event.name}`} />
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <MatchTable eventId={id} matches={upcoming} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <MatchTable eventId={id} matches={completed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
