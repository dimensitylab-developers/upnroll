import { redirect } from "next/navigation";
import { getJudgeSession } from "@/server/auth/judge-session";
import { loadJudgeScoringConsole } from "@/features/judge/actions";
import { ScoringConsole } from "@/features/judge/scoring-console";

export const instant = false;

export default async function JudgeScoringPage() {
  const session = await getJudgeSession();
  if (!session) redirect("/judge/login");

  const {
    state,
    fighterA,
    fighterB,
    competitorAName,
    competitorBName,
    registrationAId,
    registrationBId,
  } = await loadJudgeScoringConsole();
  const match = state.match;

  return (
    <ScoringConsole
      matchId={String(match._id)}
      username={session.username}
      status={match.status}
      scoreA={match.scoreA}
      scoreB={match.scoreB}
      penaltiesA={match.penaltiesA ?? 0}
      penaltiesB={match.penaltiesB ?? 0}
      scoreVersion={match.scoreVersion}
      rules={state.rules}
      rulesReady={state.rulesReady}
      fighterA={fighterA}
      fighterB={fighterB}
      competitorAName={competitorAName}
      competitorBName={competitorBName}
      registrationAId={registrationAId}
      registrationBId={registrationBId}
      timeline={state.timeline.map((e) => ({
        id: e.id,
        type: e.type,
        side: e.side ?? "",
        label: e.label,
        sequence: e.sequence,
        reversedByEventId: e.reversedByEventId,
      }))}
      provisionalMethod={state.provisional.method}
      provisionalWinnerId={state.provisional.registrationId}
    />
  );
}
