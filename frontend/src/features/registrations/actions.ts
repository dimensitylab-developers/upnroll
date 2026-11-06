"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { actorFromSession, requireActor, requireSession } from "@/server/auth/session";
import { createRegistration, withdrawRegistration } from "@/server/services/registrationService";
import { toAppError } from "@/server/http/errors";
import { createRegistrationSchema } from "./schemas";

export type RegistrationActionState = { error?: string };

export async function createRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const actor = actorFromSession(await requireSession());

  const parsed = createRegistrationSchema.safeParse({
    divisionId: formData.get("divisionId"),
    consent: formData.get("consent"),
    agreement: formData.get("agreement"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Select a division." };
  }

  let registrationId: string;
  try {
    const { registration } = await createRegistration(actor, parsed.data.divisionId, {
      consent: parsed.data.consent === "yes",
      agreement: parsed.data.agreement === "yes",
    });
    registrationId = String(registration._id);
  } catch (err) {
    const appError = toAppError(err);
    return { error: appError.message };
  }

  // redirect() throws internally and must not be caught by the try/catch above.
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
