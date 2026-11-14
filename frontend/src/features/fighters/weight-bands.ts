/** Weight-class labels mirrored from backend divisionTaxonomy (client-safe). */
export const WOMEN_WEIGHT_BANDS = ["-65 kg", "+65 kg"] as const;

export const MEN_WEIGHT_BANDS = ["-55 kg", "55-65 kg", "65-75 kg", "75-85 kg", "+85 kg"] as const;

export function weightBandsForGender(gender: string): readonly string[] {
  if (gender === "Female") return WOMEN_WEIGHT_BANDS;
  if (gender === "Male") return MEN_WEIGHT_BANDS;
  return [...MEN_WEIGHT_BANDS, ...WOMEN_WEIGHT_BANDS];
}

export function divisionGenderCode(gender: string): "MALE" | "FEMALE" | null {
  if (gender === "Male") return "MALE";
  if (gender === "Female") return "FEMALE";
  return null;
}
