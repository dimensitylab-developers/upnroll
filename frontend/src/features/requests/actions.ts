"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/server/auth/session";
import { createRequest, decideRequest } from "@/server/services/requestService";
import { claimTeammateTransfer, createTeammateTransfer } from "@/server/services/teammateTransfer";
import { toAppError } from "@/server/http/errors";
import { createRequestSchema } from "./schemas";

export type RequestActionState = { error?: string; success?: boolean; link?: string };

export async function createRequestAction(_prevState: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const { user } = await requireSession();

  const parsed = createRequestSchema.safeParse({
    registrationId: formData.get("registrationId"),
    type: formData.get("type"),
    requestedDivisionId: formData.get("requestedDivisionId") || undefined,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the request details and try again." };
  }

  try {
    await createRequest(String(user._id), parsed.data.registrationId, parsed.data.type, {
      requestedDivisionId: parsed.data.requestedDivisionId,
      reason: parsed.data.reason,
    });
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/fighter/requests");
  return { success: true };
}

export async function decideRequestAction(_prevState: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const { user } = await requireRole("ADMIN");
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "") as "APPROVED" | "REJECTED";
  const note = String(formData.get("note") ?? "");

  try {
    await decideRequest(String(user._id), requestId, decision, note);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/requests");
  return {};
}

export async function createTeammateTransferAction(
  _prevState: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const { user } = await requireSession();
  const registrationId = String(formData.get("registrationId") ?? "");
  try {
    const invite = await createTeammateTransfer(String(user._id), registrationId);
    return { link: `/fighter/transfer/${invite.token}` };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function claimTeammateTransferAction(
  _prevState: RequestActionState,
  formData: FormData
): Promise<RequestActionState> {
  const { user } = await requireSession();
  const token = String(formData.get("token") ?? "");
  try {
    await claimTeammateTransfer(String(user._id), token);
  } catch (err) {
    return { error: toAppError(err).message };
  }
  revalidatePath("/fighter/dashboard");
  revalidatePath("/fighter/registrations");
  return { success: true };
}
