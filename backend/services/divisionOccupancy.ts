import type { QueryFilter } from "mongoose";
import { Division, type DivisionDoc } from "@/server/models/Division";
import { bindSession, sessionOpts, type DbSession } from "@/server/db/transaction";
import { ConflictError, NotFoundError, ValidationError } from "@/server/http/errors";

export const MISSING_OCCUPANCY_MESSAGE =
  "This division has no occupancy counter. Run the division occupancy backfill before changing registrations.";

export function requireFilledCount(filledCount: unknown): number {
  if (typeof filledCount !== "number" || !Number.isInteger(filledCount) || filledCount < 0) {
    throw new ValidationError(MISSING_OCCUPANCY_MESSAGE);
  }
  return filledCount;
}

async function loadDivision(divisionId: unknown, session: DbSession) {
  const division = await bindSession(Division.findById(divisionId), session);
  if (!division) throw new NotFoundError("Division not found.");
  return division;
}

/** Claim one active seat. A missing counter is an error, not an empty division. */
export async function claimSeat(divisionId: unknown, session: DbSession) {
  const claimed = await Division.findOneAndUpdate(
    {
      _id: divisionId,
      filledCount: { $type: "number" },
      $expr: { $lt: ["$filledCount", "$capacity"] },
    } as unknown as QueryFilter<DivisionDoc>,
    { $inc: { filledCount: 1 } },
    { returnDocument: "after", ...sessionOpts(session) }
  );
  if (claimed) return claimed;

  const division = await loadDivision(divisionId, session);
  requireFilledCount(division.filledCount);
  throw new ConflictError("This division is at capacity.");
}

/** Release one active seat after a registration leaves the active set. */
export async function releaseSeat(divisionId: unknown, session: DbSession) {
  const released = await Division.findOneAndUpdate(
    { _id: divisionId, filledCount: { $gt: 0 } },
    { $inc: { filledCount: -1 } },
    { returnDocument: "after", ...sessionOpts(session) }
  );
  if (released) return released;

  const division = await loadDivision(divisionId, session);
  requireFilledCount(division.filledCount);
  throw new ConflictError("This division occupancy counter cannot be reduced below zero.");
}
