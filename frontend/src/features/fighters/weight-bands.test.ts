import { describe, expect, it } from "vitest";
import { normalizeWeightBand } from "./weight-bands";

describe("normalizeWeightBand", () => {
  it("keeps modern band labels", () => {
    expect(normalizeWeightBand("65-75 kg", "Male")).toBe("65-75 kg");
    expect(normalizeWeightBand("-55 kg", "Female")).toBe("-55 kg");
  });

  it("maps legacy division names onto bands", () => {
    expect(normalizeWeightBand("Men Intermediate −75 kg", "Male")).toBe("65-75 kg");
    expect(normalizeWeightBand("Women Beginner -55 kg", "Female")).toBe("-55 kg");
    expect(normalizeWeightBand("Men +85 kg", "Male")).toBe("+85 kg");
  });

  it("returns empty for unknown legacy labels", () => {
    expect(normalizeWeightBand("Lightweight", "Male")).toBe("");
    expect(normalizeWeightBand("Welterweight", "Male")).toBe("");
  });
});
