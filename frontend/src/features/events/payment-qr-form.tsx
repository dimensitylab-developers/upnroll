"use client";

import { useActionState } from "react";
import { uploadEventPaymentQrAction, type EventActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentQrForm({ eventId, hasQr }: { eventId: string; hasQr: boolean }) {
  const [state, action, pending] = useActionState(uploadEventPaymentQrAction, {} as EventActionState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      {hasQr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/v1/admin/events/${eventId}/payment-qr`}
          alt="Payment QR"
          className="h-48 w-48 border-2 border-black bg-white object-contain p-2 shadow-[4px_4px_0_0_#000]"
        />
      )}
      <div className="space-y-1.5">
        <Label htmlFor="qr">{hasQr ? "Replace QR image" : "Upload QR image"}</Label>
        <Input id="qr" name="qr" type="file" accept="image/jpeg,image/png,image/webp" required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : hasQr ? "Replace QR" : "Upload QR"}
      </Button>
    </form>
  );
}
