import { describe, it, expect } from "vitest";
import { ageFromDob, grapplerDetailsSchema, grapplerFieldIssues, registerSchema } from "@/features/fighters/grappler-schema";
import { loginSchema } from "./schemas";

const dob = "1998-04-12";

function validSignup(overrides: Record<string, unknown> = {}) {
  return {
    displayName: "Rhea Kolhapure",
    mobile: "9876543210",
    email: "Rhea@Example.com",
    password: "correct-horse-1",
    ...overrides,
  };
}

function validGrappler(overrides: Record<string, unknown> = {}) {
  return {
    displayName: "Rhea Kolhapure",
    dateOfBirth: dob,
    age: ageFromDob(dob),
    gender: "Female",
    mobile: "9876543210",
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
    ...overrides,
  };
}

describe("registerSchema", () => {
  it("accepts a short account signup", () => {
    const result = registerSchema.safeParse(validSignup());
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("rhea@example.com");
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse(validSignup({ password: "short1" }));
    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse(validSignup({ password: "allletters" }));
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse(validSignup({ email: "not-an-email" }));
    expect(result.success).toBe(false);
  });
});

describe("grapplerDetailsSchema", () => {
  it("rejects an Aadhaar number that is not 12 digits", () => {
    const result = grapplerDetailsSchema.safeParse(validGrappler({ aadhaar: "12345" }));
    expect(result.success).toBe(false);
  });

  it("requires a medical detail when the answer is yes", () => {
    const parsed = grapplerDetailsSchema.safeParse(validGrappler({ hasMedicalCondition: "yes", medicalConditionDetail: "" }));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(grapplerFieldIssues(parsed.data).medicalConditionDetail).toBeTruthy();
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
