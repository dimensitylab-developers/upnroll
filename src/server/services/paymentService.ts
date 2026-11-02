import { randomBytes } from "node:crypto";
import { connectDB } from "@/server/db/connect";
import { Registration, type RegistrationDoc } from "@/server/models/Registration";
import { Event } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { PaymentSubmission, type PaymentSubmissionDoc } from "@/server/models/PaymentSubmission";
import { User } from "@/server/models/User";
import { getStorageAdapter } from "@/server/storage/local-disk";
import { getEmailAdapter } from "@/server/email/console";
import { writeAuditLog } from "@/server/audit/log";
import { validateScreenshotMeta } from "@/features/payments/file-validation";
import {
  canSubmitPayment,
  canDecidePayment,
  registrationStatusForPaymentDecision,
  registrationStatusForNewSubmission,
} from "./registrationStateMachine";
import { flagDuplicateUtrs } from "./paymentQueue";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export async function submitPayment(
  userId: string,
  registrationId: string,
  utr: string,
  file: { buffer: Buffer; size: number; type: string }
) {
  await connectDB();

  const registration = await Registration.findById(registrationId);
  if (!registration || String(registration.userId) !== userId) {
    throw new NotFoundError("Registration not found.");
  }
  if (!canSubmitPayment(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("A payment cannot be submitted for this registration in its current state.");
  }

  const fileCheck = validateScreenshotMeta(file);
  if (!fileCheck.valid) throw new ValidationError(fileCheck.message);

  const [event, division, user] = await Promise.all([
    Event.findById(registration.eventId),
    Division.findById(registration.divisionId),
    User.findById(userId),
  ]);
  if (!event || !division || !user) throw new NotFoundError("Associated event, division, or user not found.");

  const expectedAmountMinorUnits = division.feeMinorUnitsOverride ?? event.paymentInstructions!.feeMinorUnits;

  const ext = EXT_BY_TYPE[file.type] ?? "";
  const key = `payment-screenshots/${registrationId}/${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  await getStorageAdapter().put(key, file.buffer, file.type);

  const submission = await PaymentSubmission.create({
    registrationId: registration._id,
    userId,
    eventId: event._id,
    expectedAmountMinorUnits,
    submittedUtr: utr,
    screenshotStorageKey: key,
    submittedAt: new Date(),
    status: "PENDING_REVIEW",
  });

  const newRegStatus = registrationStatusForNewSubmission();
  registration.status = newRegStatus;
  registration.statusHistory.push({ status: newRegStatus, at: new Date() });
  await registration.save();

  await getEmailAdapter().send({
    to: user.email,
    subject: "Payment submission received",
    body: `We received your payment submission (reference ${utr}) for ${event.name}. An organizer will review it manually — this is not yet confirmation of payment.`,
  });

  await writeAuditLog({
    actorId: userId,
    action: "PAYMENT_SUBMITTED",
    targetType: "PaymentSubmission",
    targetId: String(submission._id),
    after: { status: submission.status, utr },
  });

  return submission;
}

async function decidePayment(
  adminId: string,
  paymentId: string,
  decision: "APPROVED" | "REJECTED",
  note: string
) {
  await connectDB();

  const submission = await PaymentSubmission.findById(paymentId);
  if (!submission) throw new NotFoundError("Payment submission not found.");
  if (!canDecidePayment(submission.status as PaymentSubmissionDoc["status"])) {
    throw new ConflictError("This payment submission has already been reviewed.");
  }

  const beforeStatus = submission.status;

  // Atomic conditional update: if another admin decided it between the read
  // above and here, this update matches zero documents and we report a
  // conflict instead of silently double-applying the decision.
  const updated = await PaymentSubmission.findOneAndUpdate(
    { _id: paymentId, status: "PENDING_REVIEW" },
    { status: decision, reviewerId: adminId, reviewedAt: new Date(), reviewNote: note },
    { returnDocument: "after" }
  );
  if (!updated) throw new ConflictError("This payment submission has already been reviewed.");

  const registration = await Registration.findById(updated.registrationId);
  if (registration) {
    const newStatus = registrationStatusForPaymentDecision(decision);
    registration.status = newStatus;
    registration.statusHistory.push({ status: newStatus, at: new Date() });
    await registration.save();
  }

  const user = await User.findById(updated.userId);
  if (user) {
    await getEmailAdapter().send({
      to: user.email,
      subject: decision === "APPROVED" ? "Payment approved — registration confirmed" : "Payment rejected",
      body:
        decision === "APPROVED"
          ? "Your payment has been reviewed and approved. Your registration is now confirmed."
          : `Your payment submission was rejected. Reason: ${note || "No reason provided."} You may resubmit from your dashboard.`,
    });
  }

  await writeAuditLog({
    actorId: adminId,
    action: decision === "APPROVED" ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED",
    targetType: "PaymentSubmission",
    targetId: String(updated._id),
    before: { status: beforeStatus },
    after: { status: updated.status, note },
  });

  return updated;
}

export async function approvePayment(adminId: string, paymentId: string, note = "") {
  return decidePayment(adminId, paymentId, "APPROVED", note);
}

export async function rejectPayment(adminId: string, paymentId: string, note: string) {
  if (!note.trim()) throw new ValidationError("A rejection reason is required.");
  return decidePayment(adminId, paymentId, "REJECTED", note);
}

export async function listPaymentQueue(filterStatus?: PaymentSubmissionDoc["status"]) {
  await connectDB();

  const all = await PaymentSubmission.find().sort({ createdAt: -1 }).lean();
  const userIds = [...new Set(all.map((s) => String(s.userId)))];
  const eventIds = [...new Set(all.map((s) => String(s.eventId)))];
  const [users, events] = await Promise.all([
    User.find({ _id: { $in: userIds } }).lean(),
    Event.find({ _id: { $in: eventIds } }).lean(),
  ]);
  const userById = new Map(users.map((u) => [String(u._id), u]));
  const eventById = new Map(events.map((e) => [String(e._id), e]));

  const withDuplicates = flagDuplicateUtrs(
    all.map((s) => ({ ...s, id: String(s._id), submittedUtr: s.submittedUtr ?? null }))
  );

  const enriched = withDuplicates.map((s) => ({
    ...s,
    user: userById.get(String(s.userId)) ?? null,
    event: eventById.get(String(s.eventId)) ?? null,
  }));

  return filterStatus ? enriched.filter((s) => s.status === filterStatus) : enriched;
}

/** Caller (the Route Handler) is responsible for requireRole(ADMIN) before calling this. */
export async function getPaymentScreenshot(paymentId: string) {
  await connectDB();
  const submission = await PaymentSubmission.findById(paymentId).lean();
  if (!submission || !submission.screenshotStorageKey) {
    throw new NotFoundError("No screenshot available for this payment submission.");
  }
  return getStorageAdapter().get(submission.screenshotStorageKey);
}
