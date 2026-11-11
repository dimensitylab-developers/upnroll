"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/server/auth/session";
import {
  generateMatchJudgeCredentials,
  getActiveJudgeCredentialMeta,
  regenerateMatchJudgeCredentials,
  revokeMatchJudgeCredentials,
} from "@/server/services/judgeCredentialService";
import { toAppError } from "@/server/http/errors";

export type JudgeCredentialActionState = {
  error?: string;
  oneTime?: { username: string; password: string; generation: number };
};

export async function generateJudgeCredentialsAction(
  _prev: JudgeCredentialActionState,
  formData: FormData
): Promise<JudgeCredentialActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  try {
    const cred = await generateMatchJudgeCredentials(actor, matchId);
    revalidatePath(`/admin/events/${eventId}/matches`);
    return { oneTime: { username: cred.username, password: cred.password, generation: cred.generation } };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function regenerateJudgeCredentialsAction(
  _prev: JudgeCredentialActionState,
  formData: FormData
): Promise<JudgeCredentialActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  try {
    const cred = await regenerateMatchJudgeCredentials(actor, matchId);
    revalidatePath(`/admin/events/${eventId}/matches`);
    return { oneTime: { username: cred.username, password: cred.password, generation: cred.generation } };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function revokeJudgeCredentialsAction(
  _prev: JudgeCredentialActionState,
  formData: FormData
): Promise<JudgeCredentialActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const matchId = String(formData.get("matchId") ?? "");
  try {
    await revokeMatchJudgeCredentials(actor, matchId);
    revalidatePath(`/admin/events/${eventId}/matches`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return {};
}

export async function fetchJudgeCredentialMeta(matchId: string) {
  const actor = await requireActor("ADMIN");
  return getActiveJudgeCredentialMeta(actor, matchId);
}
