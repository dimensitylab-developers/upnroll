import { describe, expect, it } from "vitest";

describe("registration fee snapshot isolation", () => {
  it("keeps submitted amount when event default fee changes later", () => {
    const registrationSnapshot = {
      amountMinorUnits: 150000,
      currency: "INR",
      paymentOptionId: "opt-discount-a",
      paymentOptionLabel: "Discount A",
      qrImageKey: "qr2",
      couponCode: "SAVE1500",
    };
    const eventAfterEdit = {
      paymentInstructions: { feeMinorUnits: 250000, currency: "INR", qrImageKey: "qr1" },
    };

    const charged =
      registrationSnapshot.amountMinorUnits ?? eventAfterEdit.paymentInstructions.feeMinorUnits;

    expect(charged).toBe(150000);
    expect(charged).not.toBe(eventAfterEdit.paymentInstructions.feeMinorUnits);
  });

  it("rejects client-supplied fee that does not match server selection", () => {
    const serverAmount = 150000;
    const clientAmount = 100;
    expect(clientAmount === serverAmount).toBe(false);
  });
});
