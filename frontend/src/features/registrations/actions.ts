"use server";

import { redirect } from "next/navigation";
import { requireRole, requireSession } from "@/server/auth/session";
import { createRegistration, withdrawRegistration } from "@/server/services/registrationService";
import { updateFighterProfile } from "@/server/services/fighterService";
import { FighterProfile } from "@/server/models/FighterProfile";
import { revalidatePath } from "next/cache";
import { toAppError } from "@/server/http/errors";
import { createRegistrationSchema } from "./schemas";
import { grapplerDetailsSchema, grapplerFieldIssues, grapplerFromForm, toProfileFields } from "@/features/fighters/grappler-schema";
import { readProfilePhoto, saveProfilePhoto } from "@/server/services/profilePhoto";

export type RegistrationActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const { user } = await requireSession();

  const registrationParsed = createRegistrationSchema.safeParse({
    divisionId: formData.get("divisionId"),
    consent: formData.get("consent"),
    agreement: formData.get("agreement"),
  });
  if (!registrationParsed.success) {
    return { error: registrationParsed.error.issues[0]?.message ?? "Select a division." };
  }

  const grapplerParsed = grapplerDetailsSchema.safeParse(grapplerFromForm(formData));
  if (!grapplerParsed.success) {
    return { fieldErrors: grapplerParsed.error.flatten().fieldErrors };
  }
  const issues = grapplerFieldIssues(grapplerParsed.data);
  if (Object.keys(issues).length > 0) return { fieldErrors: issues };

  const photo = await readProfilePhoto(formData.get("photo"));
  if ("error" in photo) return { error: photo.error };

  let registrationId: string;
  try {
    const existing = await FighterProfile.findOne({ userId: user._id }).select("photoKey").lean();
    if ("empty" in photo && !existing?.photoKey) {
      return { error: "Add a passport size photograph." };
    }
    const photoKey = "bytes" in photo
      ? await saveProfilePhoto(String(user._id), photo.bytes, photo.ext, existing?.photoKey ?? "")
      : undefined;

    await updateFighterProfile(String(user._id), {
      ...toProfileFields(grapplerParsed.data),
      photoKey,
      waiverAcceptedAt: new Date(),
    });

    const { registration } = await createRegistration(String(user._id), registrationParsed.data.divisionId, {
      consent: true,
      agreement: true,
    });
    registrationId = String(registration._id);
  } catch (err) {
    const appError = toAppError(err);
    return { error: appError.message };
  }

  redirect(`/fighter/registrations/${registrationId}/payment`);
}

export async function withdrawRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const { user } = await requireRole("ADMIN");
  const registrationId = String(formData.get("registrationId") ?? "");
  if (!registrationId) return { error: "Missing registration." };
  try {
    const registration = await withdrawRegistration(String(user._id), registrationId);
    revalidatePath(`/admin/events/${String(registration.eventId)}`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return {};
}
