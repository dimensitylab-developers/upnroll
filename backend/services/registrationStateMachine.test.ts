import { describe, it, expect } from "vitest";
import {
  canSubmitPayment,
  canDecidePayment,
  isActiveRegistration,
  registrationStatusForPaymentDecision,
  registrationStatusForNewSubmission,
} from "./registrationStateMachine";

describe("canSubmitPayment", () => {
  it("allows submission from AWAITING_PAYMENT", () => {
    expect(canSubmitPayment("AWAITING_PAYMENT")).toBe(true);
  });
  it("allows resubmission from REJECTED", () => {
    expect(canSubmitPayment("REJECTED")).toBe(true);
  });
  it("blocks submission from PENDING_VERIFICATION (already under review)", () => {
    expect(canSubmitPayment("PENDING_VERIFICATION")).toBe(false);
  });
  it("blocks submission from CONFIRMED", () => {
    expect(canSubmitPayment("CONFIRMED")).toBe(false);
  });
  it("blocks submission from CANCELLED", () => {
    expect(canSubmitPayment("CANCELLED")).toBe(false);
  });
});

describe("canDecidePayment", () => {
  it("allows a decision only while PENDING_REVIEW", () => {
    expect(canDecidePayment("PENDING_REVIEW")).toBe(true);
  });
  it("blocks deciding an already-approved submission (idempotency)", () => {
    expect(canDecidePayment("APPROVED")).toBe(false);
  });
  it("blocks deciding an already-rejected submission (idempotency)", () => {
    expect(canDecidePayment("REJECTED")).toBe(false);
  });
  it("blocks deciding a submission that was never submitted", () => {
    expect(canDecidePayment("AWAITING_SUBMISSION")).toBe(false);
  });
});

describe("isActiveRegistration", () => {
  it.each(["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"] as const)(
    "%s counts as active (blocks duplicate registration)",
    (status) => {
      expect(isActiveRegistration(status)).toBe(true);
    }
  );
  it.each(["REJECTED", "CANCELLED"] as const)("%s does not count as active", (status) => {
    expect(isActiveRegistration(status)).toBe(false);
  });
});

describe("registration status transitions", () => {
  it("approval moves registration to CONFIRMED", () => {
    expect(registrationStatusForPaymentDecision("APPROVED")).toBe("CONFIRMED");
  });
  it("rejection moves registration to REJECTED", () => {
    expect(registrationStatusForPaymentDecision("REJECTED")).toBe("REJECTED");
  });
  it("a new submission moves registration to PENDING_VERIFICATION", () => {
    expect(registrationStatusForNewSubmission()).toBe("PENDING_VERIFICATION");
  });
});
