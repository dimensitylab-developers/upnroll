"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/server/auth/session";
import { approvePayment, rejectPayment } from "@/server/services/paymentService";
import { toAppError } from "@/server/http/errors";

export type AdminPaymentActionState = { error?: string; success?: boolean };

export async function approvePaymentAction(
  _prevState: AdminPaymentActionState,
  formData: FormData
): Promise<AdminPaymentActionState> {
  const actor = await requireActor("ADMIN");
  const paymentId = String(formData.get("paymentId") ?? "");
  const note = String(formData.get("note") ?? "");

  try {
    await approvePayment(actor, paymentId, note);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/payments");
  return { success: true };
}

export async function rejectPaymentAction(
  _prevState: AdminPaymentActionState,
  formData: FormData
): Promise<AdminPaymentActionState> {
  const actor = await requireActor("ADMIN");
  const paymentId = String(formData.get("paymentId") ?? "");
  const note = String(formData.get("note") ?? "");

  try {
    await rejectPayment(actor, paymentId, note);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/payments");
  return { success: true };
}
