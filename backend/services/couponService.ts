import "server-only";
import { randomBytes } from "node:crypto";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, assertFighter, type Actor } from "@/server/auth/actor";
import { Coupon, type CouponDoc } from "@/server/models/Coupon";
import { Event } from "@/server/models/Event";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError, ValidationError, ConflictError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";
import { bindSession, sessionOpts, withTransaction, type DbSession } from "@/server/db/transaction";
import {
  couponReservationMinutes,
  maxOpenCouponReservationsPerUser,
} from "./tournamentRules";
import { getPaymentOption, type PaymentOptionView } from "./paymentOptionService";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function generateCouponCode(): string {
  // Crockford-ish alphabet without ambiguous chars; 10 chars ≈ large space.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += alphabet[bytes[i]! % alphabet.length];
  return out;
}

function isExpired(coupon: Pick<CouponDoc, "expiresAt" | "status">, now: Date): boolean {
  if (coupon.status === "EXPIRED") return true;
  return Boolean(coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime());
}

/** Enforce reservation expiry at read time — not only via cleanup. */
export function reservationStillValid(
  coupon: Pick<CouponDoc, "status" | "reservedUntil" | "reservedByUserId" | "reservationIntentId">,
  userId: string,
  intentId: string,
  now: Date
): boolean {
  if (coupon.status !== "RESERVED") return false;
  if (String(coupon.reservedByUserId ?? "") !== userId) return false;
  if ((coupon.reservationIntentId ?? "") !== intentId) return false;
  if (!coupon.reservedUntil || coupon.reservedUntil.getTime() <= now.getTime()) return false;
  return true;
}

async function releaseExpiredReservation(coupon: InstanceType<typeof Coupon>, now: Date, session?: DbSession) {
  if (coupon.status !== "RESERVED") return;
  if (coupon.reservedUntil && coupon.reservedUntil.getTime() > now.getTime()) return;
  coupon.status = "AVAILABLE";
  coupon.reservedByUserId = null;
  coupon.reservedUntil = null;
  coupon.reservationIntentId = null;
  await coupon.save(sessionOpts(session));
}

export async function createCoupon(
  actor: Actor,
  input: {
    eventId: string;
    paymentOptionId: string;
    code?: string;
    expiresAt?: Date | null;
    intendedUserId?: string | null;
  }
) {
  assertAdmin(actor);
  requireObjectId(input.eventId, "event");
  requireObjectId(input.paymentOptionId, "payment option");
  await connectDB();

  const event = await Event.findById(input.eventId).lean();
  if (!event) throw new NotFoundError("Event not found.");
  const option = await getPaymentOption(input.eventId, input.paymentOptionId);
  if (!option || !option.active) throw new ValidationError("Payment option is not available.");

  const code = normalizeCode(input.code || generateCouponCode());
  if (code.length < 4 || code.length > 32) throw new ValidationError("Coupon code must be 4–32 characters.");

  try {
    const coupon = await Coupon.create({
      code,
      eventId: input.eventId,
      paymentOptionId: input.paymentOptionId,
      status: "AVAILABLE",
      expiresAt: input.expiresAt ?? null,
      intendedUserId: input.intendedUserId ?? null,
      createdBy: actor.userId,
    });
    await writeAuditLog({
      actorId: actor.userId,
      action: "COUPON_CREATED",
      targetType: "Coupon",
      targetId: String(coupon._id),
      after: { code, paymentOptionId: input.paymentOptionId, eventId: input.eventId },
    });
    return coupon;
  } catch (err) {
    if (typeof err === "object" && err && "code" in err && (err as { code?: number }).code === 11000) {
      throw new ConflictError("That coupon code already exists for this event.");
    }
    throw err;
  }
}

export async function listCouponsForEvent(actor: Actor, eventId: string) {
  assertAdmin(actor);
  requireObjectId(eventId, "event");
  await connectDB();
  const now = new Date();
  const coupons = await Coupon.find({ eventId }).sort({ createdAt: -1 }).lean();
  return coupons.map((c) => ({
    ...c,
    _id: String(c._id),
    effectivelyExpired: isExpired(c, now),
  }));
}

