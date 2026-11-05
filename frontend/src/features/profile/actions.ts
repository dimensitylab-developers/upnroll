"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/auth/session";
import { updateFighterProfile } from "@/server/services/fighterService";
import { toAppError } from "@/server/http/errors";
import { FighterProfile } from "@/server/models/FighterProfile";
import { grapplerDetailsSchema, grapplerFieldIssues, grapplerFromForm, toProfileFields } from "@/features/fighters/grappler-schema";
import { readProfilePhoto, saveProfilePhoto } from "@/server/services/profilePhoto";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateProfileAction(_prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const { user } = await requireSession();

  const parsed = grapplerDetailsSchema.safeParse(grapplerFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const issues = grapplerFieldIssues(parsed.data);
  if (Object.keys(issues).length > 0) return { fieldErrors: issues };

  const photo = await readProfilePhoto(formData.get("photo"));
  if ("error" in photo) return { error: photo.error };

  try {
    const existing = await FighterProfile.findOne({ userId: user._id }).select("photoKey").lean();
    const photoKey = "bytes" in photo
      ? await saveProfilePhoto(String(user._id), photo.bytes, photo.ext, existing?.photoKey ?? "")
      : undefined;
    await updateFighterProfile(String(user._id), { ...toProfileFields(parsed.data), photoKey });
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/fighter/profile");
  return { success: true };
}
