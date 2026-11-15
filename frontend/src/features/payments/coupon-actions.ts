"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/server/auth/session";
import { reserveCoupon, applyCouponToRegistration } from "@/server/services/couponService";
import { toAppError } from "@/server/http/errors";

export type PaymentCouponActionState = {
  error?: string;
  applied?: {
    code: string;
    amountMinorUnits: number;
    currency: string;
    paymentOptionLabel: string;
  };
};

export async function applyPaymentCouponAction(
  _prev: PaymentCouponActionState,
  formData: FormData
): Promise<PaymentCouponActionState> {
  const actor = await requireActor("GRAPPLER");
  const eventId = String(formData.get("eventId") ?? "");
  const registrationId = String(formData.get("registrationId") ?? "");
  const code = String(formData.get("code") ?? "");
  const reservationIntentId = String(formData.get("reservationIntentId") ?? "");

  try {
    const reserved = await reserveCoupon(actor, { eventId, code, reservationIntentId });
    const { feeView } = await applyCouponToRegistration(actor, registrationId, {
      couponId: reserved.couponId,
      reservationIntentId,
    });
    revalidatePath(`/grappler/registrations/${registrationId}/payment`);
    return {
      applied: {
        code: feeView.couponCode,
        amountMinorUnits: feeView.amountMinorUnits,
        currency: feeView.currency,
        paymentOptionLabel: feeView.paymentOptionLabel,
      },
    };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}
