"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/server/auth/session";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/services/notificationService";
import { listFailedOutboxJobs, retryFailedOutboxJob } from "@/server/services/outboxService";
import { toAppError } from "@/server/http/errors";

export type NotificationActionState = { error?: string };

export async function markNotificationReadAction(
  _prev: NotificationActionState,
  formData: FormData
): Promise<NotificationActionState> {
  const actor = await requireActor("FIGHTER");
  const id = String(formData.get("notificationId") ?? "");
  try {
    await markNotificationRead(actor, id);
    revalidatePath("/fighter/notifications");
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return {};
}

export async function markAllNotificationsReadAction() {
  const actor = await requireActor("FIGHTER");
  await markAllNotificationsRead(actor);
  revalidatePath("/fighter/notifications");
}

export async function retryOutboxJobAction(
  _prev: NotificationActionState,
  formData: FormData
): Promise<NotificationActionState> {
  const actor = await requireActor("ADMIN");
  const jobId = String(formData.get("jobId") ?? "");
  try {
    await retryFailedOutboxJob(actor, jobId);
    revalidatePath("/admin/notifications");
  } catch (err) {
    return { error: toAppError(err).message };
  }
  return {};
}

export { listMyNotifications, listFailedOutboxJobs };
