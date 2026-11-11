"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  applyScoreEvent,
  finalizeMatchResult,
  getMatchScoringState,
  undoScoreEvent,
} from "@/server/services/scoringService";
import { loginJudge, destroyJudgeSession, requireJudgeSession } from "@/server/auth/judge-session";
import { connectDB } from "@/server/db/connect";
import { Registration } from "@/server/models/Registration";
import { FighterProfile } from "@/server/models/FighterProfile";
import { toAppError } from "@/server/http/errors";
import { headers } from "next/headers";
import { invalidatePublicTags } from "@/lib/public-tags";

export type JudgeActionState = { error?: string; ok?: boolean };

export async function judgeLoginAction(_prev: JudgeActionState, formData: FormData): Promise<JudgeActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Enter the username and password from the organizer." };

  try {
    const h = await headers();
    await loginJudge(username, password, h.get("user-agent") ?? undefined);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  redirect("/judge");
}

export async function judgeLogoutAction() {
  await destroyJudgeSession();
  redirect("/judge/login");
}

export type JudgeFighterCard = {
  registrationId: string | null;
  displayName: string;
  slug: string | null;
  academy: string;
  gym: string;
  beltRank: string;
  weightDivision: string;
  discipline: string;
  hasPhoto: boolean;
};

function toJudgeFighterCard(
  registrationId: string | null,
  profile: {
    displayName?: string;
    slug?: string;
    academy?: string;
    gym?: string;
    beltRank?: string;
    weightDivision?: string;
    discipline?: string;
    photoKey?: string;
  } | null,
  fallbackName: string
): JudgeFighterCard {
  return {
    registrationId,
    displayName: profile?.displayName?.trim() || fallbackName,
    slug: profile?.slug?.trim() || null,
    academy: profile?.academy?.trim() || "",
    gym: profile?.gym?.trim() || "",
    beltRank: profile?.beltRank?.trim() || "",
    weightDivision: profile?.weightDivision?.trim() || "",
    discipline: profile?.discipline?.trim() || "",
    hasPhoto: Boolean(profile?.photoKey?.trim()),
  };
}

export async function loadJudgeScoringConsole() {
  const judge = await requireJudgeSession();
  const state = await getMatchScoringState(judge.matchId);
  const match = state.match;

  await connectDB();
  const regIds = [match.competitorARegistrationId, match.competitorBRegistrationId].filter(Boolean).map(String);
  const regs = await Registration.find({ _id: { $in: regIds } }).select("userId").lean();
  const profiles = await FighterProfile.find({ userId: { $in: regs.map((r) => r.userId) } })
    .select("displayName slug academy gym beltRank weightDivision discipline photoKey userId")
    .lean();
  const profileByUser = new Map(profiles.map((p) => [String(p.userId), p]));
  const profileByReg = new Map(
    regs.map((r) => [String(r._id), profileByUser.get(String(r.userId)) ?? null])
  );

  const registrationAId = match.competitorARegistrationId ? String(match.competitorARegistrationId) : null;
  const registrationBId = match.competitorBRegistrationId ? String(match.competitorBRegistrationId) : null;
  const fighterA = toJudgeFighterCard(
    registrationAId,
    registrationAId ? profileByReg.get(registrationAId) ?? null : null,
    "Competitor A"
  );
  const fighterB = toJudgeFighterCard(
    registrationBId,
    registrationBId ? profileByReg.get(registrationBId) ?? null : null,
    "Competitor B"
  );

  return {
    judge,
    state,
    fighterA,
    fighterB,
    competitorAName: fighterA.displayName,
    competitorBName: fighterB.displayName,
    registrationAId,
    registrationBId,
  };
}

export async function judgeScorePointAction(_prev: JudgeActionState, formData: FormData): Promise<JudgeActionState> {
  const judge = await requireJudgeSession();
  const matchId = String(formData.get("matchId") ?? "");
  const side = String(formData.get("side") ?? "") as "A" | "B";
  const code = String(formData.get("code") ?? "");
  const kind = String(formData.get("kind") ?? "POINT");
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  const expectedVersion = Number(formData.get("expectedVersion") ?? 0);

  if (matchId !== judge.matchId) return { error: "This session cannot score that match." };

  try {
    await applyScoreEvent(
      { kind: "JUDGE_SESSION", judge },
      {
        matchId,
        type: kind === "PENALTY" ? "PENALTY" : "POINT",
        side,
        code,
        idempotencyKey,
        expectedVersion,
      }
    );
    invalidatePublicTags(["schedule"]);
    revalidatePath("/judge");
    return { ok: true };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function judgeUndoScoreAction(_prev: JudgeActionState, formData: FormData): Promise<JudgeActionState> {
  const judge = await requireJudgeSession();
  const matchId = String(formData.get("matchId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  const expectedVersion = Number(formData.get("expectedVersion") ?? 0);

  if (matchId !== judge.matchId) return { error: "This session cannot score that match." };

  try {
    await undoScoreEvent(
      { kind: "JUDGE_SESSION", judge },
      { matchId, eventId, idempotencyKey, expectedVersion }
    );
    revalidatePath("/judge");
    return { ok: true };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function judgeFinalizeAction(_prev: JudgeActionState, formData: FormData): Promise<JudgeActionState> {
  const judge = await requireJudgeSession();
  const matchId = String(formData.get("matchId") ?? "");
  const outcomeCode = String(formData.get("outcomeCode") ?? "");
  const winnerRegistrationId = String(formData.get("winnerRegistrationId") ?? "") || null;
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  const expectedVersion = Number(formData.get("expectedVersion") ?? 0);

  if (matchId !== judge.matchId) return { error: "This session cannot score that match." };

  try {
    await finalizeMatchResult(
      { kind: "JUDGE_SESSION", judge },
      { matchId, outcomeCode, winnerRegistrationId, idempotencyKey, expectedVersion }
    );
    invalidatePublicTags(["schedule", "rankings", "fighters", "brackets"]);
    revalidatePath("/judge");
    revalidatePath("/fighter/matches");
    return { ok: true };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}
