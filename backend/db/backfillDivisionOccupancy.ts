import { connectDB } from "@/server/db/connect";
import { Division } from "@/server/models/Division";
import { ACTIVE_REGISTRATION_STATUSES, Registration } from "@/server/models/Registration";

export type OccupancyFinding = {
  divisionId: string;
  name: string;
  stored: number | null;
  actual: number;
};

export async function inspectDivisionOccupancy(): Promise<{ missing: OccupancyFinding[]; mismatches: OccupancyFinding[] }> {
  await connectDB();
  const divisions = await Division.find().select("name filledCount").lean();
  const missing: OccupancyFinding[] = [];
  const mismatches: OccupancyFinding[] = [];

  for (const division of divisions) {
    const actual = await Registration.countDocuments({
      divisionId: division._id,
      status: { $in: ACTIVE_REGISTRATION_STATUSES },
    });
    const stored = typeof division.filledCount === "number" ? division.filledCount : null;
    const finding = { divisionId: String(division._id), name: division.name, stored, actual };
    if (stored === null) missing.push(finding);
    else if (stored !== actual) mismatches.push(finding);
  }

  return { missing, mismatches };
}

/**
 * Fills counters that were never set. Stops with no writes when a stored counter
 * disagrees with the active registration count. Not called on application startup.
 */
export async function applyDivisionOccupancyBackfill(): Promise<{ missing: OccupancyFinding[]; mismatches: OccupancyFinding[] }> {
  const report = await inspectDivisionOccupancy();
  if (report.mismatches.length > 0) {
    const lines = report.mismatches.map(
      (item) => `${item.divisionId} (${item.name}): counter ${item.stored}, active registrations ${item.actual}`
    );
    throw new Error(`Division occupancy backfill stopped. Counters disagree with active registrations:\n${lines.join("\n")}`);
  }

  for (const item of report.missing) {
    await Division.updateOne(
      { _id: item.divisionId, filledCount: { $exists: false } },
      { $set: { filledCount: item.actual } }
    );
  }

  return report;
}