export async function disableCoupon(actor: Actor, couponId: string) {
  assertAdmin(actor);
  requireObjectId(couponId, "coupon");
  await connectDB();
  const coupon = await Coupon.findById(couponId);
  if (!coupon) throw new NotFoundError("Coupon not found.");
  if (coupon.status === "REDEEMED") {
    throw new ConflictError("A redeemed coupon cannot be disabled. Use an explicit release/reissue if needed.");
  }
  coupon.status = "DISABLED";
  coupon.disabledAt = new Date();
  coupon.disabledBy = actor.userId as unknown as CouponDoc["disabledBy"];
  coupon.reservedByUserId = null;
  coupon.reservedUntil = null;
  coupon.reservationIntentId = null;
  await coupon.save();
  await writeAuditLog({
    actorId: actor.userId,
    action: "COUPON_DISABLED",
    targetType: "Coupon",
    targetId: couponId,
  });
  return coupon;
}

/** Explicit admin release of a redeemed coupon so it can be reissued — audited. */
export async function releaseRedeemedCoupon(actor: Actor, couponId: string, reason: string) {
  assertAdmin(actor);
  requireObjectId(couponId, "coupon");
  if (!reason.trim()) throw new ValidationError("A reason is required to release a redeemed coupon.");
  await connectDB();
  const coupon = await Coupon.findById(couponId);
  if (!coupon) throw new NotFoundError("Coupon not found.");
  if (coupon.status !== "REDEEMED") throw new ConflictError("Only a redeemed coupon can be released.");
  const before = {
    status: coupon.status,
    redeemedByRegistrationId: coupon.redeemedByRegistrationId,
  };
  coupon.status = "DISABLED";
  coupon.releasedAt = new Date();
  coupon.releasedBy = actor.userId as unknown as CouponDoc["releasedBy"];
  coupon.releaseReason = reason.trim();
  await coupon.save();
  await writeAuditLog({
    actorId: actor.userId,
    action: "COUPON_RELEASED",
    targetType: "Coupon",
    targetId: couponId,
    before,
    after: { status: coupon.status, reason: reason.trim() },
  });
  return coupon;
}

export type CouponPreview = {
  couponId: string;
  code: string;
  paymentOption: PaymentOptionView;
  reservedUntil: string;
  reservationIntentId: string;
};

export async function reserveCoupon(
  actor: Actor,
  input: { eventId: string; code: string; reservationIntentId: string }
): Promise<CouponPreview> {
  assertFighter(actor);
  requireObjectId(input.eventId, "event");
  const code = normalizeCode(input.code);
  const intentId = input.reservationIntentId.trim();
  if (!code) throw new ValidationError("Enter a coupon code.");
  if (!intentId || intentId.length < 8 || intentId.length > 64) {
    throw new ValidationError("Invalid reservation intent.");
  }
  await connectDB();

  const now = new Date();
  const reservedUntil = new Date(now.getTime() + couponReservationMinutes() * 60_000);

  return withTransaction(async (session) => {
    const openCount = await bindSession(
      Coupon.countDocuments({
        reservedByUserId: actor.userId,
        status: "RESERVED",
        reservedUntil: { $gt: now },
      }),
      session
    );
    if (openCount >= maxOpenCouponReservationsPerUser()) {
      throw new ConflictError("Too many open coupon reservations. Finish or clear one before trying again.");
    }

    const coupon = await bindSession(Coupon.findOne({ eventId: input.eventId, code }), session);
    if (!coupon) throw new NotFoundError("Coupon not found.");

    await releaseExpiredReservation(coupon, now, session);

    if (isExpired(coupon, now)) {
      if (coupon.status !== "EXPIRED") {
        coupon.status = "EXPIRED";
        await coupon.save(sessionOpts(session));
      }
      throw new ValidationError("This coupon has expired.");
    }
    if (coupon.status === "DISABLED") throw new ValidationError("This coupon is no longer valid.");
    if (coupon.status === "REDEEMED") throw new ConflictError("This coupon has already been used.");

    if (coupon.intendedUserId && String(coupon.intendedUserId) !== actor.userId) {
      throw new ForbiddenCouponError();
    }

    if (coupon.status === "RESERVED") {
      if (reservationStillValid(coupon, actor.userId, intentId, now)) {
        // Extend the same reservation.
        coupon.reservedUntil = reservedUntil;
        await coupon.save(sessionOpts(session));
      } else if (String(coupon.reservedByUserId) === actor.userId && coupon.reservationIntentId === intentId) {
        throw new ValidationError("This coupon reservation has expired. Apply the code again.");
      } else {
        throw new ConflictError("This coupon is temporarily held by another registration attempt.");
      }
    } else if (coupon.status === "AVAILABLE") {
      coupon.status = "RESERVED";
      coupon.reservedByUserId = actor.userId as unknown as CouponDoc["reservedByUserId"];
      coupon.reservedUntil = reservedUntil;
      coupon.reservationIntentId = intentId;
      await coupon.save(sessionOpts(session));
    } else {
      throw new ConflictError("This coupon cannot be applied right now.");
    }

    const paymentOption = await getPaymentOption(input.eventId, String(coupon.paymentOptionId));
    if (!paymentOption || !paymentOption.active) {
      throw new ValidationError("The payment option linked to this coupon is unavailable.");
    }

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "COUPON_RESERVED",
        targetType: "Coupon",
        targetId: String(coupon._id),
        after: { reservedUntil, reservationIntentId: intentId },
      },
      session
    );

    return {
      couponId: String(coupon._id),
      code: coupon.code,
      paymentOption,
      reservedUntil: reservedUntil.toISOString(),
      reservationIntentId: intentId,
    };
  });
}

