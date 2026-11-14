import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { assertFighter, type Actor } from "@/server/auth/actor";
import { connectDB } from "@/server/db/connect";
import { TransferInvite } from "@/server/models/TransferInvite";
import { Registration, type RegistrationDoc } from "@/server/models/Registration";
import { PaymentSubmission } from "@/server/models/PaymentSubmission";
import { Division } from "@/server/models/Division";
import { Event } from "@/server/models/Event";
import { FighterProfile } from "@/server/models/FighterProfile";
import { writeAuditLog } from "@/server/audit/log";
import { isActiveRegistration, ACTIVE_REGISTRATION_STATUSES } from "./registrationStateMachine";
import { assertDivisionEligibility } from "./registrationEligibility";
import { ConflictError, NotFoundError, ValidationError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";
import { bindSession, sessionOpts, withTransaction } from "@/server/db/transaction";

function hashTransferToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

function normalizeToken(rawToken: string): string {
  const token = rawToken.trim();
  if (!token || token.length < 16 || token.length > 128) {
    throw new ValidationError("This transfer link is not valid.");
  }
  return token;
}

export async function createTeammateTransfer(actor: Actor, registrationId: string) {
  assertFighter(actor);
  requireObjectId(registrationId, "registration");
  await connectDB();

  const registration = await Registration.findOne({ _id: registrationId, userId: actor.userId });
  if (!registration) throw new NotFoundError("Registration not found.");
  if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("This registration cannot be passed to a teammate.");
  }

  const rawToken = randomBytes(18).toString("hex");
  const tokenHash = hashTransferToken(rawToken);

  const existing = await TransferInvite.findOne({ registrationId, claimedAt: null });
  if (existing) {
    // Rotate so a previous link stops working and we can show a fresh raw token.
    existing.tokenHash = tokenHash;
    await existing.save();
    await writeAuditLog({
      actorId: actor.userId,
      action: "TEAMMATE_TRANSFER_ROTATED",
      targetType: "TransferInvite",
      targetId: String(existing._id),
    });
    return { inviteId: String(existing._id), rawToken };
  }

  const invite = await TransferInvite.create({
    tokenHash,
    registrationId,
    fromUserId: actor.userId,
  });
  await writeAuditLog({
    actorId: actor.userId,
    action: "TEAMMATE_TRANSFER_CREATED",
    targetType: "TransferInvite",
    targetId: String(invite._id),
  });
  return { inviteId: String(invite._id), rawToken };
}

/** Public seat preview for the claim form — no owner PII. */
export async function peekTeammateTransfer(rawToken: string) {
  const token = normalizeToken(rawToken);
  await connectDB();

  const invite = await TransferInvite.findOne({ tokenHash: hashTransferToken(token) }).lean();
  if (!invite) throw new NotFoundError("This transfer link is not valid.");
  if (invite.claimedAt) throw new ConflictError("This spot has already been taken.");

  const registration = await Registration.findById(invite.registrationId).lean();
  if (!registration || String(registration.userId) !== String(invite.fromUserId)) {
    throw new ConflictError("This registration is no longer available to transfer.");
  }
  if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("This registration is closed.");
  }

  const [event, division] = await Promise.all([
    Event.findById(registration.eventId).select("name").lean(),
    Division.findById(registration.divisionId).select("name gender experienceLevel").lean(),
  ]);

  return {
    registrationId: String(registration._id),
    status: registration.status as string,
    eventName: event?.name ?? "Event",
    divisionName: division?.name ?? "Division",
    gender: division?.gender === "MALE" || division?.gender === "FEMALE" ? division.gender : "",
    experienceLevel:
      division?.experienceLevel === "BEGINNER" || division?.experienceLevel === "INTERMEDIATE"
        ? division.experienceLevel
        : "",
  };
}

export async function claimTeammateTransfer(actor: Actor, rawToken: string) {
  assertFighter(actor);
  const token = normalizeToken(rawToken);
  await connectDB();

  return withTransaction(async (session) => {
    const invite = await bindSession(
      TransferInvite.findOne({ tokenHash: hashTransferToken(token) }),
      session
    );
    if (!invite) throw new NotFoundError("This transfer link is not valid.");
    if (invite.claimedAt) throw new ConflictError("This spot has already been taken.");
    if (String(invite.fromUserId) === actor.userId) throw new ValidationError("You already hold this spot.");

    const registration = await bindSession(Registration.findById(invite.registrationId), session);
    if (!registration || String(registration.userId) !== String(invite.fromUserId)) {
      throw new ConflictError("This registration is no longer available to transfer.");
    }
    if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
      throw new ConflictError("This registration is closed.");
    }

    const alreadyIn = await bindSession(
      Registration.findOne({
        userId: actor.userId,
        divisionId: registration.divisionId,
        status: { $in: ACTIVE_REGISTRATION_STATUSES },
      }),
      session
    ).lean();
    if (alreadyIn) throw new ConflictError("You already have a spot in this division.");

    const division = await bindSession(Division.findById(registration.divisionId), session).lean();
    if (!division) throw new NotFoundError("Division not found.");

    const profile = await bindSession(FighterProfile.findOne({ userId: actor.userId }), session).lean();
    assertDivisionEligibility(
      { gender: division.gender ?? "", experienceLevel: division.experienceLevel ?? "" },
      profile ? { gender: profile.gender ?? "", beltRank: profile.beltRank ?? "" } : null
    );

    if (!profile?.aadhaarImageKey?.trim()) {
      throw new ValidationError("Add an identity proof image before taking this spot.");
    }
    if (!profile.waiverAcceptedAt) {
      throw new ValidationError("Agree to the terms before taking this spot.");
    }

    const claimed = await TransferInvite.findOneAndUpdate(
      { _id: invite._id, claimedAt: null },
      { claimedByUserId: actor.userId, claimedAt: new Date() },
      { returnDocument: "after", ...sessionOpts(session) }
    );
    if (!claimed) throw new ConflictError("This spot has already been taken.");

    const previousOwner = String(invite.fromUserId);
    registration.userId = actor.userId as unknown as RegistrationDoc["userId"];
    await registration.save(sessionOpts(session));

    // Keep payment rows aligned with the registration owner after a transfer.
    await PaymentSubmission.updateMany(
      { registrationId: registration._id, userId: invite.fromUserId },
      { $set: { userId: actor.userId } },
      sessionOpts(session)
    );

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "TEAMMATE_TRANSFER_CLAIMED",
        targetType: "Registration",
        targetId: String(registration._id),
        before: { userId: previousOwner },
        after: { userId: actor.userId },
      },
      session
    );
    return registration;
  });
}
