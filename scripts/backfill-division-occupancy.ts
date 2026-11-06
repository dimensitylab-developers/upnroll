/**
 * Manual occupancy backfill. Do not run this from application startup.
 * A stored counter that disagrees with active registrations stops the script
 * before any division is changed.
 *
 *   npm run backfill-occupancy
 * from frontend/. This programme does not run it.
 */
import { connectDB } from "../backend/db/connect";
import { applyDivisionOccupancyBackfill } from "../backend/db/backfillDivisionOccupancy";

async function main() {
  await connectDB();
  const report = await applyDivisionOccupancyBackfill();
  console.log(`Backfill finished. Set ${report.missing.length} missing counter(s). Mismatches: ${report.mismatches.length}.`);
  for (const item of report.missing) {
    console.log(`  set ${item.divisionId} (${item.name}) to ${item.actual}`);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
