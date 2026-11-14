"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor } from "@/server/auth/session";
import { createRequest, decideRequest } from "@/server/services/requestService";
import { claimTeammateTransfer, createTeammateTransfer } from "@/server/services/teammateTransfer";
import { updateFighterProfile } from "@/server/services/fighterService";
import { FighterProfile } from "@/server/models/FighterProfile";
import { toAppError } from "@/server/http/errors";
import { createRequestSchema } from "./schemas";
import {
  grapplerDetailsSchema,
  grapplerFieldIssues,
  grapplerFromForm,
  isMinorAge,
  toProfileFields,
} from "@/features/fighters/grappler-schema";
import {
  readAadhaarImage,
  readParentalConsentImage,
  saveAadhaarImage,
  saveParentalConsentImage,
} from "@/server/services/profilePhoto";

export type RequestActionState = { error?: string; success?: boolean; link?: string };

export type ClaimTransferActionState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  redirectTo?: string;
  success?: boolean;
};

export async function createRequestAction(_prevState: RequestActionState, formData: FormData): Promise<RequestActionState> {
  const actor = await requireActor("FIGHTER");

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
    await createRequest(actor, parsed.data.registrationId, parsed.data.type, {
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
  const actor = await requireActor("ADMIN");
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "") as "APPROVED" | "REJECTED";
  const note = String(formData.get("note") ?? "");

  try {
    await decideRequest(actor, requestId, decision, note);
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
  const actor = await requireActor("FIGHTER");
  const registrationId = String(formData.get("registrationId") ?? "");
  try {
    const invite = await createTeammateTransfer(actor, registrationId);
    return { link: `/fighter/transfer/${invite.rawToken}` };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}

export async function claimTeammateTransferAction(
  _prevState: ClaimTransferActionState,
  formData: FormData
): Promise<ClaimTransferActionState> {
  const actor = await requireActor("FIGHTER");
  const token = String(formData.get("token") ?? "");
  const consent = String(formData.get("consent") ?? "") === "yes";
  const agreement = String(formData.get("agreement") ?? "") === "yes";
  if (!consent || !agreement) {
    return { error: "Tick both the consent and the agreement before you continue." };
  }

  const grapplerParsed = grapplerDetailsSchema.safeParse(grapplerFromForm(formData));
  if (!grapplerParsed.success) {
    return { fieldErrors: grapplerParsed.error.flatten().fieldErrors };
  }
  const minor = isMinorAge(grapplerParsed.data.age);
  const issues = grapplerFieldIssues(
    { ...grapplerParsed.data, parentalConsent: String(formData.get("parentalConsent") ?? "") },
    { requireParentalConsent: minor }
  );
  if (Object.keys(issues).length > 0) return { fieldErrors: issues };

  const aadhaar = await readAadhaarImage(formData.get("aadhaarImage"));
  if ("error" in aadhaar) return { error: aadhaar.error };

  const parentalConsent = await readParentalConsentImage(formData.get("parentalConsentImage"));
  if ("error" in parentalConsent) return { error: parentalConsent.error };

  try {
    const existing = await FighterProfile.findOne({ userId: actor.userId })
      .select("aadhaarImageKey parentalConsentImageKey")
      .lean();
    if ("empty" in aadhaar && !existing?.aadhaarImageKey) {
      return {
        error: "Add an identity proof image.",
        fieldErrors: { aadhaarImage: ["Add an identity proof image."] },
      };
    }
    if (minor && "empty" in parentalConsent && !existing?.parentalConsentImageKey) {
      return {
        error: "Upload a signed parental consent form.",
        fieldErrors: { parentalConsentImage: ["Upload a signed parental consent form."] },
      };
    }

    const aadhaarImageKey =
      "bytes" in aadhaar
        ? await saveAadhaarImage(actor, aadhaar.bytes, aadhaar.ext, existing?.aadhaarImageKey ?? "")
        : undefined;
    const parentalConsentImageKey =
      "bytes" in parentalConsent
        ? await saveParentalConsentImage(
            actor,
            parentalConsent.bytes,
            parentalConsent.ext,
            existing?.parentalConsentImageKey ?? ""
          )
        : undefined;

    await updateFighterProfile(actor, {
      ...toProfileFields(grapplerParsed.data),
      aadhaarImageKey,
      parentalConsentImageKey,
      waiverAcceptedAt: new Date(),
    });

    const registration = await claimTeammateTransfer(actor, token);
    invalidatePublicTags(["schedule", "rankings", "fighters"]);
    revalidatePath("/fighter/dashboard");
    revalidatePath("/fighter/registrations");

    const registrationId = String(registration._id);
    if (registration.status === "AWAITING_PAYMENT" || registration.status === "PENDING_VERIFICATION") {
      return { redirectTo: `/fighter/registrations/${registrationId}/payment` };
    }
    return { redirectTo: "/fighter/dashboard", success: true };
  } catch (err) {
    return { error: toAppError(err).message };
  }
}
