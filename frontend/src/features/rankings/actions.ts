"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import { recalculateRankings } from "@/server/services/rankingService";
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
