import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { Event } from "@/server/models/Event";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError, ValidationError, ConflictError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";
import { getStorageAdapter } from "@/server/storage/factory";

export type PaymentOptionView = {
  id: string;
  label: string;
  amountMinorUnits: number;
  currency: string;
  qrImageKey: string;
  active: boolean;
  isDefault: boolean;
};

function toView(opt: {
  _id?: unknown;
  label: string;
  amountMinorUnits: number;
  currency: string;
  qrImageKey?: string | null;
  active: boolean;
  isDefault: boolean;
}): PaymentOptionView {
  return {
    id: String(opt._id),
    label: opt.label,
    amountMinorUnits: opt.amountMinorUnits,
    currency: opt.currency,
    qrImageKey: opt.qrImageKey ?? "",
    active: opt.active,
    isDefault: opt.isDefault,
  };
}

/** Ensure legacy events have at least one default option mirrored from paymentInstructions. */
export async function ensureDefaultPaymentOption(eventId: string) {
  await connectDB();
  const event = await Event.findById(eventId);
  if (!event) throw new NotFoundError("Event not found.");
  if (event.paymentOptions && event.paymentOptions.length > 0) return event;

  const fee = event.paymentInstructions?.feeMinorUnits ?? 0;
  const currency = event.paymentInstructions?.currency ?? "INR";
  const qr = event.paymentInstructions?.qrImageKey ?? "";
  event.paymentOptions = [
    {
      label: "Default",
      amountMinorUnits: fee,
      currency,
      qrImageKey: qr,
      active: true,
      isDefault: true,
    },
  ] as typeof event.paymentOptions;
  await event.save();
  return event;
}

function syncLegacyInstructions(event: InstanceType<typeof Event>) {
  const options = event.paymentOptions ?? [];
  const def = options.find((o) => o.isDefault && o.active) ?? options.find((o) => o.isDefault) ?? options[0];
  if (!event.paymentInstructions) {
    event.paymentInstructions = { feeMinorUnits: 0, currency: "INR", qrImageKey: "" };
  }
  if (def) {
    event.paymentInstructions.feeMinorUnits = def.amountMinorUnits;
    event.paymentInstructions.currency = def.currency;
    event.paymentInstructions.qrImageKey = def.qrImageKey ?? "";
  }
}

export async function listPaymentOptionsForAdmin(actor: Actor, eventId: string): Promise<PaymentOptionView[]> {
  assertAdmin(actor);
  requireObjectId(eventId, "event");
  const event = await ensureDefaultPaymentOption(eventId);
  return (event.paymentOptions ?? []).map(toView);
}

export async function listActivePaymentOptionsForEvent(eventId: string): Promise<PaymentOptionView[]> {
  requireObjectId(eventId, "event");
  const event = await ensureDefaultPaymentOption(eventId);
  return (event.paymentOptions ?? []).filter((o) => o.active).map(toView);
}

export async function getPaymentOption(eventId: string, paymentOptionId: string): Promise<PaymentOptionView | null> {
  requireObjectId(eventId, "event");
  requireObjectId(paymentOptionId, "payment option");
  const event = await ensureDefaultPaymentOption(eventId);
  const opt = (event.paymentOptions ?? []).find((o) => String(o._id) === paymentOptionId);
  return opt ? toView(opt) : null;
}

export async function getDefaultPaymentOption(eventId: string): Promise<PaymentOptionView> {
  const event = await ensureDefaultPaymentOption(eventId);
  const options = event.paymentOptions ?? [];
  const def = options.find((o) => o.isDefault && o.active) ?? options.find((o) => o.active) ?? options[0];
  if (!def) throw new ConflictError("This event has no payment options configured.");
  return toView(def);
}

export async function createPaymentOption(
  actor: Actor,
  eventId: string,
  input: { label: string; amountMinorUnits: number; currency?: string; isDefault?: boolean }
) {
  assertAdmin(actor);
  requireObjectId(eventId, "event");
  await connectDB();
  if (!input.label.trim()) throw new ValidationError("A payment option label is required.");
  if (!Number.isInteger(input.amountMinorUnits) || input.amountMinorUnits < 0) {
    throw new ValidationError("Amount must be zero or a positive integer in minor units.");
  }

  const event = await ensureDefaultPaymentOption(eventId);
  const makeDefault = Boolean(input.isDefault) || (event.paymentOptions?.length ?? 0) === 0;
  if (makeDefault) {
    for (const opt of event.paymentOptions ?? []) opt.isDefault = false;
  }

  event.paymentOptions = event.paymentOptions ?? [];
  event.paymentOptions.push({
    label: input.label.trim(),
    amountMinorUnits: input.amountMinorUnits,
    currency: input.currency ?? event.paymentInstructions?.currency ?? "INR",
    qrImageKey: "",
    active: true,
    isDefault: makeDefault,
  } as (typeof event.paymentOptions)[number]);

  syncLegacyInstructions(event);
  await event.save();
  const created = event.paymentOptions[event.paymentOptions.length - 1]!;
  await writeAuditLog({
    actorId: actor.userId,
    action: "PAYMENT_OPTION_CREATED",
    targetType: "Event",
    targetId: eventId,
    after: { paymentOptionId: String(created._id), label: created.label, amountMinorUnits: created.amountMinorUnits },
  });
  return toView(created);
}

