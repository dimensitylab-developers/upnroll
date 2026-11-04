import { connectDB } from "@/server/db/connect";
import { Event, type EventStatus } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError, ConflictError } from "@/server/http/errors";

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
};

const PUBLIC_EVENT_STATUSES: EventStatus[] = ["REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"];

export async function createEvent(adminId: string, input: CreateEventInput) {
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
    paymentInstructions: {
      feeMinorUnits: input.feeMinorUnits,
      currency: input.currency ?? "INR",
      qrImageKey: "",
    },
  });

  await writeAuditLog({ actorId: adminId, action: "EVENT_CREATED", targetType: "Event", targetId: String(event._id) });
  return event;
}

export async function updateEventStatus(adminId: string, eventId: string, status: EventStatus) {
  await connectDB();
  const event = await Event.findById(eventId);
  if (!event) throw new NotFoundError("Event not found.");

  const before = event.status;
  event.status = status;
  await event.save();

  await writeAuditLog({
    actorId: adminId,
    action: "EVENT_STATUS_CHANGED",
    targetType: "Event",
    targetId: eventId,
    before: { status: before },
    after: { status },
  });
  return event;
}

export async function listEventsForAdmin() {
  await connectDB();
  return Event.find().sort({ createdAt: -1 }).lean();
}

/** Admin-dashboard feed: events that haven't started yet, soonest first. */
export async function listUpcomingEventsForAdmin(limit = 5) {
  await connectDB();
  const now = new Date();
  return Event.find({ startDate: { $gte: now } }).sort({ startDate: 1 }).limit(limit).lean();
}

export async function listPublicEvents() {
  await connectDB();
  return Event.find({ status: { $in: PUBLIC_EVENT_STATUSES } }).sort({ startDate: 1 }).lean();
}

export async function getEventBySlug(slug: string) {
  await connectDB();
  const event = await Event.findOne({ slug, status: { $in: PUBLIC_EVENT_STATUSES } }).lean();
  if (!event) throw new NotFoundError("Event not found.");
  return event;
}

export async function getEventForAdmin(eventId: string) {
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

export async function createDivision(adminId: string, input: CreateDivisionInput) {
  await connectDB();
  const event = await Event.findById(input.eventId);
  if (!event) throw new NotFoundError("Event not found.");

  const division = await Division.create({
    eventId: event._id,
    name: input.name,
    discipline: input.discipline,
    capacity: input.capacity,
    feeMinorUnitsOverride: input.feeMinorUnitsOverride ?? null,
  });

  await writeAuditLog({ actorId: adminId, action: "DIVISION_CREATED", targetType: "Division", targetId: String(division._id) });
  return division;
}

export async function listDivisionsForEvent(eventId: string) {
  await connectDB();
  return Division.find({ eventId }).sort({ createdAt: 1 }).lean();
}
