import "server-only";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, assertFighter, type Actor } from "@/server/auth/actor";
import { Registration, type RegistrationDoc } from "@/server/models/Registration";
import { Division } from "@/server/models/Division";
import { Event } from "@/server/models/Event";
import { RegistrationRequest } from "@/server/models/RegistrationRequest";
import { User } from "@/server/models/User";
import { getEmailAdapter } from "@/server/email/console";
import { writeAuditLog } from "@/server/audit/log";
import { isActiveRegistration } from "./registrationStateMachine";
import { claimSeat, releaseSeat } from "./divisionOccupancy";
import { bindSession, sessionOpts, withTransaction } from "@/server/db/transaction";
import { refundPercentForCancellation } from "./tournamentRules";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";

export async function createRequest(
  actor: Actor,
  registrationId: string,
  type: "CANCELLATION" | "TRANSFER",
  input: { requestedDivisionId?: string; reason: string }
) {
  assertFighter(actor);
  await connectDB();
  const userId = actor.userId;

  if (!input.reason.trim()) throw new ValidationError("A reason is required.");

  const registration = await Registration.findOne({ _id: registrationId, userId });
  if (!registration) throw new NotFoundError("Registration not found.");
  if (!isActiveRegistration(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("This registration is not in a state that allows a request.");
  }

  const existingPending = await RegistrationRequest.findOne({ registrationId, status: "PENDING" }).lean();
  if (existingPending) throw new ConflictError("A request for this registration is already pending review.");

  let requestedDivisionId: string | undefined;
  if (type === "TRANSFER") {
    if (!input.requestedDivisionId) throw new ValidationError("Select a division to transfer into.");
    const targetDivision = await Division.findById(input.requestedDivisionId);
    if (!targetDivision || String(targetDivision.eventId) !== String(registration.eventId)) {
      throw new ValidationError("The target division must belong to the same event.");
    }
    if (String(targetDivision._id) === String(registration.divisionId)) {
      throw new ValidationError("You're already registered in this division.");
    }
    if (typeof targetDivision.filledCount !== "number") {
      throw new ValidationError("This division has no occupancy counter. Run the division occupancy backfill before changing registrations.");
    }
    if (targetDivision.filledCount >= targetDivision.capacity) throw new ConflictError("The target division is at capacity.");
    requestedDivisionId = String(targetDivision._id);
  }

  const request = await RegistrationRequest.create({
    type,
    registrationId,
    userId,
    requestedDivisionId: requestedDivisionId ?? null,
    reason: input.reason,
    status: "PENDING",
  });

  await writeAuditLog({ actorId: userId, action: "REGISTRATION_REQUEST_CREATED", targetType: "RegistrationRequest", targetId: String(request._id) });
  return request;
}

export async function decideRequest(actor: Actor, requestId: string, decision: "APPROVED" | "REJECTED", note: string) {
  assertAdmin(actor);
  await connectDB();
  const adminId = actor.userId;

  let updated;
  try {
    updated = await withTransaction(async (session) => {
      const decided = await RegistrationRequest.findOneAndUpdate(
        { _id: requestId, status: "PENDING" },
        { status: decision, reviewerId: adminId, reviewNote: note, reviewedAt: new Date() },
        { returnDocument: "after", ...sessionOpts(session) }
      );
      if (!decided) throw new ConflictError("This request has already been reviewed.");

      if (decision === "APPROVED") {
        const registration = await bindSession(Registration.findById(decided.registrationId), session);
        if (registration) {
          if (decided.type === "CANCELLATION") {
            if (isActiveRegistration(registration.status as RegistrationDoc["status"])) {
              await releaseSeat(registration.divisionId, session);
            }
            const event = await bindSession(Event.findById(registration.eventId), session).lean();
            const decidedAt = new Date();
            decided.refundPercent = event ? refundPercentForCancellation(event.startDate, decidedAt) : 0;
            await decided.save(sessionOpts(session));
            registration.status = "CANCELLED";
            registration.statusHistory.push({ status: "CANCELLED", at: decidedAt });
            await registration.save(sessionOpts(session));
          } else if (decided.type === "TRANSFER" && decided.requestedDivisionId) {
            const targetDivision = await bindSession(Division.findById(decided.requestedDivisionId), session);
            if (!targetDivision) throw new NotFoundError("The target division no longer exists.");
            await claimSeat(targetDivision._id, session);
            if (isActiveRegistration(registration.status as RegistrationDoc["status"])) {
              await releaseSeat(registration.divisionId, session);
            }
            registration.divisionId = decided.requestedDivisionId;
            await registration.save(sessionOpts(session));
          }
        }
      }

      await writeAuditLog(
        {
          actorId: adminId,
          action: "REGISTRATION_REQUEST_DECIDED",
          targetType: "RegistrationRequest",
          targetId: requestId,
          after: { status: decision, note },
        },
        session
      );
      return decided;
    });
  } catch (err) {
    if (!(err instanceof ConflictError && err.message === "This request has already been reviewed.")) {
      await writeAuditLog({
        actorId: adminId,
        action: "REGISTRATION_REQUEST_APPROVAL_FAILED",
        targetType: "RegistrationRequest",
        targetId: requestId,
        after: { reason: err instanceof Error ? err.message : "Unknown error" },
      });
    }
    throw err;
  }

  const user = await User.findById(updated.userId);
  if (user) {
    await getEmailAdapter().send({
      to: user.email,
      subject: `${updated.type === "CANCELLATION" ? "Cancellation" : "Transfer"} request ${decision === "APPROVED" ? "approved" : "rejected"}`,
      body: decision === "APPROVED"
        ? `Your ${updated.type.toLowerCase()} request has been approved.${updated.type === "CANCELLATION" ? ` Refund: ${updated.refundPercent ?? 0}%.` : ""}${note ? ` Note: ${note}` : ""}`
        : `Your ${updated.type.toLowerCase()} request was rejected. Reason: ${note || "No reason provided."}`,
    });
  }

  return updated;
}

export async function listRequestsForFighter(actor: Actor) {
  assertFighter(actor);
  await connectDB();
  return RegistrationRequest.find({ userId: actor.userId }).sort({ createdAt: -1 }).lean();
}

export async function listRequestsForAdmin(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  const requests = await RegistrationRequest.find().sort({ createdAt: -1 }).lean();
  const userIds = [...new Set(requests.map((r) => String(r.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select("email").lean();
  const emailByUserId = new Map(users.map((u) => [String(u._id), u.email]));
  return requests.map((r) => ({ ...r, userEmail: emailByUserId.get(String(r.userId)) ?? "Unknown" }));
}
