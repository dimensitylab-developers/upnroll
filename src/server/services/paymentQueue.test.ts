import { describe, it, expect } from "vitest";
import { flagDuplicateUtrs } from "./paymentQueue";

describe("flagDuplicateUtrs", () => {
  it("flags two submissions sharing the same UTR", () => {
    const result = flagDuplicateUtrs([
      { id: "a", submittedUtr: "ABC123" },
      { id: "b", submittedUtr: "ABC123" },
      { id: "c", submittedUtr: "XYZ999" },
    ]);
    expect(result.find((r) => r.id === "a")?.duplicateUtr).toBe(true);
    expect(result.find((r) => r.id === "b")?.duplicateUtr).toBe(true);
    expect(result.find((r) => r.id === "c")?.duplicateUtr).toBe(false);
  });

  it("does not flag submissions with no UTR yet", () => {
    const result = flagDuplicateUtrs([
      { id: "a", submittedUtr: null },
      { id: "b", submittedUtr: null },
    ]);
    expect(result.every((r) => !r.duplicateUtr)).toBe(true);
  });

  it("does not flag a unique UTR", () => {
    const result = flagDuplicateUtrs([{ id: "a", submittedUtr: "ONLYONE1" }]);
    expect(result[0].duplicateUtr).toBe(false);
  });
});
