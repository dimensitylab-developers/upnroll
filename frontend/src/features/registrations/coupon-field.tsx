"use client";

import { useMemo, useState, useTransition } from "react";
import { applyCouponAction, releaseCouponAction, type CouponActionState } from "./coupon-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Must not render nested <form> elements — this component sits inside GrapplerForm.
 * Coupon apply/release run via explicit button handlers + server actions.
 */
export function CouponField({ eventId, disabled }: { eventId: string | null; disabled?: boolean }) {
  const intentId = useMemo(() => crypto.randomUUID(), []);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<NonNullable<CouponActionState["applied"]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!eventId) return null;

  const applyCoupon = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a coupon code.");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("eventId", eventId);
    fd.set("code", trimmed);
    fd.set("reservationIntentId", intentId);
    startTransition(async () => {
      const result = await applyCouponAction({}, fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.applied) {
        setApplied(result.applied);
        setCode("");
      }
    });
  };

  const removeCoupon = () => {
    if (!applied) return;
    setError(null);
    const fd = new FormData();
    fd.set("eventId", eventId);
    fd.set("code", applied.code);
    fd.set("reservationIntentId", applied.reservationIntentId);
    startTransition(async () => {
      const result = await releaseCouponAction({}, fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setApplied(null);
    });
  };

  return (
    <div className="border-2 border-dashed border-black/50 bg-white/50 p-4">
      <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
        <input
          type="checkbox"
          checked={open || Boolean(applied)}
          onChange={(e) => setOpen(e.target.checked)}
          disabled={disabled || Boolean(applied) || pending}
        />
        Do you have a coupon code?
      </label>

      {(open || applied) && !applied && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[12rem] flex-1">
            <Label htmlFor="couponCode">Code</Label>
            <Input
              id="couponCode"
              name="couponCodePreview"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoComplete="off"
              aria-busy={pending}
              disabled={disabled || pending}
              className="mt-1 border-2 border-black font-mono uppercase"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCoupon();
                }
              }}
            />
          </div>
          <Button
            type="button"
            disabled={disabled || pending}
            className="border-2 border-black"
            onClick={applyCoupon}
          >
            {pending ? "Applying…" : "Apply"}
          </Button>
          {error && (
            <p className="w-full text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {applied && (
        <div className="mt-3 space-y-2 text-sm">
          <input type="hidden" name="couponId" value={applied.couponId} />
          <input type="hidden" name="reservationIntentId" value={applied.reservationIntentId} />
          <p>
            <span className="font-mono font-semibold">{applied.code}</span> → {applied.paymentOptionLabel} (
            {(applied.amountMinorUnits / 100).toLocaleString("en-IN", {
              style: "currency",
              currency: applied.currency,
            })}
            )
          </p>
          <p className="text-xs text-muted-foreground">
            Held until {new Date(applied.reservedUntil).toLocaleTimeString()}.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled || pending}
            className="border-2 border-black"
            onClick={removeCoupon}
          >
            {pending ? "Releasing…" : "Remove coupon"}
          </Button>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
