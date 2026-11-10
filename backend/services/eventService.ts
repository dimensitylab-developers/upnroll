import "server-only";
import { cache } from "react";
import { connectDB } from "@/server/db/connect";
import { Event, type EventStatus } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";
import { requireFilledCount } from "./divisionOccupancy";
import { sessionOpts, withTransaction } from "@/server/db/transaction";
import { assertAdmin, type Actor } from "@/server/auth/actor";

export type CreateEventInput = {
  name: string;
  slug: string;
  description?: string;
  venue?: string;
  startDate: Date;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  feeMinorUnits: number;
  currency?: string;
  matCount?: number;
};

export const PUBLIC_EVENT_STATUSES: EventStatus[] = ["REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"];

export async function createEvent(actor: Actor, input: CreateEventInput) {
  assertAdmin(actor);
  await connectDB();

  const existing = await Event.findOne({ slug: input.slug }).lean();
  if (existing) throw new ConflictError("An event with this slug already exists.");

  const event = await Event.create({
    name: input.name,
    slug: input.slug,
    description: input.description ?? "",
    venue: input.venue ?? "",
    startDate: input.startDate,
    registrationOpensAt: input.registrationOpensAt,
    registrationClosesAt: input.registrationClosesAt,
    status: "DRAFT",
    matCount: input.matCount && input.matCount >= 1 ? Math.floor(input.matCount) : 1,
    paymentInstructions: {
      feeMinorUnits: input.feeMinorUnits,
      currency: input.currency ?? "INR",
      qrImageKey: "",
    },
  });

  await writeAuditLog({ actorId: actor.userId, action: "EVENT_CREATED", targetType: "Event", targetId: String(event._id) });
  return event;
}

export async function updateEventStatus(actor: Actor, eventId: string, status: EventStatus) {
  assertAdmin(actor);
  await connectDB();
  const event = await Event.findById(eventId);
  if (!event) throw new NotFoundError("Event not found.");

  const before = event.status;
  event.status = status;
  await event.save();

  await writeAuditLog({
    actorId: actor.userId,
    action: "EVENT_STATUS_CHANGED",
    targetType: "Event",
    targetId: eventId,
    before: { status: before },
    after: { status },
  });
  return event;
}

export async function updateEventMatCount(actor: Actor, eventId: string, matCount: number) {
  assertAdmin(actor);
  await connectDB();
  if (!Number.isInteger(matCount) || matCount < 1) {
    throw new ValidationError("Set at least one mat.");
  }
  const event = await Event.findById(eventId);
  if (!event) throw new NotFoundError("Event not found.");
  const before = event.matCount;
  event.matCount = matCount;
  await event.save();

  const { Match } = await import("@/server/models/Match");
  const { matNumberForOrder } = await import("./tournamentRules");
  const openMatches = await Match.find({ eventId, status: { $in: ["PENDING", "SCHEDULED"] } }).sort({ round: 1, order: 1 });
  await Promise.all(
    openMatches.map((match, index) => {
      match.mat = String(matNumberForOrder(index, matCount));
      return match.save();
    })
  );

  await writeAuditLog({
    actorId: actor.userId,
    action: "EVENT_MATS_UPDATED",
    targetType: "Event",
    targetId: eventId,
    before: { matCount: before },
    after: { matCount },
  });
  return event;
}

export async function listEventsForAdmin(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  return Event.find().sort({ createdAt: -1 }).lean();
}

/** Admin-dashboard feed: events that haven't started yet, soonest first. */
export async function listUpcomingEventsForAdmin(actor: Actor, limit = 5) {
  assertAdmin(actor);
  await connectDB();
  const now = new Date();
  return Event.find({ startDate: { $gte: now } }).sort({ startDate: 1 }).limit(limit).lean();
}

export const listPublicEvents = cache(async function listPublicEvents() {
  await connectDB();
  return Event.find({ status: { $in: PUBLIC_EVENT_STATUSES } }).sort({ startDate: 1 }).lean();
});

export async function getEventBySlug(slug: string) {
  await connectDB();
  const event = await Event.findOne({ slug, status: { $in: PUBLIC_EVENT_STATUSES } }).lean();
  if (!event) throw new NotFoundError("Event not found.");
  return event;
}

export async function getEventForAdmin(actor: Actor, eventId: string) {
  assertAdmin(actor);
  await connectDB();
  const event = await Event.findById(eventId).lean();
  if (!event) throw new NotFoundError("Event not found.");
  return event;
}

export type CreateDivisionInput = {
  eventId: string;
  name: string;
  discipline: string;
  capacity: number;
  feeMinorUnitsOverride?: number | null;
};

export async function createDivision(actor: Actor, input: CreateDivisionInput) {
  assertAdmin(actor);
  await connectDB();
  const event = await Event.findById(input.eventId);
  if (!event) throw new NotFoundError("Event not found.");

  const division = await Division.create({
    eventId: event._id,
    name: input.name,
    discipline: input.discipline,
    capacity: input.capacity,
    filledCount: 0,
    feeMinorUnitsOverride: input.feeMinorUnitsOverride ?? null,
  });

  await writeAuditLog({ actorId: actor.userId, action: "DIVISION_CREATED", targetType: "Division", targetId: String(division._id) });
  return division;
}

export async function setDivisionCapacity(actor: Actor, divisionId: string, capacity: number) {
  assertAdmin(actor);
  await connectDB();
  if (!Number.isInteger(capacity) || capacity < 1) throw new ValidationError("Capacity must be at least 1.");

  return withTransaction(async (session) => {
    const division = await Division.findById(divisionId).session(session);
    if (!division) throw new NotFoundError("Division not found.");
    const filled = requireFilledCount(division.filledCount);
    if (capacity < filled) {
      throw new ConflictError("Capacity cannot be lower than the current number of active registrations.");
    }
    division.capacity = capacity;
    await division.save(sessionOpts(session));
    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "DIVISION_CAPACITY_CHANGED",
        targetType: "Division",
        targetId: divisionId,
        after: { capacity, filledCount: filled },
      },
      session
    );
    return division;
  });
}

export async function listDivisionsForEvent(eventId: string) {
  await connectDB();
  return Division.find({ eventId }).sort({ createdAt: 1 }).lean();
}
