"use client";

import { useActionState } from "react";
import {
  generateJudgeCredentialsAction,
  regenerateJudgeCredentialsAction,
  revokeJudgeCredentialsAction,
  type JudgeCredentialActionState,
} from "./judge-credential-actions";
import { Button } from "@/components/ui/button";

type Meta = {
  credentialId: string;
  username: string;
  generation: number;
  issuedAt: Date | string;
  status: string;
} | null;

export function JudgeCredentialsPanel({
  eventId,
  matchId,
  meta,
  canIssue,
  scheduleWarning,
}: {
  eventId: string;
  matchId: string;
  meta: Meta;
  canIssue: boolean;
  scheduleWarning?: boolean;
}) {
  const [genState, generate, generating] = useActionState(generateJudgeCredentialsAction, {} as JudgeCredentialActionState);
  const [regenState, regen, regenerating] = useActionState(regenerateJudgeCredentialsAction, {} as JudgeCredentialActionState);
  const [revokeState, revoke, revoking] = useActionState(revokeJudgeCredentialsAction, {} as JudgeCredentialActionState);

  const oneTime = regenState.oneTime ?? genState.oneTime ?? null;
  const err = genState.error || regenState.error || revokeState.error;
  const busy = generating || regenerating || revoking;

  return (
    <div className="mt-2 w-full min-w-0 space-y-2 border-2 border-black bg-[#f7f4ef] p-3 text-xs shadow-[3px_3px_0_0_#000] sm:max-w-md">
      <p className="font-semibold uppercase tracking-wider">Judge access</p>
      {scheduleWarning && (
        <p className="text-brand-red">No scheduled time — timed 10-minute reminders will not be enqueued for this match.</p>
      )}
      {meta ? (
        <p className="break-all">
          Active <span className="font-mono">{meta.username}</span> · gen {meta.generation}
        </p>
      ) : (
        <p className="text-muted-foreground">No active credentials.</p>
      )}
      {oneTime && (
        <div className="border-2 border-black bg-black p-2 text-white" role="status">
          <p className="font-semibold uppercase text-brand-red">View once</p>
          <p className="break-all">
            User: <span className="font-mono">{oneTime.username}</span>
          </p>
          <p className="break-all">
            Pass: <span className="font-mono">{oneTime.password}</span>
          </p>
          <p className="mt-1 text-white/70">Share with the mat official. Password is not shown again.</p>
        </div>
      )}
      {err && <p className="text-destructive">{err}</p>}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {canIssue && !meta && (
          <form action={generate} className="w-full sm:w-auto">
            <input type="hidden" name="eventId" value={eventId} />
            <input type="hidden" name="matchId" value={matchId} />
            <Button type="submit" size="sm" disabled={busy} className="min-h-10 w-full border-2 border-black sm:w-auto">
              Generate
            </Button>
          </form>
        )}
        {meta && (
          <>
            <form action={regen} className="w-full sm:w-auto">
              <input type="hidden" name="eventId" value={eventId} />
              <input type="hidden" name="matchId" value={matchId} />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={busy}
                className="min-h-10 w-full border-2 border-black sm:w-auto"
              >
                Regenerate
              </Button>
            </form>
            <form action={revoke} className="w-full sm:w-auto">
              <input type="hidden" name="eventId" value={eventId} />
              <input type="hidden" name="matchId" value={matchId} />
              <Button type="submit" size="sm" variant="destructive" disabled={busy} className="min-h-10 w-full sm:w-auto">
                Revoke
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
