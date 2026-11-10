import "server-only";
import { randomBytes } from "node:crypto";
import { assertAdmin, assertFighter, type Actor } from "@/server/auth/actor";
import { connectDB } from "@/server/db/connect";
import { Registration, type RegistrationDoc } from "@/server/models/Registration";
import { Event } from "@/server/models/Event";
import { Division } from "@/server/models/Division";
import { PaymentSubmission, type PaymentSubmissionDoc } from "@/server/models/PaymentSubmission";
import { User } from "@/server/models/User";
import { FighterProfile } from "@/server/models/FighterProfile";
import { getStorageAdapter } from "@/server/storage/factory";
import { getEmailAdapter } from "@/server/email/console";
import { greetingLine } from "@/server/email/greeting";
import { writeAuditLog } from "@/server/audit/log";
import { validateScreenshotMeta } from "@/features/payments/file-validation";
import {
  canSubmitPayment,
  canDecidePayment,
  isActiveRegistration,
  registrationStatusForPaymentDecision,
  registrationStatusForNewSubmission,
} from "./registrationStateMachine";
import { claimSeat, releaseSeat } from "./divisionOccupancy";
import { bindSession, sessionOpts, withTransaction } from "@/server/db/transaction";
import { flagDuplicateUtrs } from "./paymentQueue";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export async function submitPayment(
  actor: Actor,
  registrationId: string,
  utr: string,
  file: { buffer: Buffer; size: number; type: string }
) {
  assertFighter(actor);
  requireObjectId(registrationId, "registration");
  await connectDB();

  const registration = await Registration.findById(registrationId);
  if (!registration || String(registration.userId) !== actor.userId) {
    throw new NotFoundError("Registration not found.");
  }
  if (!canSubmitPayment(registration.status as RegistrationDoc["status"])) {
    throw new ConflictError("A payment cannot be submitted for this registration in its current state.");
  }

  const fileCheck = validateScreenshotMeta(file);
  if (!fileCheck.valid) throw new ValidationError(fileCheck.message);
  const contentType = fileCheck.contentType;

  const [event, division, user] = await Promise.all([
    Event.findById(registration.eventId),
    Division.findById(registration.divisionId),
    User.findById(actor.userId).select("email"),
  ]);
  if (!event || !division || !user) throw new NotFoundError("Associated event, division, or user not found.");

  const expectedAmountMinorUnits = division.feeMinorUnitsOverride ?? event.paymentInstructions!.feeMinorUnits;

  const ext = EXT_BY_TYPE[contentType] ?? "";
  const key = `payment-screenshots/${registrationId}/${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  await getStorageAdapter().put(key, file.buffer, contentType, {
    metadata: {
      purpose: "payment-screenshot",
      ownerUserId: actor.userId,
      registrationId,
    },
  });

  let submission;
  try {
    submission = await withTransaction(async (session) => {
      const current = await bindSession(Registration.findById(registrationId), session);
      if (!current || String(current.userId) !== actor.userId) throw new NotFoundError("Registration not found.");
      if (!canSubmitPayment(current.status as RegistrationDoc["status"])) {
        throw new ConflictError("A payment cannot be submitted for this registration in its current state.");
      }
      const wasActive = isActiveRegistration(current.status as RegistrationDoc["status"]);
      const [created] = await PaymentSubmission.create(
        [
          {
            registrationId: current._id,
            userId: actor.userId,
            eventId: event._id,
            expectedAmountMinorUnits,
            submittedUtr: utr,
            screenshotStorageKey: key,
            submittedAt: new Date(),
            status: "PENDING_REVIEW",
          },
        ],
        { session }
      );
      const newRegStatus = registrationStatusForNewSubmission();
      if (!wasActive) await claimSeat(current.divisionId, session);
      current.status = newRegStatus;
      current.statusHistory.push({ status: newRegStatus, at: new Date() });
      await current.save(sessionOpts(session));
      await writeAuditLog(
        {
          actorId: actor.userId,
          action: "PAYMENT_SUBMITTED",
          targetType: "PaymentSubmission",
          targetId: String(created._id),
          after: { status: created.status, utr },
        },
        session
      );
      return created;
    });
  } catch (err) {
    await getStorageAdapter().delete(key);
    throw err;
  }

  await getEmailAdapter().send({
    to: user.email,
    subject: "Payment submission received",
    body: `We received your payment submission (reference ${utr}) for ${event.name}. An organizer will review it manually — this is not yet confirmation of payment.`,
  });

  return submission;
}

async function decidePayment(
  actor: Actor,
  paymentId: string,
  decision: "APPROVED" | "REJECTED",
  note: string
) {
  assertAdmin(actor);
  requireObjectId(paymentId, "payment");
  await connectDB();

  const submission = await PaymentSubmission.findById(paymentId);
  if (!submission) throw new NotFoundError("Payment submission not found.");
  if (!canDecidePayment(submission.status as PaymentSubmissionDoc["status"])) {
    throw new ConflictError("This payment submission has already been reviewed.");
  }

  const beforeStatus = submission.status;
  const updated = await withTransaction(async (session) => {
    const decided = await PaymentSubmission.findOneAndUpdate(
      { _id: paymentId, status: "PENDING_REVIEW" },
      { status: decision, reviewerId: actor.userId, reviewedAt: new Date(), reviewNote: note },
      { returnDocument: "after", session }
    );
    if (!decided) throw new ConflictError("This payment submission has already been reviewed.");

    const registration = await bindSession(Registration.findById(decided.registrationId), session);
    if (registration) {
      const previous = registration.status as RegistrationDoc["status"];
      const newStatus = registrationStatusForPaymentDecision(decision);
      const wasActive = isActiveRegistration(previous);
      const nowActive = isActiveRegistration(newStatus);
      if (wasActive && !nowActive) await releaseSeat(registration.divisionId, session);
      if (!wasActive && nowActive) await claimSeat(registration.divisionId, session);
      registration.status = newStatus;
      registration.statusHistory.push({ status: newStatus, at: new Date() });
      await registration.save(sessionOpts(session));
    }

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: decision === "APPROVED" ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED",
        targetType: "PaymentSubmission",
        targetId: String(decided._id),
        before: { status: beforeStatus },
        after: { status: decided.status, note },
      },
      session
    );
    return decided;
  });

  await notifyFighterOfPaymentDecision(updated, decision, note);

  return updated;
}

async function notifyFighterOfPaymentDecision(
  submission: PaymentSubmissionDoc,
  decision: "APPROVED" | "REJECTED",
  note: string
) {
  const registration = await Registration.findById(submission.registrationId).select("divisionId").lean();
  const [user, profile, event, division] = await Promise.all([
    User.findById(submission.userId).select("email").lean(),
    FighterProfile.findOne({ userId: submission.userId }).select("displayName").lean(),
    Event.findById(submission.eventId).select("name").lean(),
    registration?.divisionId
      ? Division.findById(registration.divisionId).select("name").lean()
      : Promise.resolve(null),
  ]);
  if (!user?.email) return;

  const name = profile?.displayName?.trim() || user.email;
  const card = `${event?.name ?? "your event"} — ${division?.name ?? "your division"}`;

  const message =
    decision === "APPROVED"
      ? {
          subject: "Registration verified — you're confirmed",
          body: [
            greetingLine(name),
            "",
            `An organizer verified your payment for ${card}.`,
            "Your registration is confirmed. See you on the mats.",
          ].join("\n"),
        }
      : {
          subject: "Payment rejected — action needed",
          body: [
            greetingLine(name),
            "",
            `Your payment for ${card} was not approved.`,
            `Reason: ${note.trim() || "No reason provided."}`,
            "You can resubmit payment from your fighter dashboard.",
          ].join("\n"),
        };

  try {
    await getEmailAdapter().send({ to: user.email, ...message });
  } catch (err) {
    // Decision is already committed; do not fail the admin action on mail delivery.
    console.error("[payment decision email failed]", err instanceof Error ? err.message : err);
  }
}

export async function approvePayment(actor: Actor, paymentId: string, note = "") {
  return decidePayment(actor, paymentId, "APPROVED", note);
}

export async function rejectPayment(actor: Actor, paymentId: string, note: string) {
  if (!note.trim()) throw new ValidationError("A rejection reason is required.");
  return decidePayment(actor, paymentId, "REJECTED", note);
}

const PAYMENT_QUEUE_LIMIT = 200;

export async function listPaymentQueue(actor: Actor, filterStatus?: PaymentSubmissionDoc["status"]) {
  assertAdmin(actor);
  await connectDB();

  const query = filterStatus ? { status: filterStatus } : {};
  const rows = await PaymentSubmission.find(query).sort({ createdAt: -1 }).limit(PAYMENT_QUEUE_LIMIT).lean();
  const userIds = [...new Set(rows.map((s) => String(s.userId)))];
  const eventIds = [...new Set(rows.map((s) => String(s.eventId)))];
  const [users, events] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("email").lean(),
    Event.find({ _id: { $in: eventIds } }).select("name paymentInstructions.currency").lean(),
  ]);
  const userById = new Map(users.map((u) => [String(u._id), { email: u.email }]));
  const eventById = new Map(
    events.map((e) => [
      String(e._id),
      { name: e.name, paymentInstructions: { currency: e.paymentInstructions?.currency ?? "INR" } },
    ])
  );

  const withDuplicates = flagDuplicateUtrs(
    rows.map((s) => ({ ...s, id: String(s._id), submittedUtr: s.submittedUtr ?? null }))
  );

  return withDuplicates.map((s) => ({
    ...s,
    user: userById.get(String(s.userId)) ?? null,
    event: eventById.get(String(s.eventId)) ?? null,
  }));
}

export async function getPaymentScreenshot(actor: Actor, paymentId: string) {
  assertAdmin(actor);
  requireObjectId(paymentId, "payment");
  await connectDB();
  const submission = await PaymentSubmission.findById(paymentId).lean();
  if (!submission || !submission.screenshotStorageKey) {
    throw new NotFoundError("No screenshot available for this payment submission.");
  }
  // Prefer streaming for route delivery; keep get() for callers that need a capped buffer.
  return getStorageAdapter().get(submission.screenshotStorageKey);
}

/** Authorized stream open for admin screenshot route handlers (no full-file buffer). */
export async function openPaymentScreenshot(actor: Actor, paymentId: string) {
  assertAdmin(actor);
  requireObjectId(paymentId, "payment");
  await connectDB();
  const submission = await PaymentSubmission.findById(paymentId).lean();
  if (!submission || !submission.screenshotStorageKey) {
    throw new NotFoundError("No screenshot available for this payment submission.");
  }
  return getStorageAdapter().open(submission.screenshotStorageKey);
}
