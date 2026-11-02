"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { createMediaAsset } from "@/server/services/mediaService";
import { toAppError } from "@/server/http/errors";
import { createMediaSchema } from "./schemas";

export type MediaActionState = { error?: string };

export async function createMediaAction(_prevState: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const { user } = await requireRole("ADMIN");

  const parsed = createMediaSchema.safeParse({
    caption: formData.get("caption"),
    externalUrl: formData.get("externalUrl"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the media details and try again." };
  }

  try {
    await createMediaAsset(String(user._id), parsed.data);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/media");
  return {};
}
