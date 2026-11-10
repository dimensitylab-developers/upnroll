"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import { getFighterProfile, updateFighterProfile } from "@/server/services/fighterService";
import { toAppError } from "@/server/http/errors";
import { grapplerDetailsSchema, grapplerFieldIssues, grapplerFromForm, toProfileFields } from "@/features/fighters/grappler-schema";
import { readProfilePhoto, saveProfilePhoto } from "@/server/services/profilePhoto";

export type ProfileActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateProfileAction(_prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const actor = await requireActor("FIGHTER");

  const parsed = grapplerDetailsSchema.safeParse(grapplerFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const issues = grapplerFieldIssues(parsed.data);
  if (Object.keys(issues).length > 0) return { fieldErrors: issues };

  const photo = await readProfilePhoto(formData.get("photo"));
  if ("error" in photo) return { error: photo.error };

  const existing = await getFighterProfile(actor);
  if (!existing) {
    return {
      error: "Your fighter profile was not found. Sign out, sign in again, or contact support if this keeps happening.",
    };
  }

  let photoKey: string | undefined;
  if ("bytes" in photo) {
    try {
      photoKey = await saveProfilePhoto(actor, photo.bytes, photo.ext, existing.photoKey ?? "");
    } catch (err) {
      // Photo is optional on profile — keep text save possible when storage is misconfigured.
      const mapped = toAppError(err);
      if (mapped.code === "STORAGE_MISCONFIGURED") {
        return {
          error: `${mapped.message} Tip: clear the photo field and save your details first.`,
        };
      }
      return { error: mapped.message };
    }
  }

  let slug = existing.slug ?? "";
  try {
    const profile = await updateFighterProfile(actor, { ...toProfileFields(parsed.data), photoKey });
    slug = profile.slug ?? slug;
  } catch (err) {
    return { error: toAppError(err).message };
  }

  // Durable write already succeeded — never fail the user for cache-tag side effects.
  try {
    invalidatePublicTags(slug ? ["fighters", `fighter:${slug}`] : ["fighters"]);
  } catch {
    /* ignore */
  }

  revalidatePath("/fighter/profile");
  revalidatePath("/fighter/dashboard");
  if (slug) revalidatePath(`/fighters/${slug}`);
  return { success: true };
}