class ForbiddenCouponError extends ValidationError {
  constructor() {
    super("This coupon is not available for your account.");
  }
}

export async function releaseMyCouponReservation(
  actor: Actor,
  input: { eventId: string; code: string; reservationIntentId: string }
) {
  assertFighter(actor);
  requireObjectId(input.eventId, "event");
  await connectDB();
  const code = normalizeCode(input.code);
  const coupon = await Coupon.findOne({ eventId: input.eventId, code });
  if (!coupon) return;
  if (
    coupon.status === "RESERVED" &&
    String(coupon.reservedByUserId) === actor.userId &&
    coupon.reservationIntentId === input.reservationIntentId
  ) {
    coupon.status = "AVAILABLE";
    coupon.reservedByUserId = null;
    coupon.reservedUntil = null;
    coupon.reservationIntentId = null;
    await coupon.save();
  }
}

/**
 * Consume a reserved coupon atomically with registration creation.
 * A late request from an old reservation must not redeem a code held by someone else.
 */
export async function redeemReservedCouponInSession(
  session: DbSession,
  input: {
    eventId: string;
    couponId: string;
    userId: string;
    reservationIntentId: string;
    registrationId: string;
    now?: Date;
  }
): Promise<{ coupon: InstanceType<typeof Coupon>; paymentOptionId: string }> {
  const now = input.now ?? new Date();
  const coupon = await bindSession(Coupon.findById(input.couponId), session);
  if (!coupon) throw new NotFoundError("Coupon not found.");
  if (String(coupon.eventId) !== input.eventId) throw new ValidationError("Coupon does not belong to this event.");

  await releaseExpiredReservation(coupon, now, session);

  if (!reservationStillValid(coupon, input.userId, input.reservationIntentId, now)) {
    throw new ConflictError("Coupon reservation expired or is no longer yours. Apply the code again.");
  }

  coupon.status = "REDEEMED";
  coupon.redeemedByRegistrationId = input.registrationId as unknown as CouponDoc["redeemedByRegistrationId"];
  coupon.redeemedAt = now;
  coupon.reservedUntil = null;
  coupon.reservationIntentId = null;
  await coupon.save(sessionOpts(session));

  await writeAuditLog(
    {
      actorId: input.userId,
      action: "COUPON_REDEEMED",
      targetType: "Coupon",
      targetId: String(coupon._id),
      after: { registrationId: input.registrationId },
    },
    session
  );

  return { coupon, paymentOptionId: String(coupon.paymentOptionId) };
}

export async function previewCouponForFighter(
  actor: Actor,
  eventId: string,
  code: string
): Promise<{ valid: boolean; message?: string; paymentOption?: PaymentOptionView }> {
  assertFighter(actor);
  requireObjectId(eventId, "event");
  await connectDB();
  const now = new Date();
  const coupon = await Coupon.findOne({ eventId, code: normalizeCode(code) });
  if (!coupon) return { valid: false, message: "Coupon not found." };
  await releaseExpiredReservation(coupon, now);
  if (isExpired(coupon, now)) return { valid: false, message: "This coupon has expired." };
  if (coupon.status === "DISABLED") return { valid: false, message: "This coupon is no longer valid." };
  if (coupon.status === "REDEEMED") return { valid: false, message: "This coupon has already been used." };
  if (coupon.status === "RESERVED" && String(coupon.reservedByUserId) !== actor.userId) {
    return { valid: false, message: "This coupon is temporarily held." };
  }
  if (coupon.intendedUserId && String(coupon.intendedUserId) !== actor.userId) {
    return { valid: false, message: "This coupon is not available for your account." };
  }
  const paymentOption = await getPaymentOption(eventId, String(coupon.paymentOptionId));
  if (!paymentOption?.active) return { valid: false, message: "Linked payment option unavailable." };
  return { valid: true, paymentOption };
}
