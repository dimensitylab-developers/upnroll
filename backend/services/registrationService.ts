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
import { isActiveRegistration, ACTIVE_REGISTRATION_STATUSES } from "./registrationStateMachine";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";

function resolveFeeMinorUnits(
  event: { paymentInstructions?: { feeMinorUnits: number } | null },
  division: { feeMinorUnitsOverride?: number | null }
): number {
  return division.feeMinorUnitsOverride ?? event.paymentInstructions?.feeMinorUnits ?? 0;
}

export async function createRegistration(
  actor: Actor,
  divisionId: string,
  consents: { consent: boolean; agreement: boolean }
) {
  assertFighter(actor);
  await connectDB();
  const userId = actor.userId;

  const division = await Division.findById(divisionId);
  if (!division) throw new NotFoundError("Division not found.");

  const event = await Event.findById(division.eventId);
  if (!event) throw new NotFoundError("Event not found.");

  if (!consents.consent || !consents.agreement) {
    throw new ValidationError("Tick both the consent and the agreement before you continue.");
  }

  const now = new Date();
  if (event.status !== "REGISTRATION_OPEN" || now < event.registrationOpensAt || now > event.registrationClosesAt) {
    throw new ValidationError("Registration is not currently open for this event.");
  }

  const existing = await Registration.findOne({ userId, divisionId });
  if (existing && isActiveRegistration(existing.status as RegistrationDoc["status"])) {
    throw new ConflictError("You already have an active registration in this division.");
  }

  const activeCount = await Registration.countDocuments({
    divisionId,
    status: { $in: ACTIVE_REGISTRATION_STATUSES },
  });
  if (activeCount >= division.capacity) {
    throw new ConflictError("This division is at capacity.");
  }

  const registration = await Registration.create({
    userId,
    eventId: event._id,
    divisionId: division._id,
    status: "AWAITING_PAYMENT",
    consentAcceptedAt: now,
    agreementAcceptedAt: now,
    statusHistory: [{ status: "AWAITING_PAYMENT", at: now }],
  });

  const expectedAmountMinorUnits = resolveFeeMinorUnits(event, division);
  const paymentSubmission = await PaymentSubmission.create({
    registrationId: registration._id,
    userId,
    eventId: event._id,
    expectedAmountMinorUnits,
    status: "AWAITING_SUBMISSION",
  });

  await writeAuditLog({
    actorId: userId,
    action: "REGISTRATION_CREATED",
    targetType: "Registration",
    targetId: String(registration._id),
  });

  return { registration, paymentSubmission };
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
  await connectDB();
  const userId = actor.userId;
  const registration = await Registration.findOne({ _id: registrationId, userId }).lean();
  if (!registration) throw new NotFoundError("Registration not found.");

  const [event, division, submissions] = await Promise.all([
    Event.findById(registration.eventId).select("name paymentInstructions").lean(),
    Division.findById(registration.divisionId).lean(),
    PaymentSubmission.find({ registrationId }).sort({ createdAt: -1 }).lean(),
  ]);

  return { registration, event, division, submissions, latestSubmission: submissions[0] ?? null };
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
    fighterName: profileByUserId.get(String(r.userId)) ?? "Unknown fighter",
    event: eventById.get(String(r.eventId)) ?? null,
    division: divisionById.get(String(r.divisionId)) ?? null,
  }));
}

export async function listOpenDivisionsForRegistration() {
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
  await connectDB();
  const registration = await Registration.findById(registrationId);
  if (!registration) throw new NotFoundError("Registration not found.");
  if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("This registration is already closed.");
  }

  registration.status = "CANCELLED";
  registration.statusHistory.push({ status: "CANCELLED", at: new Date() });
  await registration.save();

  const matches = await Match.find({
    status: { $in: ["PENDING", "SCHEDULED"] },
    $or: [{ competitorARegistrationId: registration._id }, { competitorBRegistrationId: registration._id }],
  });

  for (const match of matches) {
    const isA = String(match.competitorARegistrationId) === String(registration._id);
    const other = isA ? match.competitorBRegistrationId : match.competitorARegistrationId;
    if (other && match.status === "SCHEDULED") {
      await recordMatchResult(actor, String(match._id), String(other), "WITHDRAWAL");
    } else if (isA) {
      match.competitorARegistrationId = null;
      await match.save();
    } else {
      match.competitorBRegistrationId = null;
      await match.save();
    }
  }

  await writeAuditLog({
    actorId: actor.userId,
    action: "REGISTRATION_WITHDRAWN",
    targetType: "Registration",
    targetId: registrationId,
  });
  return registration;
}
