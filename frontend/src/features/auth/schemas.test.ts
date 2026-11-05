import { describe, it, expect } from "vitest";
import { ageFromDob, grapplerFieldIssues, registerSchema } from "@/features/fighters/grappler-schema";
import { loginSchema } from "./schemas";

const dob = "1998-04-12";

function validRegistration(overrides: Record<string, unknown> = {}) {
  return {
    displayName: "Rhea Kolhapure",
    dateOfBirth: dob,
    age: ageFromDob(dob),
    gender: "Female",
    mobile: "9876543210",
    email: "Rhea@Example.com",
    nationality: "Indian",
    aadhaar: "123456789012",
    cityState: "Mumbai, Maharashtra",
    emergencyContactName: "Anil Kolhapure",
    emergencyRelationship: "Father",
    bloodGroup: "O+",
    academy: "Roll House",
    headCoach: "Suketu Bhuva",
    beltRank: "Blue",
    yearsTraining: 4,
    weightDivision: "Lightweight",
    heardAbout: "Instagram",
    hasMedicalCondition: "no",
    medicalConditionDetail: "",
    hasAllergies: "no",
    allergiesDetail: "",
    takingMedication: "no",
    medicallyFit: "yes",
    agree: "yes",
    password: "correct-horse-1",
    ...overrides,
  };
}

describe("registerSchema", () => {
  it("accepts a valid grappler registration", () => {
    const result = registerSchema.safeParse(validRegistration());
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("rhea@example.com");
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse(validRegistration({ password: "short1" }));
    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse(validRegistration({ password: "allletters" }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse(validRegistration({ email: "not-an-email" }));
    expect(result.success).toBe(false);
  });

  it("rejects an Aadhaar number that is not 12 digits", () => {
    const result = registerSchema.safeParse(validRegistration({ aadhaar: "12345" }));
    expect(result.success).toBe(false);
  });

  it("requires a medical detail when the answer is yes", () => {
    const parsed = registerSchema.safeParse(validRegistration({ hasMedicalCondition: "yes", medicalConditionDetail: "" }));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(grapplerFieldIssues(parsed.data).medicalConditionDetail).toBeTruthy();
  });

  it("requires agreement before the account is created", () => {
    const parsed = registerSchema.safeParse(validRegistration({ agree: "" }));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(grapplerFieldIssues(parsed.data, { requireAgree: true }).agree).toBeTruthy();
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials shape", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
