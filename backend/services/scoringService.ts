import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import type { JudgeActor } from "@/server/auth/judge-session";
import { assertJudgeCanMutateMatch } from "@/server/auth/judge-session";
import { Match, type MatchDoc } from "@/server/models/Match";
import { MatchScoreEvent } from "@/server/models/MatchScoreEvent";
import { Event } from "@/server/models/Event";
import { Bracket } from "@/server/models/Bracket";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";
import { bindSession, isDuplicateKey, sessionOpts, withTransaction, type DbSession } from "@/server/db/transaction";
import {
  emptyScoringRules,
  isScoringRulesReady,
  provisionalWinnerFromScores,
  type ScoringRulesConfig,
} from "./tournamentRules";
import { nextSlot, canCorrectResult } from "./bracketEngine";
import { enqueueOutboxJob } from "./outboxService";

type Scorer =
  | { kind: "ADMIN"; actor: Actor }
  | { kind: "JUDGE_SESSION"; judge: JudgeActor };

const OPEN_FOR_SCORE = new Set(["SCHEDULED", "LIVE", "DELAYED"]);

function rulesFromEvent(event: { scoringRules?: ScoringRulesConfig | null }): ScoringRulesConfig {
  return (event.scoringRules as ScoringRulesConfig | undefined) ?? emptyScoringRules();
}

async function loadMatchForScoring(matchId: string, session?: DbSession) {
  const match = await bindSession(Match.findById(matchId), session);
  if (!match) throw new NotFoundError("Match not found.");
  return match;
}

export async function getMatchScoringState(matchId: string) {
  requireObjectId(matchId, "match");
  await connectDB();
  const match = await Match.findById(matchId).lean();
  if (!match) throw new NotFoundError("Match not found.");
  const [event, events] = await Promise.all([
    Event.findById(match.eventId).select("name slug timezone scoringRules matCount").lean(),
    MatchScoreEvent.find({ matchId }).sort({ sequence: 1 }).lean(),
  ]);
  const rules = rulesFromEvent(event ?? {});
  const provisional = provisionalWinnerFromScores({
    rules,
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    registrationAId: match.competitorARegistrationId ? String(match.competitorARegistrationId) : null,
    registrationBId: match.competitorBRegistrationId ? String(match.competitorBRegistrationId) : null,
  });
  return {
    match,
    event,
    rules,
    rulesReady: isScoringRulesReady(rules),
    timeline: events.map((e) => ({
      id: String(e._id),
      type: e.type,
      side: e.side,
      value: e.value,
      label: e.label,
      sequence: e.sequence,
      matchVersion: e.matchVersion,
      actorKind: e.actorKind,
      createdAt: e.createdAt,
      reversesEventId: e.reversesEventId ? String(e.reversesEventId) : null,
      reversedByEventId: e.reversedByEventId ? String(e.reversedByEventId) : null,
    })),
    provisional,
  };
}

