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
import { JudgeCredentialsPanel } from "@/features/matches/judge-credentials-panel";
import { fetchJudgeCredentialMeta } from "@/features/matches/judge-credential-actions";
import { PageBackLink } from "@/components/layout/page-back-link";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

const UPCOMING_STATUSES = new Set(["PENDING", "SCHEDULED"]);
const COMPLETED_STATUSES = new Set(["COMPLETED", "BYE"]);

type EnrichedMatch = Awaited<ReturnType<typeof listMatchesForEvent>>[number];
type JudgeMeta = Awaited<ReturnType<typeof fetchJudgeCredentialMeta>>;

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
    <Badge variant="secondary" className="whitespace-normal text-left">
      {dateLabel}
      {mat ? ` · ${mat}` : ""}
    </Badge>
  );
}

function MatchActions({
  eventId,
  match: m,
  judgeMeta,
}: {
  eventId: string;
  match: EnrichedMatch;
  judgeMeta: JudgeMeta;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      {m.competitorARegistrationId && m.competitorBRegistrationId && (
        <>
          <ScheduleMatchDialog
            eventId={eventId}
            matchId={String(m._id)}
            currentScheduledAt={m.scheduledAt}
            currentMat={m.mat}
          />
          <JudgeCredentialsPanel
            eventId={eventId}
            matchId={String(m._id)}
            meta={judgeMeta}
            canIssue={Boolean(m.competitorARegistrationId && m.competitorBRegistrationId)}
            scheduleWarning={!m.scheduledAt}
          />
        </>
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
  );
}

function MatchTable({
  eventId,
  matches,
  judgeMetaByMatch,
}: {
  eventId: string;
  matches: EnrichedMatch[];
  judgeMetaByMatch: Map<string, JudgeMeta>;
}) {
  const grouped = groupByDivisionAndRound(matches);

  if (matches.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No matches in this view.</p>;
  }

  return (
    <div className="space-y-8">
      {[...grouped.entries()].map(([divisionName, byRound]) => (
        <div key={divisionName}>
          <h2 className="text-display mb-3 text-lg font-semibold break-words">{divisionName}</h2>
          {[...byRound.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([round, roundMatches]) => (
              <div key={round} className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Round {round + 1}</h3>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {roundMatches.map((m) => (
                    <article
                      key={String(m._id)}
                      className="border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000]"
                    >
                      <p className="text-display text-base font-semibold break-words">
                        {m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{m.status}</Badge>
                        <ScheduleStatusBadge scheduledAt={m.scheduledAt} mat={m.mat} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {m.winnerName ? `${m.winnerName} — ${m.resultMethod}` : "No result yet"}
                      </p>
                      <div className="mt-3">
                        <MatchActions
                          eventId={eventId}
                          match={m}
                          judgeMeta={judgeMetaByMatch.get(String(m._id)) ?? null}
                        />
                      </div>
                    </article>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
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
                          <TableCell>
                            {m.competitorAName ?? "TBD"} vs {m.competitorBName ?? "TBD"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{m.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <ScheduleStatusBadge scheduledAt={m.scheduledAt} mat={m.mat} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {m.winnerName ? `${m.winnerName} — ${m.resultMethod}` : "—"}
                          </TableCell>
                          <TableCell className="align-top">
                            <MatchActions
                              eventId={eventId}
                              match={m}
                              judgeMeta={judgeMetaByMatch.get(String(m._id)) ?? null}
                            />
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
  const judgeMetaEntries = await Promise.all(
    matches.map(async (m) => [String(m._id), await fetchJudgeCredentialMeta(String(m._id))] as const)
  );
  const judgeMetaByMatch = new Map(judgeMetaEntries);
  const upcoming = matches.filter((m) => UPCOMING_STATUSES.has(m.status));
  const completed = matches.filter((m) => COMPLETED_STATUSES.has(m.status));

  return (
    <div className="mx-auto max-w-6xl px-1 sm:px-6">
      <PageBackLink href={`/admin/events/${id}`} label="Back to event" />
      <PageHeader title={`Matches — ${event.name}`} />
      <Tabs defaultValue="upcoming">
        <TabsList className="flex h-auto w-full flex-wrap gap-1">
          <TabsTrigger value="upcoming" className="flex-1 min-w-[8rem]">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 min-w-[8rem]">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <MatchTable eventId={id} matches={upcoming} judgeMetaByMatch={judgeMetaByMatch} />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <MatchTable eventId={id} matches={completed} judgeMetaByMatch={judgeMetaByMatch} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
