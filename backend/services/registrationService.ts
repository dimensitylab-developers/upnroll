import { connectDB } from "@/server/db/connect";
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
  userId: string,
  divisionId: string,
  consents: { consent: boolean; agreement: boolean }
) {
  await connectDB();

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

export async function listMyRegistrations(userId: string) {
  await connectDB();
  const registrations = await Registration.find({ userId }).sort({ createdAt: -1 }).lean();

  const eventIds = [...new Set(registrations.map((r) => String(r.eventId)))];
  const divisionIds = [...new Set(registrations.map((r) => String(r.divisionId)))];
  const [events, divisions] = await Promise.all([
    Event.find({ _id: { $in: eventIds } }).lean(),
    Division.find({ _id: { $in: divisionIds } }).lean(),
  ]);
  const eventById = new Map(events.map((e) => [String(e._id), e]));
  const divisionById = new Map(divisions.map((d) => [String(d._id), d]));

  return registrations.map((r) => ({
    ...r,
    event: eventById.get(String(r.eventId)) ?? null,
    division: divisionById.get(String(r.divisionId)) ?? null,
  }));
}

export async function getRegistrationForFighter(userId: string, registrationId: string) {
  await connectDB();
  const registration = await Registration.findOne({ _id: registrationId, userId }).lean();
  if (!registration) throw new NotFoundError("Registration not found.");

  const [event, division, submissions] = await Promise.all([
    Event.findById(registration.eventId).lean(),
    Division.findById(registration.divisionId).lean(),
    PaymentSubmission.find({ registrationId }).sort({ createdAt: -1 }).lean(),
  ]);

  return { registration, event, division, submissions, latestSubmission: submissions[0] ?? null };
}

/** Admin-dashboard feed: most recent registrations across every event, enriched for display. */
export async function listRecentRegistrationsForAdmin(limit = 5) {
  await connectDB();
  const registrations = await Registration.find().sort({ createdAt: -1 }).limit(limit).lean();

  const eventIds = [...new Set(registrations.map((r) => String(r.eventId)))];
  const divisionIds = [...new Set(registrations.map((r) => String(r.divisionId)))];
  const userIds = [...new Set(registrations.map((r) => String(r.userId)))];
  const [events, divisions, profiles] = await Promise.all([
    Event.find({ _id: { $in: eventIds } }).lean(),
    Division.find({ _id: { $in: divisionIds } }).lean(),
    FighterProfile.find({ userId: { $in: userIds } }).lean(),
  ]);
  const eventById = new Map(events.map((e) => [String(e._id), e]));
  const divisionById = new Map(divisions.map((d) => [String(d._id), d]));
  const profileByUserId = new Map(profiles.map((p) => [String(p.userId), p]));

  return registrations.map((r) => ({
    ...r,
    event: eventById.get(String(r.eventId)) ?? null,
    division: divisionById.get(String(r.divisionId)) ?? null,
    fighterName: profileByUserId.get(String(r.userId))?.displayName ?? "Unknown fighter",
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

export async function listRegistrationsForEvent(eventId: string) {
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
export async function withdrawRegistration(adminId: string, registrationId: string) {
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
      await recordMatchResult(adminId, String(match._id), String(other), "WITHDRAWAL");
    } else if (isA) {
      match.competitorARegistrationId = null;
      await match.save();
    } else {
      match.competitorBRegistrationId = null;
      await match.save();
    }
  }

  await writeAuditLog({
    actorId: adminId,
    action: "REGISTRATION_WITHDRAWN",
    targetType: "Registration",
    targetId: registrationId,
  });
  return registration;
}
