import "server-only";
import type { RegistrationStatus } from "@/server/models/Registration";
import type { PaymentSubmissionStatus } from "@/server/models/PaymentSubmission";

/**
 * Pure state-transition guards — no DB, no I/O. Kept separate from the
 * services so the actual business rule can be unit-tested directly instead
 * of only indirectly through a live database.
 */

/** Registration states from which a fighter may (re)submit a payment. */
const SUBMITTABLE_REGISTRATION_STATUSES: RegistrationStatus[] = ["AWAITING_PAYMENT", "REJECTED"];

export function canSubmitPayment(registrationStatus: RegistrationStatus): boolean {
  return SUBMITTABLE_REGISTRATION_STATUSES.includes(registrationStatus);
}

/** Payment submissions can only be decided (approved/rejected) while pending review. */
export function canDecidePayment(submissionStatus: PaymentSubmissionStatus): boolean {
  return submissionStatus === "PENDING_REVIEW";
}

/** Only these registration statuses count as "active" (block a duplicate registration, count toward division capacity). */
export const ACTIVE_REGISTRATION_STATUSES: RegistrationStatus[] = ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"];

export function isActiveRegistration(status: RegistrationStatus): boolean {
  return ACTIVE_REGISTRATION_STATUSES.includes(status);
}

export function registrationStatusForPaymentDecision(decision: "APPROVED" | "REJECTED"): RegistrationStatus {
  return decision === "APPROVED" ? "CONFIRMED" : "REJECTED";
}

export function registrationStatusForNewSubmission(): RegistrationStatus {
  return "PENDING_VERIFICATION";
}
