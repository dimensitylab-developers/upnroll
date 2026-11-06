# Phase 2 completion report

Date: 6 Nov 2026. Branch: `suraj`. The application database was not migrated.

## What shipped

Registration, payment review, bracket generation and publication, ranking recalculation, and registration-request decisions each run in one transaction on the existing Mongoose connection.

`backend/db/transaction.ts` starts a session, runs the callback inside `withTransaction`, and calls `endSession()` in `finally`. Operations inside the callback are sequential. Email, filesystem writes, cookies, and WhatsApp stay outside the callback. A payment screenshot written before the transaction is deleted if the transaction throws. A failed email after commit does not delete that file.

`Division.filledCount` has no schema default. A missing counter is a validation error, not an empty division. `claimSeat` updates only when `filledCount` is a number and is below `capacity`. `releaseSeat` updates only when the counter is above zero. The counter moves on every active/inactive transition: create, resubmit, reject, cancel, withdraw, and transfer. `setDivisionCapacity` refuses a capacity below the current occupancy. There is no capacity-edit screen; the guard is the service.

`scripts/backfill-division-occupancy.ts` is manual. It writes nothing when any stored counter disagrees with the active registration count. It sets `filledCount` only where the field is absent. It is not called on startup. It was not run against the application database.

## Migration order

The code refuses a registration change when `filledCount` is missing. Run `npm run backfill-occupancy` from `frontend/` before relying on registration against existing divisions. This programme did not run that command.

## Tests

From `frontend/`:

| Check | Result |
| --- | --- |
| `npx tsc --noEmit --pretty false` | exit 0 |
| `npm test` | 24 files, 147 tests passed |
| `npm run build` | exit 0, compiled in 21.5s |

The eight transaction tests connect to Atlas database `upnrol_txn_test` and drop that database when they finish. They cover commit and rollback, one seat with a duplicate and a full division, two fighters racing for the last seat, a payment rejected once, a bracket published once, overlapping ranking recalculations staying on one `calculationVersion`, a backfill that stops when a counter disagrees, and a capacity set below occupancy. The application database was not used.

## Boundaries kept

Actor checks, public event status filtering, and the React `cache()` wrappers on `getSession` and `listPublicEvents` are unchanged. Ranking math is still `winLossPointsStrategy`. Bracket format is still single elimination. No SMTP library and no GridFS code were added.

## Remaining risk

Divisions created before this code have no `filledCount` until the manual backfill runs. Until then, registration changes on those divisions fail with the missing-counter error. A counter that was stored and does not match the active registrations is left unchanged by the script, on purpose.
