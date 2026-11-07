import athletes from "./held-card-athletes.json";

export type HeldCardAthlete = {
  slug: string;
  displayName: string;
  age: number | null;
  gender: string | null;
  instagram: string | null;
  gym: string | null;
  coach: string | null;
  city: string | null;
  state: string | null;
  weights: string[];
  divisions: string[];
  event: string;
  eventSlug: string;
  featured: boolean;
  /** House label for the featured Up 'n Roll profile. */
  houseLabel?: string;
};

const ROSTER: HeldCardAthlete[] = (athletes as HeldCardAthlete[]).map((athlete) =>
  athlete.featured
    ? { ...athlete, houseLabel: "Up 'n Roll", displayName: athlete.displayName || "Suketu" }
    : athlete
);

export function listHeldCardAthletes(): HeldCardAthlete[] {
  return ROSTER;
}

export function getHeldCardAthleteBySlug(slug: string): HeldCardAthlete | null {
  return ROSTER.find((athlete) => athlete.slug === slug) ?? null;
}

export function athleteInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}
