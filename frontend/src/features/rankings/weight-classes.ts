/** Canonical Up 'n Roll public ranking weight bands (kg) — men + women from meeting. */
export const WEIGHT_CLASSES = [
  { id: "women-u65", label: "Women −65 KG", aliases: ["women -65", "women −65", "-65 women", "female -65"] },
  { id: "women-o65", label: "Women +65 KG", aliases: ["women +65", "+65 women", "female +65"] },
  { id: "u55", label: "Men −55 KG", aliases: ["-55 kgs", "-55 kgs (open)", "-55 kg", "-55", "men -55"] },
  { id: "55-65", label: "Men 55-65 KG", aliases: ["55 - 65 kgs", "55-65 kgs", "55 – 65 kgs", "55-65 kg", "55–65 kg"] },
  { id: "65-75", label: "Men 65-75 KG", aliases: ["65 -75 kgs", "65-75 kgs", "65 - 75 kgs", "65–75 kg", "-70 kgs", "-70 kg"] },
  { id: "75-85", label: "Men 75-85 KG", aliases: ["75 -85 kgs", "75-85 kgs", "75 - 85 kgs", "75–85 kg"] },
  { id: "o85", label: "Men +85 KG", aliases: ["+85 kgs (open)", "+85 kgs", "+85 kg", "+85"] },
] as const;

export type WeightClassId = (typeof WEIGHT_CLASSES)[number]["id"];

function normalizeKey(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/kgss?/g, "kg")
    .replace(/\s+/g, " ")
    .replace(/–|−/g, "-");
}

/** Map free-text weight labels onto a canonical class id. */
export function resolveWeightClassId(raw: string | null | undefined): WeightClassId | null {
  if (!raw?.trim()) return null;
  const key = normalizeKey(raw);

  for (const band of WEIGHT_CLASSES) {
    if (band.aliases.some((alias) => normalizeKey(alias) === key)) return band.id;
  }

  if (key.includes("women") && (key.includes("+65") || key.includes("65+"))) return "women-o65";
  if (key.includes("women") && key.includes("65")) return "women-u65";
  if (key.includes("+85") || key.includes("85+")) return "o85";
  if (key.includes("75") && key.includes("85")) return "75-85";
  if (key.includes("65") && key.includes("75")) return "65-75";
  if (key.includes("55") && key.includes("65")) return "55-65";
  if (key.includes("-55") || key.startsWith("-55")) return "u55";
  if (key.includes("+65") || key.includes("65+")) return "women-o65";
  if (key.includes("-65")) return "women-u65";
  return null;
}

export function weightClassLabel(id: WeightClassId) {
  return WEIGHT_CLASSES.find((band) => band.id === id)?.label ?? id;
}
