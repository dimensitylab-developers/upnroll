/** Client-approved submission menu for judge / admin scoring (meeting Phase 5). */
export const ALLOWED_SUBMISSIONS = [
  "Rear naked choke",
  "Guillotine",
  "Triangle choke",
  "Armbar",
  "Kimura",
  "Americana",
  "Omoplata",
  "Straight ankle lock",
  "Toe hold",
  "Knee bar",
  "Calf slicer",
  "Other (permitted by rules)",
] as const;

export type AllowedSubmission = (typeof ALLOWED_SUBMISSIONS)[number];
