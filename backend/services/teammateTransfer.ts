import { randomBytes } from "node:crypto";
import { connectDB } from "@/server/db/connect";
import { TransferInvite } from "@/server/models/TransferInvite";
import { Registration, type RegistrationDoc } from "@/server/models/Registration";
import { writeAuditLog } from "@/server/audit/log";
import { isActiveRegistration, ACTIVE_REGISTRATION_STATUSES } from "./registrationStateMachine";
import { ConflictError, NotFoundError, ValidationError } from "@/server/http/errors";

export async function createTeammateTransfer(userId: string, registrationId: string) {
  await connectDB();
  const registration = await Registration.findOne({ _id: registrationId, userId });
  if (!registration) throw new NotFoundError("Registration not found.");
  if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("This registration cannot be passed to a teammate.");
  }

  const existing = await TransferInvite.findOne({ registrationId, claimedAt: null });
  if (existing) return existing;

  const invite = await TransferInvite.create({
    token: randomBytes(18).toString("hex"),
    registrationId,
    fromUserId: userId,
  });
  await writeAuditLog({
    actorId: userId,
    action: "TEAMMATE_TRANSFER_CREATED",
    targetType: "TransferInvite",
    targetId: String(invite._id),
  });
  return invite;
}

export async function claimTeammateTransfer(userId: string, token: string) {
  await connectDB();
  const invite = await TransferInvite.findOne({ token });
  if (!invite) throw new NotFoundError("This transfer link is not valid.");
  if (invite.claimedAt) throw new ConflictError("This spot has already been taken.");
  if (String(invite.fromUserId) === userId) throw new ValidationError("You already hold this spot.");

  const registration = await Registration.findById(invite.registrationId);
  if (!registration || String(registration.userId) !== String(invite.fromUserId)) {
    throw new ConflictError("This registration is no longer available to transfer.");
  }
  if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("This registration is closed.");
  }

  const alreadyIn = await Registration.findOne({
    userId,
    divisionId: registration.divisionId,
    status: { $in: ACTIVE_REGISTRATION_STATUSES },
  }).lean();
  if (alreadyIn) throw new ConflictError("You already have a spot in this division.");

  registration.userId = userId as unknown as RegistrationDoc["userId"];
  await registration.save();
  invite.claimedByUserId = userId as unknown as typeof invite.claimedByUserId;
  invite.claimedAt = new Date();
  await invite.save();

  await writeAuditLog({
    actorId: userId,
    action: "TEAMMATE_TRANSFER_CLAIMED",
    targetType: "Registration",
    targetId: String(registration._id),
    before: { userId: String(invite.fromUserId) },
    after: { userId },
  });
  return registration;
}
