"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/auth/session";
import { createEvent, createDivision, updateEventStatus, updateEventMatCount } from "@/server/services/eventService";
import { EVENT_STATUSES, type EventStatus } from "@/server/models/Event";
import { toAppError } from "@/server/http/errors";
import { createEventSchema, createDivisionSchema } from "./schemas";

export type EventActionState = { error?: string };

export async function createEventAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const { user } = await requireRole("ADMIN");

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
    await createEvent(String(user._id), {
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
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/events");
  return {};
}

export async function createDivisionAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const { user } = await requireRole("ADMIN");

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
    await createDivision(String(user._id), parsed.data);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${parsed.data.eventId}/divisions`);
  return {};
}

export async function updateEventStatusAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const { user } = await requireRole("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!EVENT_STATUSES.includes(status as EventStatus)) {
    return { error: "Invalid status." };
  }

  try {
    await updateEventStatus(String(user._id), eventId, status as EventStatus);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function updateEventMatCountAction(_prevState: EventActionState, formData: FormData): Promise<EventActionState> {
  const { user } = await requireRole("ADMIN");
  const eventId = String(formData.get("eventId") ?? "");
  const matCount = Number(formData.get("matCount"));
  if (!eventId || !Number.isInteger(matCount) || matCount < 1) {
    return { error: "Set at least one mat." };
  }
  try {
    await updateEventMatCount(String(user._id), eventId, matCount);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/matches`);
  return {};
}
