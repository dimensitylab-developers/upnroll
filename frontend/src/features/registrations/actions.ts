"use server";

import { redirect } from "next/navigation";
import { requireRole, requireSession } from "@/server/auth/session";
import { createRegistration, withdrawRegistration } from "@/server/services/registrationService";
import { revalidatePath } from "next/cache";
import { toAppError } from "@/server/http/errors";
import { createRegistrationSchema } from "./schemas";

export type RegistrationActionState = { error?: string };

export async function createRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const { user } = await requireSession();

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
    const { registration } = await createRegistration(String(user._id), parsed.data.divisionId, {
      consent: true,
      agreement: true,
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
