"use server";

import { requireActor } from "@/server/auth/session";
import { reserveCoupon, releaseMyCouponReservation } from "@/server/services/couponService";
import { toAppError } from "@/server/http/errors";

export type CouponActionState = {
  error?: string;
  applied?: {
    couponId: string;
    code: string;
    paymentOptionLabel: string;
    amountMinorUnits: number;
    currency: string;
    reservedUntil: string;
    reservationIntentId: string;
  };
  appliedAt?: number;
  released?: boolean;
  releasedAt?: number;
};

export async function applyCouponAction(_prev: CouponActionState, formData: FormData): Promise<CouponActionState> {
  const actor = await requireActor("FIGHTER");
  const eventId = String(formData.get("eventId") ?? "");
  const code = String(formData.get("code") ?? "");
  const reservationIntentId = String(formData.get("reservationIntentId") ?? "");

  try {
    const preview = await reserveCoupon(actor, { eventId, code, reservationIntentId });
    return {
      appliedAt: Date.now(),
      applied: {
        couponId: preview.couponId,
        code: preview.code,
        paymentOptionLabel: preview.paymentOption.label,
        amountMinorUnits: preview.paymentOption.amountMinorUnits,
        currency: preview.paymentOption.currency,
        reservedUntil: preview.reservedUntil,
        reservationIntentId: preview.reservationIntentId,
      },
    };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function releaseCouponAction(_prev: CouponActionState, formData: FormData): Promise<CouponActionState> {
  const actor = await requireActor("FIGHTER");
  const eventId = String(formData.get("eventId") ?? "");
  const code = String(formData.get("code") ?? "");
  const reservationIntentId = String(formData.get("reservationIntentId") ?? "");

  try {
    await releaseMyCouponReservation(actor, { eventId, code, reservationIntentId });
    return { released: true, releasedAt: Date.now() };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}