export async function applyScoreEvent(
  scorer: Scorer,
  input: {
    matchId: string;
    type: "POINT" | "PENALTY" | "ADJUSTMENT";
    side: "A" | "B";
    code: string;
    idempotencyKey: string;
    expectedVersion: number;
  }
) {
  requireObjectId(input.matchId, "match");
  if (!input.idempotencyKey.trim()) throw new ValidationError("Idempotency key is required.");
  await connectDB();

  if (scorer.kind === "JUDGE_SESSION") {
    await assertJudgeCanMutateMatch(scorer.judge, input.matchId);
  } else {
    assertAdmin(scorer.actor);
  }

  try {
    return await withTransaction(async (session) => {
      // Idempotent replay
      const existing = await bindSession(
        MatchScoreEvent.findOne({ matchId: input.matchId, idempotencyKey: input.idempotencyKey }),
        session
      ).lean();
      if (existing) {
        const match = await loadMatchForScoring(input.matchId, session);
        return { match, event: existing, replayed: true as const };
      }

      const match = await loadMatchForScoring(input.matchId, session);
      if (!OPEN_FOR_SCORE.has(match.status)) {
        throw new ConflictError("This match is not open for scoring.");
      }
      if (match.scoreVersion !== input.expectedVersion) {
        throw new ConflictError("Score was updated elsewhere. Refresh and try again.");
      }

      const event = await bindSession(Event.findById(match.eventId), session).lean();
      const rules = rulesFromEvent(event ?? {});
      if (!isScoringRulesReady(rules)) {
        throw new ConflictError("Scoring rules are not configured for this tournament. An admin must configure them before scoring.");
      }

      let delta = 0;
      let label = input.code;
      let penaltyInc = 0;
      if (input.type === "POINT") {
        const rule = rules.points.find((p) => p.code === input.code);
        if (!rule) throw new ValidationError("Unknown point action for this tournament.");
        delta = rule.points;
        label = rule.label;
      } else if (input.type === "PENALTY") {
        const rule = rules.penalties.find((p) => p.code === input.code);
        if (!rule) throw new ValidationError("Unknown penalty for this tournament.");
        delta = -Math.abs(rule.pointsAgainst);
        penaltyInc = 1;
        label = rule.label;
      } else {
        throw new ValidationError("Unsupported score event type.");
      }

      const nextSeq = match.scoreEventSeq + 1;
      const nextVersion = match.scoreVersion + 1;
      if (input.side === "A") {
        match.scoreA += delta;
        match.penaltiesA += penaltyInc;
      } else {
        match.scoreB += delta;
        match.penaltiesB += penaltyInc;
      }
      match.scoreEventSeq = nextSeq;
      match.scoreVersion = nextVersion;
      if (match.status === "SCHEDULED" || match.status === "DELAYED") match.status = "LIVE";

      const provisional = provisionalWinnerFromScores({
        rules,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        registrationAId: match.competitorARegistrationId ? String(match.competitorARegistrationId) : null,
        registrationBId: match.competitorBRegistrationId ? String(match.competitorBRegistrationId) : null,
      });
      match.provisionalWinnerRegistrationId = provisional.registrationId as unknown as MatchDoc["provisionalWinnerRegistrationId"];
      match.provisionalResultMethod = provisional.method;
      await match.save(sessionOpts(session));

      const actorKind = scorer.kind === "ADMIN" ? "ADMIN" : "JUDGE_SESSION";
      const actorId = scorer.kind === "ADMIN" ? scorer.actor.userId : scorer.judge.credentialId;
      const sessionId = scorer.kind === "JUDGE_SESSION" ? scorer.judge.sessionId : null;

      const [created] = await MatchScoreEvent.create(
        [
          {
            matchId: match._id,
            eventId: match.eventId,
            type: input.type,
            side: input.side,
            value: delta,
            label,
            actorKind,
            actorId,
            sessionId,
            sequence: nextSeq,
            matchVersion: nextVersion,
            idempotencyKey: input.idempotencyKey,
            meta: { code: input.code },
          },
        ],
        { session }
      );

      await writeAuditLog(
        {
          actorId,
          action: "MATCH_SCORE_EVENT",
          targetType: "Match",
          targetId: input.matchId,
          after: {
            type: input.type,
            side: input.side,
            code: input.code,
            sequence: nextSeq,
            actorKind,
            sessionId,
          },
        },
        session
      );

      return { match, event: created, replayed: false as const };
    });
  } catch (err) {
    if (isDuplicateKey(err)) {
      const existing = await MatchScoreEvent.findOne({
        matchId: input.matchId,
        idempotencyKey: input.idempotencyKey,
      }).lean();
      const match = await Match.findById(input.matchId);
      if (existing && match) return { match, event: existing, replayed: true as const };
    }
    throw err;
  }
}

