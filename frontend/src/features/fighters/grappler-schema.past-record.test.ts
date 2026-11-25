import { describe, expect, it } from "vitest";
import { grapplerDetailsSchema } from "./grappler-schema";

const base = {
  displayName: "Rohan Bandekar",
  dateOfBirth: "1996-01-05",
  age: 30,
  gender: "Male" as const,
  mobile: "9876543210",
  nationality: "Indian",
  cityState: "Mumbai, MH",
  emergencyContactName: "Prakash",
  emergencyRelationship: "Father",
  bloodGroup: "O+",
  instagramHandle: "rohan",
  academy: "Tashi Pro Fitness",
  headCoach: "Carlos Almeida",
  beltRank: "White" as const,
  yearsTraining: 1,
  weightDivision: "65-75",
  heardAbout: "Coach",
  hasMedicalCondition: "no" as const,
  hasAllergies: "no" as const,
  takingMedication: "no" as const,
  medicallyFit: "yes" as const,
};

describe("pastRecord format", () => {
  it("accepts wins-losses numbers like 0-1", () => {
    expect(grapplerDetailsSchema.safeParse({ ...base, pastRecord: "0-1" }).success).toBe(true);
    expect(grapplerDetailsSchema.safeParse({ ...base, pastRecord: "12-4" }).success).toBe(true);
  });

  it("rejects free text", () => {
    expect(grapplerDetailsSchema.safeParse({ ...base, pastRecord: "first tournament" }).success).toBe(false);
    expect(grapplerDetailsSchema.safeParse({ ...base, pastRecord: "debut" }).success).toBe(false);
  });
});
