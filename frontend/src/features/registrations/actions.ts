"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { createRegistration, withdrawRegistration } from "@/server/services/registrationService";
import { updateFighterProfile } from "@/server/services/fighterService";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Registration } from "@/server/models/Registration";
import { ACTIVE_REGISTRATION_STATUSES } from "@/server/services/registrationStateMachine";
import { ConflictError, toAppError } from "@/server/http/errors";
import { createRegistrationSchema } from "./schemas";
import { grapplerDetailsSchema, grapplerFieldIssues, grapplerFromForm, toProfileFields } from "@/features/fighters/grappler-schema";
import { readProfilePhoto, saveProfilePhoto } from "@/server/services/profilePhoto";
import { readAadhaarImage, saveAadhaarImage } from "@/server/services/aadhaarUpload";

export type RegistrationActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Client navigates here — avoid redirect() after updateTag with useActionState. */
  redirectTo?: string;
};

function paymentPath(registrationId: string) {
  return `/fighter/registrations/${registrationId}/payment`;
}

async function existingActiveRegistrationId(userId: string, divisionId: string): Promise<string | null> {
  await connectDB();
  const existing = await Registration.findOne({
    userId,
    divisionId,
    status: { $in: ACTIVE_REGISTRATION_STATUSES },
  })
    .select("_id")
    .lean();
  return existing ? String(existing._id) : null;
}

export async function createRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const actor = await requireActor("FIGHTER");

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
  const aadhaarImage = await readAadhaarImage(formData.get("aadhaarImage"));
  if ("error" in aadhaarImage) return { error: aadhaarImage.error };

  const divisionId = registrationParsed.data.divisionId;

  try {
    const existing = await FighterProfile.findOne({ userId: actor.userId }).select("photoKey aadhaarKey").lean();
    if ("empty" in photo && !existing?.photoKey) {
      return { error: "Add a photograph." };
    }
    if ("empty" in aadhaarImage && !existing?.aadhaarKey) {
      return { error: "Upload a copy of your Aadhaar card." };
    }
    const photoKey = "bytes" in photo
      ? await saveProfilePhoto(actor, photo.bytes, photo.ext, existing?.photoKey ?? "")
      : undefined;
    const aadhaarKey = "bytes" in aadhaarImage
      ? await saveAadhaarImage(actor, aadhaarImage.bytes, aadhaarImage.ext, existing?.aadhaarKey ?? "")
      : undefined;

    await updateFighterProfile(actor, {
      ...toProfileFields(grapplerParsed.data),
      photoKey,
      aadhaarKey,
      waiverAcceptedAt: new Date(),
    });

    const couponId = String(formData.get("couponId") ?? "").trim() || null;
    const reservationIntentId = String(formData.get("reservationIntentId") ?? "").trim() || null;

    const { registration } = await createRegistration(actor, divisionId, {
      consent: true,
      agreement: true,
    }, {
      couponId,
      reservationIntentId,
    });
    invalidatePublicTags(["schedule", "rankings", "fighters"]);
    return { redirectTo: paymentPath(String(registration._id)) };
  } catch (err) {
    const conflict =
      err instanceof ConflictError ||
      (err instanceof Error && /already have an active registration/i.test(err.message));
    if (conflict) {
      const existingId = await existingActiveRegistrationId(actor.userId, divisionId);
      if (existingId) return { redirectTo: paymentPath(existingId) };
    }
    return { error: toAppError(err).message };
  }
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
