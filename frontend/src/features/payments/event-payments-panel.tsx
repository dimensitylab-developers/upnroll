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
    <div className="space-y-8 sm:space-y-10">
      <section className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-6">
        <h2 className="text-display text-base font-semibold sm:text-lg">Payment options</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fighters see the default option unless a coupon selects another tier.
        </p>

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
            <label className="flex min-h-10 items-center gap-2 text-sm sm:pt-6">
              <input type="checkbox" name="isDefault" value="yes" className="size-4" />
              Set as default
            </label>
          </div>
          {optState.error && <p className="text-sm text-destructive">{optState.error}</p>}
          <Button
            type="submit"
            disabled={creatingOpt}
            className="min-h-11 w-full border-2 border-black shadow-[3px_3px_0_0_#c8102e] sm:w-auto"
          >
            {creatingOpt ? "Saving…" : "Add payment option"}
          </Button>
        </form>
      </section>

      <section id="coupons" className="scroll-mt-24 border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#c8102e] sm:p-6">
        <h2 className="text-display text-base font-semibold sm:text-lg">Generate coupon codes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each code is single-use. Leave the code blank to auto-generate one. Copy the revealed code immediately after create.
        </p>
        <form action={createCoupon} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="eventId" value={eventId} />
          <div className="min-w-0 sm:col-span-2 md:col-span-1">
            <Label htmlFor="paymentOptionId">Link to payment option</Label>
            <select
              id="paymentOptionId"
              name="paymentOptionId"
              required
              disabled={options.length === 0}
              className="mt-1 min-h-11 w-full border-2 border-black bg-white px-3 py-2 text-sm"
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
            <p
              className="break-all border-2 border-black bg-black px-3 py-3 text-sm text-white sm:col-span-2"
              role="status"
            >
              New coupon code (copy now):{" "}
              <strong className="font-mono tracking-wider">{revealedCode}</strong>
            </p>
          )}
          <Button
            type="submit"
            disabled={creatingCoupon || options.length === 0}
            className="min-h-11 w-full border-2 border-black bg-brand-red text-white shadow-[3px_3px_0_0_#000] sm:col-span-2 sm:w-auto"
          >
            {creatingCoupon ? "Generating…" : "Generate coupon code"}
          </Button>
        </form>

        <ul className="mt-6 space-y-3">
          {coupons.map((c) => (
            <li
              key={c._id}
              className="flex flex-col gap-3 border-2 border-black px-3 py-3 text-sm shadow-[2px_2px_0_0_#000] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="break-all font-mono font-semibold">{c.code}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {c.status}
                  {c.effectivelyExpired ? " · expired" : ""}
                </p>
              </div>
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
    <div className="min-w-0">
      <Label htmlFor={props.name}>{props.label}</Label>
      <Input
        id={props.name}
        name={props.name}
        type={props.type ?? "text"}
        step={props.step}
        defaultValue={props.defaultValue}
        className="mt-1 min-h-11 border-2 border-black"
      />
    </div>
  );
}

function PaymentOptionCard({ eventId, option }: { eventId: string; option: PaymentOptionView }) {
  const [state, updateAction, pending] = useActionState(updatePaymentOptionAction, {} as PaymentAdminActionState);
  const [qrState, qrAction, qrPending] = useActionState(uploadPaymentOptionQrAction, {} as PaymentAdminActionState);

  return (
    <li className="border-2 border-black p-3 shadow-[4px_4px_0_0_#000] sm:p-4">
      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="paymentOptionId" value={option.id} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-display break-words font-semibold">{option.label}</span>
          {option.isDefault && (
            <span className="border border-black bg-brand-red px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Default
            </span>
          )}
          {!option.active && <span className="text-xs uppercase text-muted-foreground">Inactive</span>}
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
        <label className="flex min-h-10 items-center gap-2 text-sm">
          <input type="checkbox" name="active" value="yes" defaultChecked={option.active} className="size-4" />
          Active
        </label>
        <label className="flex min-h-10 items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" value="yes" defaultChecked={option.isDefault} className="size-4" />
          Default for new registrations
        </label>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending} className="min-h-10 w-full sm:w-auto">
          {pending ? "Saving…" : "Save option"}
        </Button>
      </form>

      <form action={qrAction} className="mt-4 space-y-2 border-t border-black/20 pt-4">
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="paymentOptionId" value={option.id} />
        {option.qrImageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/v1/admin/events/${eventId}/payment-options/${option.id}/qr`}
            alt={`QR for ${option.label}`}
            className="mx-auto h-36 w-36 border-2 border-black object-contain p-1 shadow-[3px_3px_0_0_#000] sm:mx-0 sm:h-32 sm:w-32"
          />
        )}
        <Label htmlFor={`qr-${option.id}`}>QR image</Label>
        <Input
          id={`qr-${option.id}`}
          name="qr"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="min-h-11 border-2 border-black file:mr-3 file:border-0 file:bg-transparent file:text-sm"
        />
        {qrState.error && <p className="text-sm text-destructive">{qrState.error}</p>}
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={qrPending}
          className="min-h-10 w-full border-2 border-black sm:w-auto"
        >
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
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      {status !== "REDEEMED" && status !== "DISABLED" && (
        <form action={disable} className="w-full sm:w-auto">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="couponId" value={couponId} />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={disabling}
            className="min-h-10 w-full border-2 border-black sm:w-auto"
          >
            Disable
          </Button>
        </form>
      )}
      {status === "REDEEMED" && (
        <form action={release} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="couponId" value={couponId} />
          <Input
            name="reason"
            placeholder="Release reason"
            required
            className="min-h-10 border-2 border-black text-xs sm:max-w-[14rem]"
          />
          <Button type="submit" size="sm" disabled={releasing} className="min-h-10 w-full sm:w-auto">
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