export async function undoScoreEvent(
  scorer: Scorer,
  input: { matchId: string; eventId: string; idempotencyKey: string; expectedVersion: number }
) {
  requireObjectId(input.matchId, "match");
  requireObjectId(input.eventId, "score event");
  await connectDB();
  if (scorer.kind === "JUDGE_SESSION") await assertJudgeCanMutateMatch(scorer.judge, input.matchId);
  else assertAdmin(scorer.actor);

  return withTransaction(async (session) => {
    const existingUndo = await bindSession(
      MatchScoreEvent.findOne({ matchId: input.matchId, idempotencyKey: input.idempotencyKey }),
      session
    ).lean();
    if (existingUndo) {
      const match = await loadMatchForScoring(input.matchId, session);
      return { match, event: existingUndo, replayed: true as const };
    }

    const match = await loadMatchForScoring(input.matchId, session);
    if (!OPEN_FOR_SCORE.has(match.status)) throw new ConflictError("This match is not open for scoring.");
    if (match.scoreVersion !== input.expectedVersion) {
      throw new ConflictError("Score was updated elsewhere. Refresh and try again.");
    }

    const original = await bindSession(MatchScoreEvent.findById(input.eventId), session);
    if (!original || String(original.matchId) !== input.matchId) {
      throw new NotFoundError("Score event not found.");
    }
    if (original.reversedByEventId) throw new ConflictError("That event was already undone.");
    if (original.type === "UNDO" || original.type === "FINALIZE") {
      throw new ValidationError("That event cannot be undone.");
    }

    const nextSeq = match.scoreEventSeq + 1;
    const nextVersion = match.scoreVersion + 1;
    if (original.side === "A") {
      match.scoreA -= original.value;
      if (original.type === "PENALTY") match.penaltiesA = Math.max(0, match.penaltiesA - 1);
    } else if (original.side === "B") {
      match.scoreB -= original.value;
      if (original.type === "PENALTY") match.penaltiesB = Math.max(0, match.penaltiesB - 1);
    }
    match.scoreEventSeq = nextSeq;
    match.scoreVersion = nextVersion;
    await match.save(sessionOpts(session));

    const actorKind = scorer.kind === "ADMIN" ? "ADMIN" : "JUDGE_SESSION";
    const actorId = scorer.kind === "ADMIN" ? scorer.actor.userId : scorer.judge.credentialId;
    const [undo] = await MatchScoreEvent.create(
      [
        {
          matchId: match._id,
          eventId: match.eventId,
          type: "UNDO",
          side: original.side,
          value: -original.value,
          label: `Undo: ${original.label}`,
          actorKind,
          actorId,
          sessionId: scorer.kind === "JUDGE_SESSION" ? scorer.judge.sessionId : null,
          sequence: nextSeq,
          matchVersion: nextVersion,
          idempotencyKey: input.idempotencyKey,
          reversesEventId: original._id,
        },
      ],
      { session }
    );
    original.reversedByEventId = undo._id as unknown as typeof original.reversedByEventId;
    await original.save(sessionOpts(session));

    return { match, event: undo, replayed: false as const };
  });
}

async function advanceWinnerIfApplicable(
  bracketId: string,
  round: number,
  order: number,
  winnerRegistrationId: string,
  session: DbSession
) {
  const bracket = await bindSession(Bracket.findById(bracketId), session);
  if (!bracket || round + 1 >= bracket.roundsCount) return;

  const { round: nextRound, order: nextOrder, slot } = nextSlot(round, order);
  const next = await bindSession(Match.findOne({ bracketId, round: nextRound, order: nextOrder }), session);
  if (!next) return;

  if (slot === "A") next.competitorARegistrationId = winnerRegistrationId as unknown as MatchDoc["competitorARegistrationId"];
  else next.competitorBRegistrationId = winnerRegistrationId as unknown as MatchDoc["competitorBRegistrationId"];

  if (next.competitorARegistrationId && next.competitorBRegistrationId && next.status === "PENDING") {
    next.status = "SCHEDULED";
  }
  await next.save(sessionOpts(session));
}

