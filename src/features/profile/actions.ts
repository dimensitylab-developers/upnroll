"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/auth/session";
import { updateFighterProfile } from "@/server/services/fighterService";
import { toAppError } from "@/server/http/errors";
import { updateProfileSchema } from "./schemas";

export type ProfileActionState = { error?: string; success?: boolean };

export async function updateProfileAction(_prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const { user } = await requireSession();

  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    gym: formData.get("gym"),
    discipline: formData.get("discipline"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your profile details and try again." };
  }

  try {
    await updateFighterProfile(String(user._id), parsed.data);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/fighter/profile");
  return { success: true };
}
