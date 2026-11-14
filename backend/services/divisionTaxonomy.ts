export type DivisionGender = "MALE" | "FEMALE";
export type DivisionExperience = "BEGINNER" | "INTERMEDIATE";

export type TaxonomyBand = {
  weightBand: string;
  weightMinKg: number | null;
  weightMaxKg: number | null;
  label: string;
};

export type TaxonomySeed = {
  gender: DivisionGender;
  experienceLevel: DivisionExperience;
  weightBand: string;
  weightMinKg: number | null;
  weightMaxKg: number | null;
  name: string;
  discipline: string;
};

const WOMEN_BANDS: TaxonomyBand[] = [
  { weightBand: "-55", weightMinKg: null, weightMaxKg: 55, label: "−55 kg" },
  { weightBand: "55-65", weightMinKg: 55, weightMaxKg: 65, label: "55–65 kg" },
  { weightBand: "+65", weightMinKg: 65, weightMaxKg: null, label: "+65 kg" },
];

const MEN_BANDS: TaxonomyBand[] = [
  { weightBand: "-55", weightMinKg: null, weightMaxKg: 55, label: "−55 kg" },
  { weightBand: "55-65", weightMinKg: 55, weightMaxKg: 65, label: "55–65 kg" },
  { weightBand: "65-75", weightMinKg: 65, weightMaxKg: 75, label: "65–75 kg" },
  { weightBand: "75-85", weightMinKg: 75, weightMaxKg: 85, label: "75–85 kg" },
  { weightBand: "+85", weightMinKg: 85, weightMaxKg: null, label: "+85 kg" },
];

const EXPERIENCES: DivisionExperience[] = ["BEGINNER", "INTERMEDIATE"];

function experienceLabel(level: DivisionExperience) {
  return level === "BEGINNER" ? "Beginner" : "Intermediate";
}

export function divisionDisplayName(
  gender: DivisionGender,
  weightLabel: string,
  experienceLevel: DivisionExperience
) {
  const who = gender === "FEMALE" ? "Women" : "Men";
  return `${who} ${weightLabel} · ${experienceLabel(experienceLevel)}`;
}

/** Road to Super Fight / Jan 2027 approved grid. */
export function roadToSuperFightDivisionSeeds(): TaxonomySeed[] {
  const seeds: TaxonomySeed[] = [];
  for (const band of WOMEN_BANDS) {
    for (const experienceLevel of EXPERIENCES) {
      seeds.push({
        gender: "FEMALE",
        experienceLevel,
        weightBand: band.weightBand,
        weightMinKg: band.weightMinKg,
        weightMaxKg: band.weightMaxKg,
        name: divisionDisplayName("FEMALE", band.label, experienceLevel),
        discipline: "No-Gi",
      });
    }
  }
  for (const band of MEN_BANDS) {
    for (const experienceLevel of EXPERIENCES) {
      seeds.push({
        gender: "MALE",
        experienceLevel,
        weightBand: band.weightBand,
        weightMinKg: band.weightMinKg,
        weightMaxKg: band.weightMaxKg,
        name: divisionDisplayName("MALE", band.label, experienceLevel),
        discipline: "No-Gi",
      });
    }
  }
  return seeds;
}

export const EVENT_POINTS_RULES = {
  points: [
    { label: "Takedown", detail: "2 points" },
    { label: "Sweep", detail: "2 points" },
    { label: "Knee on belly", detail: "2 points" },
    { label: "Mount", detail: "2 points" },
    { label: "Guard pass", detail: "3 points" },
    { label: "Back control", detail: "3 points" },
  ],
  endings: ["Submission", "Points", "Disqualification", "Referee stoppage", "Withdrawal"],
  note:
    "6-minute matches: first 3 minutes no points, final 3 minutes scoring. Submissions valid throughout. Referee decision is final.",
} as const;

/** No-Gi tournament scoring config seeded onto the Jan 2027 event. */
export function noGiTournamentScoringRules() {
  return {
    configured: true,
    winByHighestScore: true,
    allowTies: false,
    points: [
      { code: "TAKEDOWN", label: "Takedown", points: 2 },
      { code: "SWEEP", label: "Sweep", points: 2 },
      { code: "KNEE_ON_BELLY", label: "Knee on belly", points: 2 },
      { code: "MOUNT", label: "Mount", points: 2 },
      { code: "GUARD_PASS", label: "Guard pass", points: 3 },
      { code: "BACK_CONTROL", label: "Back control", points: 3 },
    ],
    penalties: [
      { code: "LEAVE_AREA", label: "Deliberately leaving the competition area", pointsAgainst: 1 },
      { code: "UNSPORTSMANLIKE", label: "Unsportsmanlike conduct", pointsAgainst: 1 },
      { code: "REF_INSTRUCTIONS", label: "Failure to follow referee instructions", pointsAgainst: 1 },
      { code: "PULL_GUARD", label: "Pulling guard without attacking", pointsAgainst: 1 },
      { code: "STALLING", label: "Stalling or lack of engagement", pointsAgainst: 1 },
    ],
    outcomes: [
      { code: "SUBMISSION", label: "Submission", requiresExplicitWinner: true },
      { code: "POINTS", label: "Points", requiresExplicitWinner: false },
      { code: "DQ", label: "Opponent disqualification", requiresExplicitWinner: true },
      { code: "REF_STOPPAGE", label: "Referee stoppage", requiresExplicitWinner: true },
      { code: "WITHDRAWAL", label: "Opponent withdrawal", requiresExplicitWinner: true },
    ],
  } as const;
}
