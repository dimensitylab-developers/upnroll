"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import {
  createEvent,
  createDivision,
  seedRoadToSuperFightDivisions,
  updateEventStatus,
  updateEventMatCount,
  updateEventDetails,
  updateDivision,
  setEventPaymentQr,
} from "@/server/services/eventService";
import { EVENT_STATUSES, type EventStatus } from "@/server/models/Event";
import { toAppError } from "@/server/http/errors";
import { detectImageType } from "@/features/payments/file-validation";
import { createEventSchema, createDivisionSchema, updateEventDetailsSchema, updateDivisionSchema } from "./schemas";

export type EventActionState = { error?: string };

export async function createEventAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");

  const parsed = createEventSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    venue: formData.get("venue"),
    startDate: formData.get("startDate"),
    registrationOpensAt: formData.get("registrationOpensAt"),
    registrationClosesAt: formData.get("registrationClosesAt"),
    feeAmount: formData.get("feeAmount"),
    currency: formData.get("currency"),
    matCount: formData.get("matCount") || "1",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the event details and try again." };
  }

  try {
    const event = await createEvent(actor, {
      name: parsed.data.name,
      slug: parsed.data.slug,
      venue: parsed.data.venue,
      startDate: parsed.data.startDate,
      registrationOpensAt: parsed.data.registrationOpensAt,
      registrationClosesAt: parsed.data.registrationClosesAt,
      feeMinorUnits: Math.round(parseFloat(parsed.data.feeAmount) * 100),
      currency: parsed.data.currency,
      matCount: parsed.data.matCount,
    });
    invalidatePublicTags(["events", `event:${event.slug}`]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/events");
  return {};
}

export async function createDivisionAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");

  const parsed = createDivisionSchema.safeParse({
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    discipline: formData.get("discipline"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the division details and try again." };
  }

  try {
    await createDivision(actor, parsed.data);
    invalidatePublicTags(["events", `divisions:${parsed.data.eventId}`]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${parsed.data.eventId}/divisions`);
  return {};
}

export async function seedRoadToSuperFightDivisionsAction(
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  if (!eventId) return { error: "Missing event." };
  try {
    const result = await seedRoadToSuperFightDivisions(actor, eventId);
    invalidatePublicTags(["events", `divisions:${eventId}`]);
    revalidatePath(`/admin/events/${eventId}/divisions`);
    if (result.createdCount === 0) return { error: "All Road to Super Fight divisions are already seeded." };
    return {};
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function updateEventStatusAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!EVENT_STATUSES.includes(status as EventStatus)) {
    return { error: "Invalid status." };
  }

  try {
    const event = await updateEventStatus(actor, eventId, status as EventStatus);
    invalidatePublicTags(["events", `event:${event.slug}`, "schedule"]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function updateEventMatCountAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const matCount = Number(formData.get("matCount"));
  if (!eventId || !Number.isInteger(matCount) || matCount < 1) {
    return { error: "Set at least one mat." };
  }
  try {
    await updateEventMatCount(actor, eventId, matCount);
    invalidatePublicTags(["schedule"]);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/matches`);
  return {};
}

export async function updateEventDetailsAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");
  const parsed = updateEventDetailsSchema.safeParse({
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    description: formData.get("description"),
    venue: formData.get("venue"),
    startDate: formData.get("startDate"),
    registrationOpensAt: formData.get("registrationOpensAt"),
    registrationClosesAt: formData.get("registrationClosesAt"),
    feeAmount: formData.get("feeAmount"),
    currency: formData.get("currency") || "INR",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the event details and try again." };
  }

  try {
    const event = await updateEventDetails(actor, parsed.data.eventId, {
      name: parsed.data.name,
      description: parsed.data.description,
      venue: parsed.data.venue,
      startDate: parsed.data.startDate,
      registrationOpensAt: parsed.data.registrationOpensAt,
      registrationClosesAt: parsed.data.registrationClosesAt,
      feeMinorUnits: Math.round(parseFloat(parsed.data.feeAmount) * 100),
      currency: parsed.data.currency,
    });
    invalidatePublicTags(["events", `event:${event.slug}`, "schedule"]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${parsed.data.eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/admin");
  return {};
}

export async function updateDivisionAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");
  const parsed = updateDivisionSchema.safeParse({
    divisionId: formData.get("divisionId"),
    eventId: formData.get("eventId"),
    name: formData.get("name"),
    discipline: formData.get("discipline"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the division details and try again." };
  }

  try {
    await updateDivision(actor, parsed.data.divisionId, {
      name: parsed.data.name,
      discipline: parsed.data.discipline,
      capacity: parsed.data.capacity,
    });
    invalidatePublicTags(["events", `divisions:${parsed.data.eventId}`]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${parsed.data.eventId}`);
  revalidatePath(`/admin/events/${parsed.data.eventId}/divisions`);
  return {};
}

export async function uploadEventPaymentQrAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const actor = await requireActor("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const file = formData.get("qr");
  if (!eventId) return { error: "Missing event." };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a QR image." };
  if (file.size > 1_500_000) return { error: "QR image must be under 1.5 MB." };

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const detected = detectImageType(bytes);
    if (!detected) return { error: "Use a JPG, PNG, or WebP image." };
    const ext = detected === "image/png" ? ".png" : detected === "image/webp" ? ".webp" : ".jpg";
    const event = await setEventPaymentQr(actor, eventId, bytes, ext, detected);
    invalidatePublicTags(["events", `event:${event.slug}`]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}`);
  return {};
}
