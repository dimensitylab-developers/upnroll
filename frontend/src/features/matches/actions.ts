"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import { recordMatchResult, correctMatchResult, updateMatchSchedule } from "@/server/services/matchService";
import { toAppError } from "@/server/http/errors";

export type MatchActionState = { error?: string };

export async function recordResultAction(_prevState: MatchActionState, formData: FormData): Promise<MatchActionState> {
  const actor = await requireActor("ADMIN");
  const matchId = String(formData.get("matchId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const winnerRegistrationId = String(formData.get("winnerRegistrationId") ?? "");
  const method = String(formData.get("method") ?? "");

  try {
    await recordMatchResult(actor, matchId, winnerRegistrationId, method);
    invalidatePublicTags(["schedule", "rankings", "fighters"]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}/matches`);
  revalidatePath("/brackets");
  revalidatePath("/rankings");
  return {};
}

export async function correctResultAction(_prevState: MatchActionState, formData: FormData): Promise<MatchActionState> {
  const actor = await requireActor("ADMIN");
  const matchId = String(formData.get("matchId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const winnerRegistrationId = String(formData.get("winnerRegistrationId") ?? "");
  const method = String(formData.get("method") ?? "");
  const reason = String(formData.get("reason") ?? "");

  try {
    await correctMatchResult(actor, matchId, winnerRegistrationId, method, reason);
    invalidatePublicTags(["schedule", "rankings", "fighters"]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}/matches`);
  revalidatePath("/brackets");
  revalidatePath("/rankings");
  return {};
}

export async function updateScheduleAction(_prevState: MatchActionState, formData: FormData): Promise<MatchActionState> {
  const actor = await requireActor("ADMIN");
  const matchId = String(formData.get("matchId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const mat = String(formData.get("mat") ?? "");
  const scheduledAtRaw = String(formData.get("scheduledAt") ?? "");

  try {
    await updateMatchSchedule(actor, matchId, {
      mat,
      scheduledAt: scheduledAtRaw ? new Date(scheduledAtRaw) : null,
    });
    invalidatePublicTags(["schedule"]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}/matches`);
  revalidatePath("/brackets");
  return {};
}
