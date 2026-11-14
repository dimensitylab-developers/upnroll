"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import { recalculateRankings } from "@/server/services/rankingService";
import { upsertManualRanking, deleteManualRanking } from "@/server/services/manualRankingService";
import { toAppError } from "@/server/http/errors";

export type RankingActionState = { error?: string; message?: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- useActionState requires this (prevState, formData) signature
export async function recalculateRankingsAction(_prevState: RankingActionState, _formData: FormData): Promise<RankingActionState> {
  const actor = await requireActor("ADMIN");

  try {
    const result = await recalculateRankings(actor);
    invalidatePublicTags(["rankings"]);
    revalidatePath("/admin/rankings");
    revalidatePath("/rankings");
    return { message: `Recalculated (v${result.calculationVersion}) for ${result.fighterCount} fighters.` };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function upsertManualRankingAction(
  _prevState: RankingActionState,
  formData: FormData
): Promise<RankingActionState> {
  const actor = await requireActor("ADMIN");
  try {
    await upsertManualRanking(actor, {
      displayName: String(formData.get("displayName") ?? ""),
      rank: Number(formData.get("rank") ?? 0),
      slug: String(formData.get("slug") ?? ""),
      gender: String(formData.get("gender") ?? ""),
      weightBand: String(formData.get("weightBand") ?? ""),
      experienceLevel: String(formData.get("experienceLevel") ?? ""),
      gym: String(formData.get("gym") ?? ""),
      note: String(formData.get("note") ?? ""),
      published: formData.get("published") === "yes",
    });
    invalidatePublicTags(["rankings"]);
    revalidatePath("/admin/rankings");
    revalidatePath("/rankings");
    return { message: "Manual ranking saved." };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function deleteManualRankingAction(formData: FormData): Promise<void> {
  const actor = await requireActor("ADMIN");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteManualRanking(actor, id);
  invalidatePublicTags(["rankings"]);
  revalidatePath("/admin/rankings");
  revalidatePath("/rankings");
}
