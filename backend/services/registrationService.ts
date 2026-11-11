import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, assertFighter, type Actor } from "@/server/auth/actor";
import { Event } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { Registration, type RegistrationDoc } from "@/server/models/Registration";
import { PaymentSubmission } from "@/server/models/PaymentSubmission";
import { FighterProfile } from "@/server/models/FighterProfile";
import { User } from "@/server/models/User";
import { toAdminFighterView } from "./fighterService";
import { writeAuditLog } from "@/server/audit/log";
import { Match } from "@/server/models/Match";
import { recordMatchResult } from "./matchService";
import { isActiveRegistration } from "./registrationStateMachine";
import { claimSeat, releaseSeat } from "./divisionOccupancy";
import { bindSession, isDuplicateKey, sessionOpts, withTransaction } from "@/server/db/transaction";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";
import { getDefaultPaymentOption, getPaymentOption } from "./paymentOptionService";
import { redeemReservedCouponInSession } from "./couponService";

function resolveFeeMinorUnits(
  event: { paymentInstructions?: { feeMinorUnits: number } | null },
  division: { feeMinorUnitsOverride?: number | null }
): number {
  return division.feeMinorUnitsOverride ?? event.paymentInstructions?.feeMinorUnits ?? 0;
}

export type CreateRegistrationOptions = {
  couponId?: string | null;
  reservationIntentId?: string | null;
  /** Ignored if present — never trusted from the client. Kept only to fail closed on tampering attempts in tests. */
  clientAmountMinorUnits?: number | null;
  clientPaymentOptionId?: string | null;
};

export async function createRegistration(
  actor: Actor,
  divisionId: string,
  consents: { consent: boolean; agreement: boolean },
  options: CreateRegistrationOptions = {}
) {
  assertFighter(actor);
  requireObjectId(divisionId, "division");
  await connectDB();
  if (!consents.consent || !consents.agreement) {
    throw new ValidationError("Tick both the consent and the agreement before you continue.");
  }

  try {
    return await withTransaction(async (session) => {
      const userId = actor.userId;
      const division = await bindSession(Division.findById(divisionId), session);
      if (!division) throw new NotFoundError("Division not found.");

      const event = await bindSession(Event.findById(division.eventId), session);
      if (!event) throw new NotFoundError("Event not found.");

      const now = new Date();
      if (event.status !== "REGISTRATION_OPEN" || now < event.registrationOpensAt || now > event.registrationClosesAt) {
        throw new ValidationError("Registration is not currently open for this event.");
      }

      const existing = await bindSession(Registration.findOne({ userId, divisionId }), session);
      if (existing && isActiveRegistration(existing.status as RegistrationDoc["status"])) {
        throw new ConflictError("You already have an active registration in this division.");
      }

      // Server-authoritative payment selection — never trust client fee/option.
      let paymentOption = await getDefaultPaymentOption(String(event._id));
      let couponId: string | null = null;
      let couponCode = "";

      if (options.couponId) {
        if (!options.reservationIntentId) {
          throw new ValidationError("Coupon reservation intent is required.");
        }
        // Placeholder registration id filled after create — redeem uses conditional update after insert.
        // We redeem after Registration.create below.
      }

      if (
        options.clientPaymentOptionId &&
        options.clientPaymentOptionId !== paymentOption.id &&
        !options.couponId
      ) {
        // Client may suggest an option id only when no coupon; still re-resolve server-side.
        const suggested = await getPaymentOption(String(event._id), options.clientPaymentOptionId);
        if (!suggested?.active) throw new ValidationError("That payment option is not available.");
        paymentOption = suggested;
      }

      // Division override still applies on top of the selected option when set (legacy behaviour).
      const expectedAmountMinorUnits =
        division.feeMinorUnitsOverride != null ? division.feeMinorUnitsOverride : paymentOption.amountMinorUnits;

      if (
        options.clientAmountMinorUnits != null &&
        options.clientAmountMinorUnits !== expectedAmountMinorUnits
      ) {
        throw new ValidationError("Payment amount mismatch. Refresh and try again.");
      }

      await claimSeat(division._id, session);

      const [registration] = await Registration.create(
        [
          {
            userId,
            eventId: event._id,
            divisionId: division._id,
            status: "AWAITING_PAYMENT",
            consentAcceptedAt: now,
            agreementAcceptedAt: now,
            feeSnapshot: {
              amountMinorUnits: expectedAmountMinorUnits,
              currency: paymentOption.currency,
              paymentOptionId: paymentOption.id,
              paymentOptionLabel: paymentOption.label,
              qrImageKey: paymentOption.qrImageKey,
              couponId: null,
              couponCode: "",
              snapshottedAt: now,
            },
            couponId: null,
            statusHistory: [{ status: "AWAITING_PAYMENT", at: now }],
          },
        ],
        { session }
      );

      if (options.couponId) {
        const redeemed = await redeemReservedCouponInSession(session, {
          eventId: String(event._id),
          couponId: options.couponId,
          userId,
          reservationIntentId: options.reservationIntentId!,
          registrationId: String(registration._id),
          now,
        });
        const couponOption = await getPaymentOption(String(event._id), redeemed.paymentOptionId);
        if (!couponOption?.active) throw new ValidationError("Coupon payment option is unavailable.");
        const amount =
          division.feeMinorUnitsOverride != null ? division.feeMinorUnitsOverride : couponOption.amountMinorUnits;
        if (options.clientAmountMinorUnits != null && options.clientAmountMinorUnits !== amount) {
          throw new ValidationError("Payment amount mismatch. Refresh and try again.");
        }
        couponId = String(redeemed.coupon._id);
        couponCode = redeemed.coupon.code;
        paymentOption = couponOption;
        registration.set("feeSnapshot", {
          amountMinorUnits: amount,
          currency: couponOption.currency,
          paymentOptionId: couponOption.id,
          paymentOptionLabel: couponOption.label,
          qrImageKey: couponOption.qrImageKey,
          couponId: redeemed.coupon._id,
          couponCode,
          snapshottedAt: now,
        });
        registration.couponId = redeemed.coupon._id as unknown as RegistrationDoc["couponId"];
        await registration.save(sessionOpts(session));
      }

      const snapAmount = registration.feeSnapshot?.amountMinorUnits ?? expectedAmountMinorUnits;
      const [paymentSubmission] = await PaymentSubmission.create(
        [
          {
            registrationId: registration._id,
            userId,
            eventId: event._id,
            expectedAmountMinorUnits: snapAmount,
            status: "AWAITING_SUBMISSION",
          },
        ],
        { session }
      );

      await writeAuditLog(
        {
          actorId: userId,
          action: "REGISTRATION_CREATED",
          targetType: "Registration",
          targetId: String(registration._id),
          after: {
            amountMinorUnits: snapAmount,
            paymentOptionId: paymentOption.id,
            couponId,
          },
        },
        session
      );

      return { registration, paymentSubmission };
    });
  } catch (err) {
    if (isDuplicateKey(err)) {
      throw new ConflictError("You already have an active registration in this division.");
    }
    throw err;
  }
}