export async function finalizeMatchResult(
  scorer: Scorer,
  input: {
    matchId: string;
    outcomeCode: string;
    winnerRegistrationId?: string | null;
    idempotencyKey: string;
    expectedVersion: number;
  }
) {
  requireObjectId(input.matchId, "match");
  await connectDB();
  if (scorer.kind === "JUDGE_SESSION") await assertJudgeCanMutateMatch(scorer.judge, input.matchId);
  else assertAdmin(scorer.actor);

  return withTransaction(async (session) => {
    const existing = await bindSession(
      MatchScoreEvent.findOne({ matchId: input.matchId, idempotencyKey: input.idempotencyKey }),
      session
    ).lean();
    if (existing) {
      const match = await loadMatchForScoring(input.matchId, session);
      return { match, replayed: true as const };
    }

    const match = await loadMatchForScoring(input.matchId, session);
    if (match.status === "COMPLETED" && match.resultKind === "OFFICIAL") {
      // Repeated finalization must not duplicate side-effects.
      return { match, replayed: true as const };
    }
    if (!OPEN_FOR_SCORE.has(match.status) && match.status !== "COMPLETED") {
      throw new ConflictError("This match cannot be finalized in its current state.");
    }
    if (match.scoreVersion !== input.expectedVersion) {
      throw new ConflictError("Score was updated elsewhere. Refresh and try again.");
    }

    const event = await bindSession(Event.findById(match.eventId), session).lean();
    const rules = rulesFromEvent(event ?? {});
    if (!isScoringRulesReady(rules)) {
      throw new ConflictError("Cannot finalize: scoring rules are not configured for this tournament.");
    }

    const outcome = rules.outcomes.find((o) => o.code === input.outcomeCode);
    if (!outcome) throw new ValidationError("Unknown result outcome for this tournament.");

    let winnerId = input.winnerRegistrationId ?? null;
    let method = outcome.label;

    if (outcome.code === "POINTS" || (rules.winByHighestScore && outcome.code === "POINTS")) {
      const provisional = provisionalWinnerFromScores({
        rules,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        registrationAId: match.competitorARegistrationId ? String(match.competitorARegistrationId) : null,
        registrationBId: match.competitorBRegistrationId ? String(match.competitorBRegistrationId) : null,
      });
      if (!provisional.ready) {
        throw new ValidationError(provisional.reason ?? "Cannot finalize on points yet.");
      }
      winnerId = provisional.registrationId;
      method = provisional.method || outcome.label;
    } else if (outcome.requiresExplicitWinner) {
      if (!winnerId) throw new ValidationError("An explicit winner is required for this outcome.");
    }

    if (winnerId) {
      const competitorIds = [match.competitorARegistrationId, match.competitorBRegistrationId].map((id) => String(id));
      if (!competitorIds.includes(winnerId)) {
        throw new ValidationError("The winner must be one of this match's two competitors.");
      }
    }

    const effectsKey = `finalize:${input.matchId}:v${match.scoreVersion + 1}`;
    if (match.effectsAppliedKey === effectsKey) {
      return { match, replayed: true as const };
    }

    const nextSeq = match.scoreEventSeq + 1;
    const nextVersion = match.scoreVersion + 1;
    const actorKind = scorer.kind === "ADMIN" ? "ADMIN" : "JUDGE_SESSION";
    const actorId = scorer.kind === "ADMIN" ? scorer.actor.userId : scorer.judge.credentialId;

    match.status = "COMPLETED";
    match.resultKind = "OFFICIAL";
    match.winnerRegistrationId = winnerId as unknown as MatchDoc["winnerRegistrationId"];
    match.resultMethod = method;
    match.resultRecordedAt = new Date();
    match.finalizedAt = new Date();
    match.finalizedByKind = actorKind;
    match.finalizedById = actorId as unknown as MatchDoc["finalizedById"];
    if (scorer.kind === "ADMIN") {
      match.resultRecordedBy = scorer.actor.userId as unknown as MatchDoc["resultRecordedBy"];
    }
    match.scoreEventSeq = nextSeq;
    match.scoreVersion = nextVersion;
    match.effectsAppliedKey = effectsKey;
    await match.save(sessionOpts(session));

    if (winnerId) {
      await advanceWinnerIfApplicable(
        match.bracketId.toString(),
        match.round,
        match.order,
        winnerId,
        session
      );
    }

    await MatchScoreEvent.create(
      [
        {
          matchId: match._id,
          eventId: match.eventId,
          type: "FINALIZE",
          side: null,
          value: 0,
          label: method,
          actorKind,
          actorId,
          sessionId: scorer.kind === "JUDGE_SESSION" ? scorer.judge.sessionId : null,
          sequence: nextSeq,
          matchVersion: nextVersion,
          idempotencyKey: input.idempotencyKey,
          meta: { outcomeCode: input.outcomeCode, winnerRegistrationId: winnerId, effectsKey },
        },
      ],
      { session }
    );

    await writeAuditLog(
      {
        actorId,
        action: "MATCH_RESULT_FINALIZED",
        targetType: "Match",
        targetId: input.matchId,
        after: { winnerRegistrationId: winnerId, method, actorKind, effectsKey },
      },
      session
    );

    // Durable side-effect intents (processed outside the request when possible).
    await enqueueOutboxJob(
      {
        type: "RANKINGS_RECALC",
        idempotencyKey: `rankings-after-${effectsKey}`,
        runAt: new Date(),
        payload: { reason: "match_finalized", matchId: input.matchId, effectsKey },
      },
      session
    );
    await enqueueOutboxJob(
      {
        type: "MATCH_RESULT_NOTIFY",
        idempotencyKey: `notify-result-${effectsKey}`,
        runAt: new Date(),
        payload: { matchId: input.matchId, effectsKey },
      },
      session
    );

    return { match, replayed: false as const };
  });
}

