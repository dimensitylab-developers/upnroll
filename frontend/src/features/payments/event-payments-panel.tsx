"use client";

import { useActionState } from "react";
import {
  createCouponAction,
  createPaymentOptionAction,
  disableCouponAction,
  releaseRedeemedCouponAction,
  updatePaymentOptionAction,
  uploadPaymentOptionQrAction,
  type PaymentAdminActionState,
} from "./admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentOptionView } from "@/server/services/paymentOptionService";

type CouponRow = {
  _id: string;
  code: string;
  status: string;
  paymentOptionId: string;
  effectivelyExpired?: boolean;
};

export function EventPaymentsPanel({
  eventId,
  options,
  coupons,
}: {
  eventId: string;
  options: PaymentOptionView[];
  coupons: CouponRow[];
}) {
  const [optState, createOpt, creatingOpt] = useActionState(createPaymentOptionAction, {} as PaymentAdminActionState);
  const [couponState, createCoupon, creatingCoupon] = useActionState(createCouponAction, {} as PaymentAdminActionState);
  const revealedCode = couponState.oneTime?.code ? String(couponState.oneTime.code) : null;

  return (
    <div className="space-y-10">
      <section className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] sm:p-6">
        <h2 className="text-display text-lg font-semibold">Payment options</h2>
        <p className="mt-1 text-sm text-muted-foreground">Fighters see the default option unless a coupon selects another tier.</p>

        <ul className="mt-4 space-y-4">
          {options.map((opt) => (
            <PaymentOptionCard key={opt.id} eventId={eventId} option={opt} />
          ))}
        </ul>

        <form action={createOpt} className="mt-6 space-y-3 border-t-2 border-black pt-6">
          <input type="hidden" name="eventId" value={eventId} />
          <p className="text-sm font-semibold uppercase tracking-wider">Add option</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <MotionField label="Label" name="label" />
            <MotionField label="Amount (major)" name="amount" type="number" step="0.01" />
            <label className="flex items-center gap-2 text-sm pt-6">
              <input type="checkbox" name="isDefault" value="yes" />
              Set as default
            </label>
          </div>
          {optState.error && <p className="text-sm text-destructive">{optState.error}</p>}
          <Button type="submit" disabled={creatingOpt} className="border-2 border-black shadow-[3px_3px_0_0_#c8102e]">
            {creatingOpt ? "Saving…" : "Add payment option"}
          </Button>
        </form>
      </section>

      <section id="coupons" className="scroll-mt-24 border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#c8102e] sm:p-6">
        <h2 className="text-display text-lg font-semibold">Generate coupon codes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each code is single-use. Leave the code blank to auto-generate one. Copy the revealed code immediately after create.
        </p>
        <form action={createCoupon} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="eventId" value={eventId} />
          <div>
            <Label htmlFor="paymentOptionId">Link to payment option</Label>
            <select
              id="paymentOptionId"
              name="paymentOptionId"
              required
              disabled={options.length === 0}
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-sm"
            >
              {options.length === 0 ? (
                <option value="">Add a payment option first</option>
              ) : (
                options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} ({(o.amountMinorUnits / 100).toFixed(2)} {o.currency})
                  </option>
                ))
              )}
            </select>
          </div>
          <MotionField label="Custom code (optional)" name="code" />
          <MotionField label="Expires (optional)" name="expiresAt" type="datetime-local" />
          {couponState.error && (
            <p className="text-sm text-destructive sm:col-span-2" role="alert">
              {couponState.error}
            </p>
          )}
          {revealedCode && (
            <p className="border-2 border-black bg-black px-3 py-2 text-sm text-white sm:col-span-2" role="status">
              New coupon code (copy now): <strong className="font-mono tracking-wider">{revealedCode}</strong>
            </p>
          )}
          <Button
            type="submit"
            disabled={creatingCoupon || options.length === 0}
            className="border-2 border-black bg-brand-red text-white shadow-[3px_3px_0_0_#000] sm:col-span-2"
          >
            {creatingCoupon ? "Generating…" : "Generate coupon code"}
          </Button>
        </form>

        <ul className="mt-6 space-y-2">
          {coupons.map((c) => (
            <li key={c._id} className="flex flex-wrap items-center justify-between gap-2 border-2 border-black px-3 py-2 text-sm shadow-[2px_2px_0_0_#000]">
              <span className="font-mono font-semibold">{c.code}</span>
              <span>
                {c.status}
                {c.effectivelyExpired ? " (expired)" : ""}
              </span>
              <CouponActions eventId={eventId} couponId={c._id} status={c.status} />
            </li>
          ))}
          {coupons.length === 0 && <p className="text-sm text-muted-foreground">No coupons yet.</p>}
        </ul>
      </section>
    </div>
  );
}

