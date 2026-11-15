/** Weight-class labels mirrored from backend divisionTaxonomy (client-safe). */
export const WOMEN_WEIGHT_BANDS = ["-55 kg", "55-65 kg", "+65 kg"] as const;

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

const MEN_CEILING: Record<number, string> = {
  55: "-55 kg",
  65: "55-65 kg",
  75: "65-75 kg",
  85: "75-85 kg",
};

const WOMEN_CEILING: Record<number, string> = {
  55: "-55 kg",
  60: "55-65 kg",
  65: "55-65 kg",
};

/**
 * Map stored profile / legacy division labels onto the current select bands.
 * e.g. "Men Intermediate −75 kg" → "65-75 kg"
 */
export function normalizeWeightBand(raw: string, gender = ""): string {
  const value = raw.trim();
  if (!value) return "";
  const bands = weightBandsForGender(gender);
  if ((bands as readonly string[]).includes(value)) return value;

  const ascii = value.replace(/[−–—]/g, "-");
  const range = ascii.match(/(\d+)\s*-\s*(\d+)\s*kg/i);
  if (range) {
    const label = `${range[1]}-${range[2]} kg`;
    if ((bands as readonly string[]).includes(label)) return label;
  }

  const open = ascii.match(/\+\s*(\d+)\s*kg/i);
  if (open) {
    const n = Number(open[1]);
    if (gender === "Female" && (n === 60 || n === 65)) return "+65 kg";
    if (n >= 85) return "+85 kg";
    if ((bands as readonly string[]).includes(`+${n} kg`)) return `+${n} kg`;
  }

  const under = ascii.match(/-\s*(\d+)\s*kg/i);
  if (under) {
    const n = Number(under[1]);
    const table = gender === "Female" ? WOMEN_CEILING : MEN_CEILING;
    const mapped = table[n];
    if (mapped && (bands as readonly string[]).includes(mapped)) return mapped;
  }

  return "";
}
