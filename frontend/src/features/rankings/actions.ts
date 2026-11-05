"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { recalculateRankings } from "@/server/services/rankingService";
import { toAppError } from "@/server/http/errors";

export type RankingActionState = { error?: string; message?: string };

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- useActionState requires this (prevState, formData) signature
export async function recalculateRankingsAction(_prevState: RankingActionState, _formData: FormData): Promise<RankingActionState> {
  const { user } = await requireRole("ADMIN");

  try {
    const result = await recalculateRankings(String(user._id));
    revalidatePath("/admin/rankings");
    revalidatePath("/rankings");
    return { message: `Recalculated (v${result.calculationVersion}) for ${result.fighterCount} fighters.` };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}
