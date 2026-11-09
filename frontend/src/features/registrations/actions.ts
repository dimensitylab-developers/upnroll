"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { actorFromSession, requireActor, requireSession } from "@/server/auth/session";
import { createRegistration, withdrawRegistration } from "@/server/services/registrationService";
import { updateFighterProfile } from "@/server/services/fighterService";
import { FighterProfile } from "@/server/models/FighterProfile";
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
  const actor = actorFromSession(await requireSession());

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
    const existing = await FighterProfile.findOne({ userId: actor.userId }).select("photoKey").lean();
    if ("empty" in photo && !existing?.photoKey) {
      return { error: "Add a passport size photograph." };
    }
    const photoKey = "bytes" in photo
      ? await saveProfilePhoto(actor, photo.bytes, photo.ext, existing?.photoKey ?? "")
      : undefined;

    await updateFighterProfile(actor, {
      ...toProfileFields(grapplerParsed.data),
      photoKey,
      waiverAcceptedAt: new Date(),
    });

    const { registration } = await createRegistration(actor, registrationParsed.data.divisionId, {
      consent: true,
      agreement: true,
    });
    registrationId = String(registration._id);
    invalidatePublicTags(["schedule", "rankings", "fighters"]);
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
  const actor = await requireActor("ADMIN");
  const registrationId = String(formData.get("registrationId") ?? "");
  if (!registrationId) return { error: "Missing registration." };
  try {
    const registration = await withdrawRegistration(actor, registrationId);
    invalidatePublicTags(["schedule", "rankings", "fighters"]);
    revalidatePath(`/admin/events/${String(registration.eventId)}`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return {};
}
