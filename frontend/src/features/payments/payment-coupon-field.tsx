"use client";

import { useActionState, useMemo, useState } from "react";
import { applyPaymentCouponAction, type PaymentCouponActionState } from "./coupon-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PaymentCouponActionState = {};

export function PaymentCouponField({
  eventId,
  registrationId,
  appliedCouponCode,
}: {
  eventId: string;
  registrationId: string;
  appliedCouponCode: string;
}) {
  const intentId = useMemo(() => crypto.randomUUID(), []);
  const [state, formAction, pending] = useActionState(applyPaymentCouponAction, initialState);
  const [hasCoupon, setHasCoupon] = useState<"yes" | "no">("no");

  const applied = appliedCouponCode || state.applied?.code || "";
  if (applied) {
    return (
      <p className="mb-4 border-2 border-black bg-white px-3 py-2 text-sm shadow-[3px_3px_0_0_#000]">
        Coupon <span className="font-mono font-semibold">{applied}</span> applied
        {state.applied
          ? ` — new price ${(state.applied.amountMinorUnits / 100).toLocaleString("en-IN", {
              style: "currency",
              currency: state.applied.currency,
            })}.`
          : "."}
      </p>
    );
  }

  const open = hasCoupon === "yes";

  return (
    <div className="mb-4 border-2 border-dashed border-black/50 bg-white/50 p-4">
      <fieldset disabled={pending}>
        <legend className="text-sm font-semibold uppercase tracking-wider">Do you have a coupon code?</legend>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={hasCoupon === "yes"} onChange={() => setHasCoupon("yes")} />
            Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={hasCoupon === "no"} onChange={() => setHasCoupon("no")} />
            No
          </label>
        </div>
      </fieldset>

      {open && (
        <form action={formAction} className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="registrationId" value={registrationId} />
          <input type="hidden" name="reservationIntentId" value={intentId} />
          <div className="min-w-[12rem] flex-1">
            <Label htmlFor="paymentCouponCode">Code</Label>
            <Input
              id="paymentCouponCode"
              name="code"
              autoComplete="off"
              disabled={pending}
              className="mt-1 border-2 border-black font-mono uppercase"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
              }}
            />
          </div>
          <Button type="submit" disabled={pending} className="border-2 border-black">
            {pending ? "Applying…" : "Apply"}
          </Button>
          {state.error && (
            <p className="w-full text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
