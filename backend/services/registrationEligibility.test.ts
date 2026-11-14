import { describe, expect, it } from "vitest";
import { ValidationError } from "@/server/http/errors";
import {
  assertDivisionEligibility,
  beltMatchesExperience,
  formGenderToDivisionGender,
} from "./registrationEligibility";

describe("formGenderToDivisionGender", () => {
  it("maps Male/Female and leaves Other empty", () => {
    expect(formGenderToDivisionGender("Male")).toBe("MALE");
    expect(formGenderToDivisionGender("Female")).toBe("FEMALE");
    expect(formGenderToDivisionGender("Other")).toBe("");
  });
});

describe("beltMatchesExperience", () => {
  it("allows white only for beginner", () => {
    expect(beltMatchesExperience("White", "BEGINNER")).toBe(true);
    expect(beltMatchesExperience("Blue", "BEGINNER")).toBe(false);
  });

  it("allows blue and purple for intermediate", () => {
    expect(beltMatchesExperience("Blue", "INTERMEDIATE")).toBe(true);
    expect(beltMatchesExperience("Purple", "INTERMEDIATE")).toBe(true);
    expect(beltMatchesExperience("White", "INTERMEDIATE")).toBe(false);
  });
});

describe("assertDivisionEligibility", () => {
  it("rejects gender mismatch", () => {
    expect(() =>
      assertDivisionEligibility(
        { gender: "MALE", experienceLevel: "BEGINNER" },
        { gender: "Female", beltRank: "White" }
      )
    ).toThrow(ValidationError);
  });

  it("rejects belt mismatch", () => {
    expect(() =>
      assertDivisionEligibility(
        { gender: "FEMALE", experienceLevel: "BEGINNER" },
        { gender: "Female", beltRank: "Blue" }
      )
    ).toThrow(/white belts only/i);
  });

  it("accepts matching gender and belt", () => {
    expect(() =>
      assertDivisionEligibility(
        { gender: "FEMALE", experienceLevel: "INTERMEDIATE" },
        { gender: "Female", beltRank: "Purple" }
      )
    ).not.toThrow();
  });
});
