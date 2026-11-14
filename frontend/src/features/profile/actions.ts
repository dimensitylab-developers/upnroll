"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import { getFighterProfile, updateFighterProfile } from "@/server/services/fighterService";
import { toAppError } from "@/server/http/errors";
import {
  grapplerDetailsSchema,
  grapplerFieldIssues,
  grapplerFromForm,
  isMinorAge,
  toProfileFields,
} from "@/features/fighters/grappler-schema";
import {
  readAadhaarImage,
  readParentalConsentImage,
  readProfilePhoto,
  saveAadhaarImage,
  saveParentalConsentImage,
  saveProfilePhoto,
} from "@/server/services/profilePhoto";

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
  const minor = isMinorAge(parsed.data.age);
  const issues = grapplerFieldIssues(
    { ...parsed.data, parentalConsent: String(formData.get("parentalConsent") ?? "") },
    { requireParentalConsent: minor }
  );
  if (Object.keys(issues).length > 0) return { fieldErrors: issues };

  const photo = await readProfilePhoto(formData.get("photo"));
  if ("error" in photo) return { error: photo.error };

  const aadhaar = await readAadhaarImage(formData.get("aadhaarImage"));
  if ("error" in aadhaar) return { error: aadhaar.error };

  const parentalConsent = await readParentalConsentImage(formData.get("parentalConsentImage"));
  if ("error" in parentalConsent) return { error: parentalConsent.error };

  const existing = await getFighterProfile(actor);
  if (!existing) {
    return {
      error: "Your fighter profile was not found. Sign out, sign in again, or contact support if this keeps happening.",
    };
  }

  if (minor && "empty" in parentalConsent && !existing.parentalConsentImageKey) {
    return {
      error: "Upload a signed parental consent form.",
      fieldErrors: { parentalConsentImage: ["Upload a signed parental consent form."] },
    };
  }

  let photoKey: string | undefined;
  if ("bytes" in photo) {
    try {
      photoKey = await saveProfilePhoto(actor, photo.bytes, photo.ext, existing.photoKey ?? "");
    } catch (err) {
      const mapped = toAppError(err);
      if (mapped.code === "STORAGE_MISCONFIGURED") {
        return {
          error: `${mapped.message} Tip: clear the photo field and save your details first.`,
        };
      }
      return { error: mapped.message };
    }
  }

  let aadhaarImageKey: string | undefined;
  if ("bytes" in aadhaar) {
    try {
      aadhaarImageKey = await saveAadhaarImage(actor, aadhaar.bytes, aadhaar.ext, existing.aadhaarImageKey ?? "");
    } catch (err) {
      const mapped = toAppError(err);
      if (mapped.code === "STORAGE_MISCONFIGURED") {
        return {
          error: `${mapped.message} Tip: clear the identity proof field and save your details first.`,
        };
      }
      return { error: mapped.message };
    }
  }

  let parentalConsentImageKey: string | undefined;
  if ("bytes" in parentalConsent) {
    try {
      parentalConsentImageKey = await saveParentalConsentImage(
        actor,
        parentalConsent.bytes,
        parentalConsent.ext,
        existing.parentalConsentImageKey ?? ""
      );
    } catch (err) {
      const mapped = toAppError(err);
      if (mapped.code === "STORAGE_MISCONFIGURED") {
        return {
          error: `${mapped.message} Tip: clear the parental consent field and save your details first.`,
        };
      }
      return { error: mapped.message };
    }
  }

  let slug = existing.slug ?? "";
  try {
    const profile = await updateFighterProfile(actor, {
      ...toProfileFields(parsed.data),
      photoKey,
      aadhaarImageKey,
      parentalConsentImageKey,
    });
    slug = profile.slug ?? slug;
  } catch (err) {
    return { error: toAppError(err).message };
  }

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
