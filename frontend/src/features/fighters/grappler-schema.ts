import { z } from "zod";

const yesNo = z.enum(["yes", "no"]);

export const grapplerDetailsSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your full name as it appears on your ID.").max(80),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth."),
  age: z.coerce.number().int().min(5, "Enter your age.").max(80),
  gender: z.enum(["Male", "Female", "Other"]),
  mobile: z.string().trim().min(8, "Enter a mobile number.").max(20),
  nationality: z.string().trim().min(2, "Enter your nationality.").max(60),
  aadhaar: z.string().trim().regex(/^\d{12}$/, "Aadhaar must be 12 digits."),
  cityState: z.string().trim().min(2, "Enter your city and state.").max(80),
  emergencyContactName: z.string().trim().min(2, "Enter an emergency contact.").max(80),
  emergencyRelationship: z.string().trim().min(2, "Enter how you know them.").max(40),
  bloodGroup: z.string().trim().max(8).optional().default(""),
  academy: z.string().trim().min(2, "Enter your academy or team.").max(80),
  headCoach: z.string().trim().min(2, "Enter your coach.").max(80),
  beltRank: z.string().trim().min(2, "Enter your belt rank.").max(40),
  yearsTraining: z.coerce.number().min(0, "Enter years training.").max(60),
  weightDivision: z.string().trim().min(1, "Enter your weight division.").max(40),
  heardAbout: z.string().trim().min(2, "Tell us how you heard about Up ’n Roll.").max(120),
  hasMedicalCondition: yesNo,
  medicalConditionDetail: z.string().trim().max(300).optional().default(""),
  hasAllergies: yesNo,
  allergiesDetail: z.string().trim().max(300).optional().default(""),
  takingMedication: yesNo,
  medicallyFit: yesNo,
});

export type GrapplerDetails = z.infer<typeof grapplerDetailsSchema>;

/** Account sign-up stays light. Full grappler details are collected on event registration. */
export const registerSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your full name.").max(80),
  mobile: z.string().trim().min(8, "Enter a mobile number.").max(20),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(200)
    .regex(/[A-Za-z]/, "Password must include a letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export function ageFromDob(iso: string, today = new Date()): number {
  const dob = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return -1;
  let age = today.getFullYear() - dob.getFullYear();
  const month = today.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

export function grapplerFieldIssues(
  data: Pick<
    GrapplerDetails,
    | "dateOfBirth"
    | "age"
    | "hasMedicalCondition"
    | "medicalConditionDetail"
    | "hasAllergies"
    | "allergiesDetail"
    | "medicallyFit"
  > & { agree?: string },
  options?: { requireAgree?: boolean }
): Record<string, string[]> {
  const issues: Record<string, string[]> = {};
  const add = (path: string, message: string) => {
    issues[path] = [message];
  };

  const dob = new Date(`${data.dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) add("dateOfBirth", "Enter a real date of birth.");
  else if (dob.getTime() > Date.now()) add("dateOfBirth", "Date of birth cannot be in the future.");
  else if (Math.abs(ageFromDob(data.dateOfBirth) - data.age) > 1) add("age", "Age should match the date of birth.");

  if (data.hasMedicalCondition === "yes" && !data.medicalConditionDetail.trim()) {
    add("medicalConditionDetail", "Describe the condition or injury.");
  }
  if (data.hasAllergies === "yes" && !data.allergiesDetail.trim()) {
    add("allergiesDetail", "Describe the allergy.");
  }
  if (data.medicallyFit !== "yes") add("medicallyFit", "You need to be medically fit to compete.");
  if (options?.requireAgree && data.agree !== "yes") {
    add("agree", "Agree to the terms before creating an account.");
  }
  return issues;
}

export function grapplerFromForm(formData: FormData) {
  return {
    displayName: formData.get("displayName"),
    dateOfBirth: formData.get("dateOfBirth"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    mobile: formData.get("mobile"),
    nationality: formData.get("nationality"),
    aadhaar: formData.get("aadhaar"),
    cityState: formData.get("cityState"),
    emergencyContactName: formData.get("emergencyContactName"),
    emergencyRelationship: formData.get("emergencyRelationship"),
    bloodGroup: formData.get("bloodGroup") ?? "",
    academy: formData.get("academy"),
    headCoach: formData.get("headCoach"),
    beltRank: formData.get("beltRank"),
    yearsTraining: formData.get("yearsTraining"),
    weightDivision: formData.get("weightDivision"),
    heardAbout: formData.get("heardAbout"),
    hasMedicalCondition: formData.get("hasMedicalCondition"),
    medicalConditionDetail: formData.get("medicalConditionDetail") ?? "",
    hasAllergies: formData.get("hasAllergies"),
    allergiesDetail: formData.get("allergiesDetail") ?? "",
    takingMedication: formData.get("takingMedication"),
    medicallyFit: formData.get("medicallyFit"),
  };
}

export function toProfileFields(data: GrapplerDetails) {
  return {
    displayName: data.displayName,
    dateOfBirth: data.dateOfBirth,
    age: data.age,
    gender: data.gender,
    mobile: data.mobile,
    nationality: data.nationality,
    aadhaar: data.aadhaar,
    cityState: data.cityState,
    emergencyContactName: data.emergencyContactName,
    emergencyRelationship: data.emergencyRelationship,
    bloodGroup: data.bloodGroup ?? "",
    academy: data.academy,
    gym: data.academy,
    headCoach: data.headCoach,
    beltRank: data.beltRank,
    yearsTraining: data.yearsTraining,
    weightDivision: data.weightDivision,
    heardAbout: data.heardAbout,
    hasMedicalCondition: data.hasMedicalCondition === "yes",
    medicalConditionDetail: data.hasMedicalCondition === "yes" ? (data.medicalConditionDetail ?? "") : "",
    hasAllergies: data.hasAllergies === "yes",
    allergiesDetail: data.hasAllergies === "yes" ? (data.allergiesDetail ?? "") : "",
    takingMedication: data.takingMedication === "yes",
    medicallyFit: true,
  };
}
