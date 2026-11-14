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
  { weightBand: "-65", weightMinKg: null, weightMaxKg: 65, label: "−65 kg" },
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

/** Public Superfight / card rules board — mirrors the posted event sheet. */
export const EVENT_POINTS_RULES = {
  advanced: {
    title: "Advanced division",
    subtitle: "Blue & Purple Belts",
    scoringTitle: "Scoring system (active in final 3 minutes)",
    points: [
      { label: "Takedown", detail: "2 points" },
      { label: "Sweep", detail: "2 points" },
      { label: "Knee on belly", detail: "2 points" },
    ],
  },
  beginner: {
    title: "Beginner division",
    permittedTitle: "Permitted submissions",
    permitted: [
      "All Standard Chokes",
      "Armbar",
      "Kimura",
      "Americana",
      "Omoplata",
      "Straight Foot Lock (Straight Ankle Lock)",
    ],
    prohibitedTitle: "Prohibited techniques",
    prohibited: [
      "Heel Hooks",
      "Toe Holds",
      "Knee Bars",
      "Calf Slicers",
      "Flying Submissions",
      "Jumping Guard",
      "Neck Cranks",
      "Spine Cranks",
      "Twisters",
      "Slams",
    ],
  },
  penalties: {
    title: "Penalties (−1 point each)",
    items: [
      "Deliberately leaving the competition area",
      "Unsportsmanlike conduct",
      "Failure to follow referee instructions",
      "Pulling guard without attacking",
      "Stalling or lack of engagement",
    ],
    warning:
      "A penalty point may be awarded for the above. Repeated violations may result in disqualification.",
  },
  general: {
    title: "General",
    items: [
      "Rashguard & Grappling Shorts are mandatory",
      "No zippers, pockets or hard objects",
    ],
  },
  acknowledgement: {
    title: "Competitor acknowledgement",
    body: "By registering for the event, all competitors acknowledge that they have read, understood and agree to abide by the above rules and regulations. Participants accept all risks associated with combat sports.",
  },
  /** Kept for older call sites that only need a flat points list. */
  points: [
    { label: "Takedown", detail: "2 points" },
    { label: "Sweep", detail: "2 points" },
    { label: "Knee on belly", detail: "2 points" },
  ],
  endings: ["Submission", "Points", "Disqualification", "Referee stoppage", "Withdrawal"],
  note: "Points are active in the final 3 minutes. Submission finishes follow the division rules below. The referee decision is final.",
} as const;
