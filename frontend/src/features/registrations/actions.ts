"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/server/auth/session";
import { createRegistration } from "@/server/services/registrationService";
import { toAppError } from "@/server/http/errors";
import { createRegistrationSchema } from "./schemas";

export type RegistrationActionState = { error?: string };

export async function createRegistrationAction(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  const { user } = await requireSession();

  const parsed = createRegistrationSchema.safeParse({ divisionId: formData.get("divisionId") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Select a division." };
  }

  let registrationId: string;
  try {
    const { registration } = await createRegistration(String(user._id), parsed.data.divisionId);
    registrationId = String(registration._id);
  } catch (err) {
    const appError = toAppError(err);
    return { error: appError.message };
  }

  // redirect() throws internally and must not be caught by the try/catch above.
  redirect(`/fighter/registrations/${registrationId}/payment`);
}
