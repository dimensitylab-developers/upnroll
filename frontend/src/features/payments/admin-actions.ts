"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/server/auth/session";
import {
  createCoupon,
  disableCoupon,
  releaseRedeemedCoupon,
} from "@/server/services/couponService";
import {
  createPaymentOption,
  setPaymentOptionQr,
  updatePaymentOption,
} from "@/server/services/paymentOptionService";
import { toAppError } from "@/server/http/errors";
import { detectImageType } from "@/features/payments/file-validation";
import { invalidatePublicTags } from "@/lib/public-tags";

export type PaymentAdminActionState = { error?: string; ok?: boolean; oneTime?: Record<string, unknown> };

export async function createPaymentOptionAction(
  _prev: PaymentAdminActionState,
  formData: FormData
): Promise<PaymentAdminActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const label = String(formData.get("label") ?? "");
  const amountRaw = String(formData.get("amount") ?? "");
  const isDefault = formData.get("isDefault") === "yes";
  const amount = Math.round(parseFloat(amountRaw) * 100);
  if (!label.trim()) return { error: "Label is required." };
  if (!Number.isFinite(amount) || amount < 0) return { error: "Enter a valid amount." };

  try {
    await createPaymentOption(actor, eventId, { label, amountMinorUnits: amount, isDefault });
    invalidatePublicTags(["events", `event:${eventId}`]);
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/admin/events/${eventId}/payments`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return { ok: true };
}

export async function updatePaymentOptionAction(
  _prev: PaymentAdminActionState,
  formData: FormData
): Promise<PaymentAdminActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const paymentOptionId = String(formData.get("paymentOptionId") ?? "");
  const label = formData.has("label") ? String(formData.get("label") ?? "") : undefined;
  const amountRaw = formData.get("amount");
  const active = formData.has("active") ? formData.get("active") === "yes" : undefined;
  const isDefault = formData.has("isDefault") ? formData.get("isDefault") === "yes" : undefined;

  const patch: {
    label?: string;
    amountMinorUnits?: number;
    active?: boolean;
    isDefault?: boolean;
  } = {};
  if (label !== undefined) patch.label = label;
  if (amountRaw != null && String(amountRaw) !== "") {
    const amount = Math.round(parseFloat(String(amountRaw)) * 100);
    if (!Number.isFinite(amount) || amount < 0) return { error: "Enter a valid amount." };
    patch.amountMinorUnits = amount;
  }
  if (active !== undefined) patch.active = active;
  if (isDefault !== undefined) patch.isDefault = isDefault;

  try {
    await updatePaymentOption(actor, eventId, paymentOptionId, patch);
    invalidatePublicTags(["events", `event:${eventId}`]);
    revalidatePath(`/admin/events/${eventId}/payments`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return { ok: true };
}

export async function uploadPaymentOptionQrAction(
  _prev: PaymentAdminActionState,
  formData: FormData
): Promise<PaymentAdminActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const paymentOptionId = String(formData.get("paymentOptionId") ?? "");
  const file = formData.get("qr");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a QR image." };
  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected) return { error: "Use a JPG, PNG, or WebP image." };
  const ext = detected === "image/png" ? ".png" : detected === "image/webp" ? ".webp" : ".jpg";

  try {
    await setPaymentOptionQr(actor, eventId, paymentOptionId, bytes, ext, detected);
    invalidatePublicTags(["events", `event:${eventId}`]);
    revalidatePath(`/admin/events/${eventId}/payments`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return { ok: true };
}

export async function createCouponAction(
  _prev: PaymentAdminActionState,
  formData: FormData
): Promise<PaymentAdminActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const paymentOptionId = String(formData.get("paymentOptionId") ?? "");
  const code = String(formData.get("code") ?? "").trim() || undefined;
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  try {
    const coupon = await createCoupon(actor, { eventId, paymentOptionId, code, expiresAt });
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/admin/events/${eventId}/payments`);
    return { ok: true, oneTime: { code: coupon.code, id: String(coupon._id) } };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function disableCouponAction(
  _prev: PaymentAdminActionState,
  formData: FormData
): Promise<PaymentAdminActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const couponId = String(formData.get("couponId") ?? "");
  try {
    await disableCoupon(actor, couponId);
    revalidatePath(`/admin/events/${eventId}/payments`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return { ok: true };
}

export async function releaseRedeemedCouponAction(
  _prev: PaymentAdminActionState,
  formData: FormData
): Promise<PaymentAdminActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const couponId = String(formData.get("couponId") ?? "");
  const reason = String(formData.get("reason") ?? "");
  try {
    await releaseRedeemedCoupon(actor, couponId, reason);
    revalidatePath(`/admin/events/${eventId}/payments`);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return { ok: true };
}