export async function updateEventScoringRules(actor: Actor, eventId: string, rules: ScoringRulesConfig) {
  assertAdmin(actor);
  requireObjectId(eventId, "event");
  await connectDB();
  if (rules.configured && !isScoringRulesReady(rules)) {
    throw new ValidationError("Configured scoring rules need at least one outcome (and points if win-by-score is enabled).");
  }
  const event = await Event.findById(eventId);
  if (!event) throw new NotFoundError("Event not found.");
  event.scoringRules = rules as typeof event.scoringRules;
  await event.save();
  await writeAuditLog({
    actorId: actor.userId,
    action: "EVENT_SCORING_RULES_UPDATED",
    targetType: "Event",
    targetId: eventId,
    after: { configured: rules.configured, outcomeCount: rules.outcomes.length },
  });
  return event;
}

export async function adminCorrectOfficialResult(
  actor: Actor,
  matchId: string,
  input: { newWinnerRegistrationId: string; newMethod: string; reason: string }
) {
  assertAdmin(actor);
  requireObjectId(matchId, "match");
  if (!input.reason.trim()) throw new ValidationError("A reason is required to correct a result.");
  await connectDB();

  return withTransaction(async (session) => {
    const match = await loadMatchForScoring(matchId, session);
    if (match.status !== "COMPLETED" || match.resultKind !== "OFFICIAL") {
      throw new ConflictError("Only an official completed result can be corrected this way.");
    }

    const bracket = await bindSession(Bracket.findById(match.bracketId), session);
    let nextMatch = null;
    if (bracket && match.round + 1 < bracket.roundsCount) {
      const { round: nextRound, order: nextOrder } = nextSlot(match.round, match.order);
      nextMatch = await bindSession(Match.findOne({ bracketId: match.bracketId, round: nextRound, order: nextOrder }), session);
    }
    if (!canCorrectResult(nextMatch?.status ?? null)) {
      throw new ConflictError(
        "This result can't be corrected because the next match is already underway or completed. Resolve that conflict explicitly first."
      );
    }

    const before = { winnerRegistrationId: match.winnerRegistrationId, resultMethod: match.resultMethod };
    match.correctionHistory.push({
      previousWinnerRegistrationId: match.winnerRegistrationId,
      previousResultMethod: match.resultMethod,
      reason: input.reason.trim(),
      correctedBy: actor.userId as unknown as MatchDoc["resultRecordedBy"],
      correctedAt: new Date(),
    });
    match.winnerRegistrationId = input.newWinnerRegistrationId as unknown as MatchDoc["winnerRegistrationId"];
    match.resultMethod = input.newMethod;
    match.effectsAppliedKey = `correct:${matchId}:${Date.now()}`;
    await match.save(sessionOpts(session));

    if (nextMatch) {
      await advanceWinnerIfApplicable(
        match.bracketId.toString(),
        match.round,
        match.order,
        input.newWinnerRegistrationId,
        session
      );
    }

    await enqueueOutboxJob(
      {
        type: "RANKINGS_RECALC",
        idempotencyKey: `rankings-after-${match.effectsAppliedKey}`,
        runAt: new Date(),
        payload: { reason: "match_corrected", matchId, effectsKey: match.effectsAppliedKey },
      },
      session
    );

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "MATCH_RESULT_CORRECTED",
        targetType: "Match",
        targetId: matchId,
        before,
        after: {
          winnerRegistrationId: input.newWinnerRegistrationId,
          resultMethod: input.newMethod,
          reason: input.reason.trim(),
        },
      },
      session
    );

    return match;
  });
}

export function assertJudgeMatchScope(judge: JudgeActor, matchId: string) {
  if (judge.matchId !== matchId) throw new ForbiddenError("This scoring session cannot access that match.");
}