export async function listMyRegistrations(actor: Actor) {
  assertFighter(actor);
  await connectDB();
  const userId = actor.userId;
  const registrations = await Registration.find({ userId }).sort({ createdAt: -1 }).lean();

  const eventIds = [...new Set(registrations.map((r) => String(r.eventId)))];
  const divisionIds = [...new Set(registrations.map((r) => String(r.divisionId)))];
  const [events, divisions] = await Promise.all([
    Event.find({ _id: { $in: eventIds } }).select("name").lean(),
    Division.find({ _id: { $in: divisionIds } }).select("name").lean(),
  ]);
  const eventById = new Map(events.map((e) => [String(e._id), { _id: e._id, name: e.name }]));
  const divisionById = new Map(divisions.map((d) => [String(d._id), { _id: d._id, name: d.name }]));

  return registrations.map((r) => ({
    ...r,
    event: eventById.get(String(r.eventId)) ?? null,
    division: divisionById.get(String(r.divisionId)) ?? null,
  }));
}

export async function getRegistrationForFighter(actor: Actor, registrationId: string) {
  assertFighter(actor);
  requireObjectId(registrationId, "registration");
  await connectDB();
  const userId = actor.userId;
  const registration = await Registration.findOne({ _id: registrationId, userId }).lean();
  if (!registration) throw new NotFoundError("Registration not found.");

  const [event, division, submissions] = await Promise.all([
    Event.findById(registration.eventId).select("name paymentInstructions paymentOptions timezone").lean(),
    Division.findById(registration.divisionId).lean(),
    PaymentSubmission.find({ registrationId }).sort({ createdAt: -1 }).lean(),
  ]);

  const snap = registration.feeSnapshot;
  const feeView = snap
    ? {
        amountMinorUnits: snap.amountMinorUnits,
        currency: snap.currency,
        paymentOptionId: snap.paymentOptionId ? String(snap.paymentOptionId) : null,
        paymentOptionLabel: snap.paymentOptionLabel ?? "",
        qrImageKey: snap.qrImageKey ?? "",
        couponCode: snap.couponCode ?? "",
      }
    : {
        amountMinorUnits: division?.feeMinorUnitsOverride ?? event?.paymentInstructions?.feeMinorUnits ?? 0,
        currency: event?.paymentInstructions?.currency ?? "INR",
        paymentOptionId: null,
        paymentOptionLabel: "Default",
        qrImageKey: event?.paymentInstructions?.qrImageKey ?? "",
        couponCode: "",
      };

  return {
    registration,
    event,
    division,
    submissions,
    latestSubmission: submissions[0] ?? null,
    feeView,
  };
}

