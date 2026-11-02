"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { generateBracket, publishBracket } from "@/server/services/bracketService";
import { toAppError } from "@/server/http/errors";

export type BracketActionState = { error?: string };

export async function generateBracketAction(_prevState: BracketActionState, formData: FormData): Promise<BracketActionState> {
  const { user } = await requireRole("ADMIN");

  const divisionId = String(formData.get("divisionId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const orderedIds = String(formData.get("orderedRegistrationIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const mode = formData.get("mode") === "random" ? "random" : "manual";
  const seed = Number(formData.get("seed") ?? Date.now());

  if (orderedIds.length < 2) {
    return { error: "At least two confirmed participants are required to generate a bracket." };
  }

  try {
    await generateBracket(
      String(user._id),
      divisionId,
      orderedIds,
      mode === "random" ? { type: "random", seed } : { type: "manual" }
    );
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}/brackets`);
  return {};
}

export async function publishBracketAction(_prevState: BracketActionState, formData: FormData): Promise<BracketActionState> {
  const { user } = await requireRole("ADMIN");
  const bracketId = String(formData.get("bracketId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");

  try {
    await publishBracket(String(user._id), bracketId);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}/brackets`);
  return {};
}
