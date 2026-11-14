import { ValidationError } from "@/server/http/errors";

export function formGenderToDivisionGender(gender: string | undefined): "MALE" | "FEMALE" | "" {
  if (gender === "Male") return "MALE";
  if (gender === "Female") return "FEMALE";
  return "";
}

export function beltMatchesExperience(belt: string | undefined, level: string | undefined): boolean {
  if (!level) return true;
  if (level === "BEGINNER") return belt === "White";
  if (level === "INTERMEDIATE") return belt === "Blue" || belt === "Purple";
  return true;
}

export function assertDivisionEligibility(
  division: { gender?: string; experienceLevel?: string },
  profile: { gender?: string; beltRank?: string } | null
) {
  const genderGate = division.gender === "MALE" || division.gender === "FEMALE";
  const beltGate = division.experienceLevel === "BEGINNER" || division.experienceLevel === "INTERMEDIATE";
  if (!genderGate && !beltGate) return;

  if (!profile) {
    throw new ValidationError("Complete your grappler profile before registering.");
  }
  if (genderGate) {
    const expectedGender = formGenderToDivisionGender(profile.gender);
    if (!expectedGender) {
      throw new ValidationError("Select Male or Female to enter this weight class.");
    }
    if (expectedGender !== division.gender) {
      throw new ValidationError("That weight class does not match your gender.");
    }
  }
  if (beltGate && !beltMatchesExperience(profile.beltRank, division.experienceLevel)) {
    throw new ValidationError(
      division.experienceLevel === "BEGINNER"
        ? "Beginner divisions are for white belts only."
        : "Intermediate divisions are for blue and purple belts only."
    );
  }
}
