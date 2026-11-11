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

  const currency = input.currency ?? "INR";
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
    timezone: "Asia/Kolkata",
    paymentInstructions: {
      feeMinorUnits: input.feeMinorUnits,
      currency,
      qrImageKey: "",
    },
    paymentOptions: [
      {
        label: "Default",
        amountMinorUnits: input.feeMinorUnits,
        currency,
        qrImageKey: "",
        active: true,
        isDefault: true,
      },
    ],
    scoringRules: { configured: false, winByHighestScore: false, allowTies: false, points: [], penalties: [], outcomes: [] },
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

export type UpdateEventDetailsInput = {
  name: string;
  description?: string;
  venue?: string;
  startDate: Date;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  feeMinorUnits: number;
  currency?: string;
};

export async function updateEventDetails(actor: Actor, eventId: string, input: UpdateEventDetailsInput) {
  assertAdmin(actor);
  await connectDB();
  const event = await Event.findById(eventId);
  if (!event) throw new NotFoundError("Event not found.");
  if (input.registrationOpensAt >= input.registrationClosesAt) {
    throw new ValidationError("Registration must open before it closes.");
  }
  if (!Number.isInteger(input.feeMinorUnits) || input.feeMinorUnits < 0) {
    throw new ValidationError("Fee must be zero or a positive amount.");
  }

  if (!event.paymentInstructions) {
    event.paymentInstructions = { feeMinorUnits: 0, currency: "INR", qrImageKey: "" };
  }

  const before = {
    name: event.name,
    description: event.description,
    venue: event.venue,
    startDate: event.startDate,
    registrationOpensAt: event.registrationOpensAt,
    registrationClosesAt: event.registrationClosesAt,
    feeMinorUnits: event.paymentInstructions.feeMinorUnits,
  };

  event.name = input.name;
  event.description = input.description ?? "";
  event.venue = input.venue ?? "";
  event.startDate = input.startDate;
  event.registrationOpensAt = input.registrationOpensAt;
  event.registrationClosesAt = input.registrationClosesAt;
  event.paymentInstructions.feeMinorUnits = input.feeMinorUnits;
  event.paymentInstructions.currency = input.currency ?? event.paymentInstructions.currency ?? "INR";
  if (!event.paymentOptions || event.paymentOptions.length === 0) {
    event.paymentOptions = [
      {
        label: "Default",
        amountMinorUnits: input.feeMinorUnits,
        currency: event.paymentInstructions.currency,
        qrImageKey: event.paymentInstructions.qrImageKey ?? "",
        active: true,
        isDefault: true,
      },
    ] as typeof event.paymentOptions;
  } else {
    const def = event.paymentOptions.find((o) => o.isDefault) ?? event.paymentOptions[0];
    if (def) {
      def.amountMinorUnits = input.feeMinorUnits;
      def.currency = event.paymentInstructions.currency;
    }
  }
  await event.save();

  await writeAuditLog({
    actorId: actor.userId,
    action: "EVENT_DETAILS_UPDATED",
    targetType: "Event",
    targetId: eventId,
    before,
    after: {
      name: event.name,
      description: event.description,
      venue: event.venue,
      startDate: event.startDate,
      registrationOpensAt: event.registrationOpensAt,
      registrationClosesAt: event.registrationClosesAt,
      feeMinorUnits: event.paymentInstructions.feeMinorUnits,
    },
  });
  return event;
}

export async function setEventPaymentQr(actor: Actor, eventId: string, bytes: Buffer, ext: string, contentType: string) {
  assertAdmin(actor);
  await connectDB();
  const event = await Event.findById(eventId);
  if (!event) throw new NotFoundError("Event not found.");

  if (!event.paymentInstructions) {
    event.paymentInstructions = { feeMinorUnits: 0, currency: "INR", qrImageKey: "" };
  }
  const { getStorageAdapter } = await import("@/server/storage/factory");
  const label = `events/${eventId}/payment-qr${ext}`;
  const storage = getStorageAdapter();
  const previous = event.paymentInstructions.qrImageKey || "";
  // Local disk overwrites the same path label; GridFS returns a new gridfs:<id> each put.
  if (previous && previous !== label) await storage.delete(previous);
  const storedKey = await storage.put(label, bytes, contentType, {
    metadata: { purpose: "payment-qr", eventId },
  });
  event.paymentInstructions.qrImageKey = storedKey;
  // Keep the default payment option QR in sync with the legacy single-QR field.
  if (!event.paymentOptions || event.paymentOptions.length === 0) {
    event.paymentOptions = [
      {
        label: "Default",
        amountMinorUnits: event.paymentInstructions.feeMinorUnits,
        currency: event.paymentInstructions.currency ?? "INR",
        qrImageKey: storedKey,
        active: true,
        isDefault: true,
      },
    ] as typeof event.paymentOptions;
  } else {
    const def = event.paymentOptions.find((o) => o.isDefault) ?? event.paymentOptions[0];
    if (def) def.qrImageKey = storedKey;
  }
  await event.save();

  await writeAuditLog({
    actorId: actor.userId,
    action: "EVENT_PAYMENT_QR_UPDATED",
    targetType: "Event",
    targetId: eventId,
    after: { qrImageKey: storedKey },
  });
  return event;
}

export async function openEventPaymentQr(actor: Actor, eventId: string) {
  assertAdmin(actor);
  await connectDB();
  const event = await Event.findById(eventId).lean();
  if (!event) throw new NotFoundError("Event not found.");
  const key = event.paymentInstructions?.qrImageKey;
  if (!key) throw new NotFoundError("Payment QR not set.");
  const { getStorageAdapter } = await import("@/server/storage/factory");
  return getStorageAdapter().open(key);
}

/** Fighter-facing QR open — caller must already authorize the registration ownership. */
export async function openEventPaymentQrForPublic(eventId: string) {
  await connectDB();
  const event = await Event.findById(eventId).lean();
  if (!event) throw new NotFoundError("Event not found.");
  const key = event.paymentInstructions?.qrImageKey;
  if (!key) throw new NotFoundError("Payment QR not set.");
  const { getStorageAdapter } = await import("@/server/storage/factory");
  return getStorageAdapter().open(key);
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

export type UpdateDivisionInput = {
  name: string;
  discipline: string;
  capacity: number;
};

export async function updateDivision(actor: Actor, divisionId: string, input: UpdateDivisionInput) {
  assertAdmin(actor);
  await connectDB();
  if (!input.name.trim() || !input.discipline.trim()) {
    throw new ValidationError("Enter a division name and discipline.");
  }
  if (!Number.isInteger(input.capacity) || input.capacity < 1) {
    throw new ValidationError("Capacity must be at least 1.");
  }

  return withTransaction(async (session) => {
    const division = await Division.findById(divisionId).session(session);
    if (!division) throw new NotFoundError("Division not found.");
    const filled = requireFilledCount(division.filledCount);
    if (input.capacity < filled) {
      throw new ConflictError("Capacity cannot be lower than the current number of active registrations.");
    }
    const before = { name: division.name, discipline: division.discipline, capacity: division.capacity };
    division.name = input.name.trim();
    division.discipline = input.discipline.trim();
    division.capacity = input.capacity;
    await division.save(sessionOpts(session));
    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "DIVISION_UPDATED",
        targetType: "Division",
        targetId: divisionId,
        before,
        after: { name: division.name, discipline: division.discipline, capacity: division.capacity, filledCount: filled },
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