export async function updatePaymentOption(
  actor: Actor,
  eventId: string,
  paymentOptionId: string,
  input: { label?: string; amountMinorUnits?: number; currency?: string; active?: boolean; isDefault?: boolean }
) {
  assertAdmin(actor);
  requireObjectId(eventId, "event");
  requireObjectId(paymentOptionId, "payment option");
  await connectDB();

  const event = await ensureDefaultPaymentOption(eventId);
  const opt = (event.paymentOptions ?? []).find((o) => String(o._id) === paymentOptionId);
  if (!opt) throw new NotFoundError("Payment option not found.");

  if (input.label !== undefined) {
    if (!input.label.trim()) throw new ValidationError("A payment option label is required.");
    opt.label = input.label.trim();
  }
  if (input.amountMinorUnits !== undefined) {
    if (!Number.isInteger(input.amountMinorUnits) || input.amountMinorUnits < 0) {
      throw new ValidationError("Amount must be zero or a positive integer in minor units.");
    }
    opt.amountMinorUnits = input.amountMinorUnits;
  }
  if (input.currency !== undefined) opt.currency = input.currency;
  if (input.active !== undefined) opt.active = input.active;
  if (input.isDefault === true) {
    for (const other of event.paymentOptions ?? []) other.isDefault = false;
    opt.isDefault = true;
    opt.active = true;
  }

  const activeDefaults = (event.paymentOptions ?? []).filter((o) => o.isDefault && o.active);
  if (activeDefaults.length === 0) {
    const firstActive = (event.paymentOptions ?? []).find((o) => o.active);
    if (firstActive) firstActive.isDefault = true;
  }

  syncLegacyInstructions(event);
  await event.save();
  await writeAuditLog({
    actorId: actor.userId,
    action: "PAYMENT_OPTION_UPDATED",
    targetType: "Event",
    targetId: eventId,
    after: { paymentOptionId, ...input },
  });
  return toView(opt);
}

export async function setPaymentOptionQr(
  actor: Actor,
  eventId: string,
  paymentOptionId: string,
  bytes: Buffer,
  ext: string,
  contentType: string
) {
  assertAdmin(actor);
  requireObjectId(eventId, "event");
  requireObjectId(paymentOptionId, "payment option");
  await connectDB();

  const event = await ensureDefaultPaymentOption(eventId);
  const opt = (event.paymentOptions ?? []).find((o) => String(o._id) === paymentOptionId);
  if (!opt) throw new NotFoundError("Payment option not found.");

  const storage = getStorageAdapter();
  const label = `events/${eventId}/payment-options/${paymentOptionId}/qr${ext}`;
  const previous = opt.qrImageKey || "";
  if (previous && previous !== label) await storage.delete(previous);
  const storedKey = await storage.put(label, bytes, contentType, {
    metadata: { purpose: "payment-option-qr", eventId, paymentOptionId },
  });
  opt.qrImageKey = storedKey;
  syncLegacyInstructions(event);
  await event.save();

  await writeAuditLog({
    actorId: actor.userId,
    action: "PAYMENT_OPTION_QR_UPDATED",
    targetType: "Event",
    targetId: eventId,
    after: { paymentOptionId, qrImageKey: storedKey },
  });
  return toView(opt);
}

export async function openPaymentOptionQr(eventId: string, paymentOptionId: string) {
  requireObjectId(eventId, "event");
  requireObjectId(paymentOptionId, "payment option");
  await connectDB();
  const event = await Event.findById(eventId).lean();
  if (!event) throw new NotFoundError("Event not found.");
  const opt = (event.paymentOptions ?? []).find((o) => String(o._id) === paymentOptionId);
  const key = opt?.qrImageKey || (opt?.isDefault ? event.paymentInstructions?.qrImageKey : "") || "";
  if (!key) throw new NotFoundError("Payment QR not set.");
  return getStorageAdapter().open(key);
}

/** Resolve server-authoritative fee for a registration attempt (never trust client amount). */
export async function resolvePaymentSelection(
  eventId: string,
  paymentOptionId: string | null | undefined
): Promise<PaymentOptionView> {
  if (paymentOptionId) {
    const opt = await getPaymentOption(eventId, paymentOptionId);
    if (!opt || !opt.active) throw new ValidationError("That payment option is not available.");
    return opt;
  }
  return getDefaultPaymentOption(eventId);
}

export function isObjectIdString(value: string): boolean {
  return Types.ObjectId.isValid(value);
}
