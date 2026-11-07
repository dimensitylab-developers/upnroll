import "server-only";

/**
 * Pure helper for the admin payment queue — no DB. Flags a submission's
 * UTR as a duplicate if any OTHER submission in the provided set shares
 * the same (non-empty) UTR value. Part E: "flag duplicate transaction
 * references for review" — flag, never auto-block.
 */
export function flagDuplicateUtrs<T extends { id: string; submittedUtr: string | null }>(
  submissions: T[]
): (T & { duplicateUtr: boolean })[] {
  const counts = new Map<string, number>();
  for (const s of submissions) {
    if (!s.submittedUtr) continue;
    counts.set(s.submittedUtr, (counts.get(s.submittedUtr) ?? 0) + 1);
  }
  return submissions.map((s) => ({
    ...s,
    duplicateUtr: Boolean(s.submittedUtr) && (counts.get(s.submittedUtr!) ?? 0) > 1,
  }));
}