function MotionField(props: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input
        id={props.name}
        name={props.name}
        type={props.type ?? "text"}
        step={props.step}
        defaultValue={props.defaultValue}
        className="mt-1 border-2 border-black"
      />
    </div>
  );
}

function PaymentOptionCard({ eventId, option }: { eventId: string; option: PaymentOptionView }) {
  const [state, updateAction, pending] = useActionState(updatePaymentOptionAction, {} as PaymentAdminActionState);
  const [qrState, qrAction, qrPending] = useActionState(uploadPaymentOptionQrAction, {} as PaymentAdminActionState);

  return (
    <li className="border-2 border-black p-4 shadow-[4px_4px_0_0_#000]">
      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="paymentOptionId" value={option.id} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-display font-semibold">{option.label}</span>
          {option.isDefault && (
            <span className="border border-black bg-brand-red px-2 py-0.5 text-[10px] font-semibold uppercase text-white">Default</span>
          )}
          {!option.active && (
            <span className="text-xs uppercase text-muted-foreground">Inactive</span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <MotionField label="Label" name="label" defaultValue={option.label} />
          <MotionField
            label="Amount (major)"
            name="amount"
            type="number"
            step="0.01"
            defaultValue={String(option.amountMinorUnits / 100)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" value="yes" defaultChecked={option.active} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" value="yes" defaultChecked={option.isDefault} />
          Default for new registrations
        </label>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save option"}
        </Button>
      </form>

      <form action={qrAction} className="mt-4 border-t border-black/20 pt-4 space-y-2">
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="paymentOptionId" value={option.id} />
        {option.qrImageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/v1/admin/events/${eventId}/payment-options/${option.id}/qr`}
            alt={`QR for ${option.label}`}
            className="h-32 w-32 border-2 border-black object-contain p-1 shadow-[3px_3px_0_0_#000]"
          />
        )}
        <Label htmlFor={`qr-${option.id}`}>QR image</Label>
        <Input id={`qr-${option.id}`} name="qr" type="file" accept="image/jpeg,image/png,image/webp" className="border-2 border-black" />
        {qrState.error && <p className="text-sm text-destructive">{qrState.error}</p>}
        <Button type="submit" size="sm" variant="outline" disabled={qrPending} className="border-2 border-black">
          {qrPending ? "Uploading…" : option.qrImageKey ? "Replace QR" : "Upload QR"}
        </Button>
      </form>
    </li>
  );
}

function CouponActions({ eventId, couponId, status }: { eventId: string; couponId: string; status: string }) {
  const [disableState, disable, disabling] = useActionState(disableCouponAction, {} as PaymentAdminActionState);
  const [releaseState, release, releasing] = useActionState(releaseRedeemedCouponAction, {} as PaymentAdminActionState);

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "REDEEMED" && status !== "DISABLED" && (
        <form action={disable}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="couponId" value={couponId} />
          <Button type="submit" size="sm" variant="outline" disabled={disabling} className="border-2 border-black">
            Disable
          </Button>
        </form>
      )}
      {status === "REDEEMED" && (
        <form action={release} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="couponId" value={couponId} />
          <Input name="reason" placeholder="Release reason" required className="h-8 border-2 border-black text-xs" />
          <Button type="submit" size="sm" disabled={releasing}>
            Release
          </Button>
        </form>
      )}
      {(disableState.error || releaseState.error) && (
        <span className="text-xs text-destructive">{disableState.error || releaseState.error}</span>
      )}
    </div>
  );
}
