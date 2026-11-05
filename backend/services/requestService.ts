import { connectDB } from "@/server/db/connect";
import { Registration, type RegistrationDoc } from "@/server/models/Registration";
import { Division } from "@/server/models/Division";
import { RegistrationRequest } from "@/server/models/RegistrationRequest";
import { User } from "@/server/models/User";
import { getEmailAdapter } from "@/server/email/console";
import { writeAuditLog } from "@/server/audit/log";
import { isActiveRegistration, ACTIVE_REGISTRATION_STATUSES } from "./registrationStateMachine";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";

export async function createRequest(
  userId: string,
  registrationId: string,
  type: "CANCELLATION" | "TRANSFER",
  input: { requestedDivisionId?: string; reason: string }
) {
  await connectDB();

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
    const activeCount = await Registration.countDocuments({
      divisionId: targetDivision._id,
      status: { $in: ACTIVE_REGISTRATION_STATUSES },
    });
    if (activeCount >= targetDivision.capacity) throw new ConflictError("The target division is at capacity.");
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

export async function decideRequest(adminId: string, requestId: string, decision: "APPROVED" | "REJECTED", note: string) {
  await connectDB();

  const updated = await RegistrationRequest.findOneAndUpdate(
    { _id: requestId, status: "PENDING" },
    { status: decision, reviewerId: adminId, reviewNote: note, reviewedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!updated) throw new ConflictError("This request has already been reviewed.");

  if (decision === "APPROVED") {
    const registration = await Registration.findById(updated.registrationId);
    if (registration) {
      try {
        if (updated.type === "CANCELLATION") {
          registration.status = "CANCELLED";
          registration.statusHistory.push({ status: "CANCELLED", at: new Date() });
          await registration.save();
        } else if (updated.type === "TRANSFER" && updated.requestedDivisionId) {
          const targetDivision = await Division.findById(updated.requestedDivisionId);
          if (!targetDivision) throw new NotFoundError("The target division no longer exists.");

          // Re-validate capacity immediately before applying the transfer — the
          // createRequest check above is only an early UX signal; this is the
          // authoritative check and closes the TOCTOU window between request
          // creation and admin approval (M-4). The window left after this check
          // is a single DB round-trip, and a concurrent approval that fills the
          // division first is caught here because the count reflects its change.
          const activeCount = await Registration.countDocuments({
            divisionId: updated.requestedDivisionId,
            status: { $in: ACTIVE_REGISTRATION_STATUSES },
            _id: { $ne: registration._id },
          });
          if (activeCount >= targetDivision.capacity) {
            throw new ConflictError("The target division filled up before this transfer could be approved.");
          }

          registration.divisionId = updated.requestedDivisionId;
          await registration.save();
        }
      } catch (err) {
        // Leave no inconsistent state: don't let the request sit as "APPROVED"
        // when its effect couldn't actually be applied. Revert to PENDING so
        // the admin can retry (if capacity frees up) or reject it instead.
        await RegistrationRequest.updateOne(
          { _id: updated._id },
          { status: "PENDING", reviewerId: null, reviewNote: "", reviewedAt: null }
        );
        await writeAuditLog({
          actorId: adminId,
          action: "REGISTRATION_REQUEST_APPROVAL_FAILED",
          targetType: "RegistrationRequest",
          targetId: requestId,
          after: { reason: err instanceof Error ? err.message : "Unknown error" },
        });
        throw err;
      }
    }
  }

  const user = await User.findById(updated.userId);
  if (user) {
    await getEmailAdapter().send({
      to: user.email,
      subject: `${updated.type === "CANCELLATION" ? "Cancellation" : "Transfer"} request ${decision === "APPROVED" ? "approved" : "rejected"}`,
      body: decision === "APPROVED"
        ? `Your ${updated.type.toLowerCase()} request has been approved.${note ? ` Note: ${note}` : ""}`
        : `Your ${updated.type.toLowerCase()} request was rejected. Reason: ${note || "No reason provided."}`,
    });
  }

  await writeAuditLog({
    actorId: adminId,
    action: "REGISTRATION_REQUEST_DECIDED",
    targetType: "RegistrationRequest",
    targetId: requestId,
    after: { status: decision, note },
  });

  return updated;
}

export async function listRequestsForFighter(userId: string) {
  await connectDB();
  return RegistrationRequest.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function listRequestsForAdmin() {
  await connectDB();
  const requests = await RegistrationRequest.find().sort({ createdAt: -1 }).lean();
  const userIds = [...new Set(requests.map((r) => String(r.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const emailByUserId = new Map(users.map((u) => [String(u._id), u.email]));
  return requests.map((r) => ({ ...r, userEmail: emailByUserId.get(String(r.userId)) ?? "Unknown" }));
}
