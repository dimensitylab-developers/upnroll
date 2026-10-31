"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { approvePayment, rejectPayment } from "@/server/services/paymentService";
import { toAppError } from "@/server/http/errors";

export type AdminPaymentActionState = { error?: string; success?: boolean };

export async function approvePaymentAction(
  _prevState: AdminPaymentActionState,
  formData: FormData
): Promise<AdminPaymentActionState> {
  const { user } = await requireRole("ADMIN");
  const paymentId = String(formData.get("paymentId") ?? "");
  const note = String(formData.get("note") ?? "");

  try {
    await approvePayment(String(user._id), paymentId, note);
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
  const { user } = await requireRole("ADMIN");
  const paymentId = String(formData.get("paymentId") ?? "");
  const note = String(formData.get("note") ?? "");

  try {
    await rejectPayment(String(user._id), paymentId, note);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/payments");
  return { success: true };
}