/** Admin-dashboard feed: most recent registrations across every event, enriched for display. */
export async function listRecentRegistrationsForAdmin(actor: Actor, limit = 5) {
  assertAdmin(actor);
  await connectDB();
  const registrations = await Registration.find().sort({ createdAt: -1 }).limit(limit).lean();

  const eventIds = [...new Set(registrations.map((r) => String(r.eventId)))];
  const divisionIds = [...new Set(registrations.map((r) => String(r.divisionId)))];
  const userIds = [...new Set(registrations.map((r) => String(r.userId)))];
  const [events, divisions, profiles] = await Promise.all([
    Event.find({ _id: { $in: eventIds } }).select("name").lean(),
    Division.find({ _id: { $in: divisionIds } }).select("name").lean(),
    FighterProfile.find({ userId: { $in: userIds } }).select("displayName userId").lean(),
  ]);
  const eventById = new Map(events.map((e) => [String(e._id), { name: e.name }]));
  const divisionById = new Map(divisions.map((d) => [String(d._id), { name: d.name }]));
  const profileByUserId = new Map(profiles.map((p) => [String(p.userId), p.displayName]));

  return registrations.map((r) => ({
    _id: r._id,
    userId: String(r.userId),
    fighterName: profileByUserId.get(String(r.userId)) ?? "Unknown fighter",
    status: r.status,
    createdAt: r.createdAt as Date,
    event: eventById.get(String(r.eventId)) ?? null,
    division: divisionById.get(String(r.divisionId)) ?? null,
  }));
}

export async function listOpenDivisionsForRegistration(actor: Actor) {
  assertFighter(actor);
  await connectDB();
  const now = new Date();
  const events = await Event.find({
    status: "REGISTRATION_OPEN",
    registrationOpensAt: { $lte: now },
    registrationClosesAt: { $gte: now },
  }).lean();
  const eventIds = events.map((e) => e._id);
  const divisions = await Division.find({ eventId: { $in: eventIds } }).lean();
  const eventById = new Map(events.map((e) => [String(e._id), e]));

  return divisions.map((d) => ({ ...d, event: eventById.get(String(d.eventId)) ?? null }));
}

export async function listRegistrationsForEvent(actor: Actor, eventId: string) {
  assertAdmin(actor);
  requireObjectId(eventId, "event");
  await connectDB();
  const registrations = await Registration.find({ eventId }).sort({ createdAt: -1 }).lean();
  const userIds = [...new Set(registrations.map((r) => String(r.userId)))];
  const divisionIds = [...new Set(registrations.map((r) => String(r.divisionId)))];
  const [profiles, divisions, users] = await Promise.all([
    FighterProfile.find({ userId: { $in: userIds } }).lean(),
    Division.find({ _id: { $in: divisionIds } }).lean(),
    User.find({ _id: { $in: userIds } }).select("email").lean(),
  ]);
  const profileByUserId = new Map(profiles.map((p) => [String(p.userId), p]));
  const divisionById = new Map(divisions.map((d) => [String(d._id), d]));
  const emailById = new Map(users.map((user) => [String(user._id), user.email]));
  return registrations.map((r) => {
    const profile = profileByUserId.get(String(r.userId));
    return {
      ...r,
      fighterName: profile?.displayName ?? "Unknown fighter",
      divisionName: divisionById.get(String(r.divisionId))?.name ?? "Unknown division",
      fighter: profile ? toAdminFighterView(profile, emailById.get(String(r.userId)) ?? "") : null,
    };
  });
}

/** Pull an incomplete, abandoned, or unpaid registration so the bracket can move on. */
export async function withdrawRegistration(actor: Actor, registrationId: string) {
  assertAdmin(actor);
  requireObjectId(registrationId, "registration");
  await connectDB();
  return withTransaction(async (session) => {
    const registration = await bindSession(Registration.findById(registrationId), session);
    if (!registration) throw new NotFoundError("Registration not found.");
    if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
      throw new ConflictError("This registration is already closed.");
    }

    await releaseSeat(registration.divisionId, session);
    registration.status = "CANCELLED";
    registration.statusHistory.push({ status: "CANCELLED", at: new Date() });
    await registration.save(sessionOpts(session));

    const matches = await bindSession(
      Match.find({
        status: { $in: ["PENDING", "SCHEDULED"] },
        $or: [{ competitorARegistrationId: registration._id }, { competitorBRegistrationId: registration._id }],
      }),
      session
    );

    for (const match of matches) {
      const isA = String(match.competitorARegistrationId) === String(registration._id);
      const other = isA ? match.competitorBRegistrationId : match.competitorARegistrationId;
      if (other && match.status === "SCHEDULED") {
        await recordMatchResult(actor, String(match._id), String(other), "WITHDRAWAL", session);
      } else if (isA) {
        match.competitorARegistrationId = null;
        await match.save(sessionOpts(session));
      } else {
        match.competitorBRegistrationId = null;
        await match.save(sessionOpts(session));
      }
    }

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "REGISTRATION_WITHDRAWN",
        targetType: "Registration",
        targetId: registrationId,
      },
      session
    );
    return registration;
  });
}
