"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/server/auth/session";
import { updateEventScoringRules } from "@/server/services/scoringService";
import type { ScoringRulesConfig } from "@/server/services/tournamentRules";
import { toAppError } from "@/server/http/errors";
import { invalidatePublicTags } from "@/lib/public-tags";

export type ScoringAdminActionState = { error?: string; ok?: boolean };

function parseRulesJson(raw: string): ScoringRulesConfig | { error: string } {
  try {
    const parsed = JSON.parse(raw) as ScoringRulesConfig;
    if (typeof parsed.configured !== "boolean") return { error: "Rules JSON must include configured: true/false." };
    return parsed;
  } catch {
    return { error: "Invalid scoring rules JSON." };
  }
}

export async function saveScoringRulesAction(
  _prev: ScoringAdminActionState,
  formData: FormData
): Promise<ScoringAdminActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const rulesRaw = String(formData.get("rulesJson") ?? "");
  const parsed = parseRulesJson(rulesRaw);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await updateEventScoringRules(actor, eventId, parsed);
    invalidatePublicTags(["schedule", `event:${eventId}`]);
    revalidatePath(`/admin/events/${eventId}/scoring-rules`);
    revalidatePath(`/admin/events/${eventId}`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return { ok: true };
}
