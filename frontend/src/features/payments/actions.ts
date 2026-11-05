"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/auth/session";
import { submitPayment } from "@/server/services/paymentService";
import { toAppError } from "@/server/http/errors";
import { submitPaymentSchema } from "./schemas";

export type SubmitPaymentActionState = { error?: string; success?: boolean };

export async function submitPaymentAction(
  _prevState: SubmitPaymentActionState,
  formData: FormData
): Promise<SubmitPaymentActionState> {
  const { user } = await requireSession();

  const parsed = submitPaymentSchema.safeParse({
    registrationId: formData.get("registrationId"),
    utr: formData.get("utr"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your submission and try again." };
  }

  const file = formData.get("screenshot");
  if (!(file instanceof File)) {
    return { error: "Upload a payment screenshot." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await submitPayment(String(user._id), parsed.data.registrationId, parsed.data.utr, {
      buffer,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    const appError = toAppError(err);
    return { error: appError.message };
  }

  revalidatePath(`/fighter/registrations/${parsed.data.registrationId}/payment`);
  return { success: true };
}
