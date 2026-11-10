# Phase 6 completion report

Date: 7 November 2026. Branch: `suraj`. GridFS was not implemented. The occupancy backfill was not run. No SMTP credentials were added. Nothing was pushed.

## Commits

| Commit | What landed | Check before the commit |
| --- | --- | --- |
| `cd3117d` | SMTP adapter and production configuration guard | `npx tsc --noEmit` exit 0. `vitest` on the two email files: 7 passed. |
| `03f5e17` | Fighter actor required by `listOpenDivisionsForRegistration` | Authorization file: 7 passed, including the new admin rejection. |
| `d78c0c4` | Import-boundary test | That test file: 1 passed. |

## SMTP

`frontend/package.json` depends on `nodemailer@^10.3.1`. `frontend/package-lock.json` resolves `10.3.1` from the npm registry (MIT-0, own types, Node `>=20`). `@types/nodemailer` was not added.

`backend/email/smtp.ts` implements the existing `EmailAdapter` port. `send({ to, subject, body })` becomes a Nodemailer text message with the same subject and body. Port 465 sets `secure: true`. Other ports leave `secure` false so Nodemailer can use STARTTLS.

`getEmailAdapter()` in `backend/email/console.ts` returns `ConsoleEmailAdapter` unless `NODE_ENV` is `production` and `NEXT_PHASE` is not `phase-production-build`. In that production-server case it builds the SMTP adapter or throws `The console adapter is not used in production.` Listing the missing names among `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.

`frontend/src/instrumentation.ts` calls `assertProductionEmailConfig()` when the Node.js runtime starts. A production server without SMTP settings fails before it serves traffic. `next build` sets `NEXT_PHASE=phase-production-build`, so the build does not need credentials and does not send mail.

The three call sites are unchanged and still run after the transaction returns:

- `backend/services/paymentService.ts` after payment submit
- `backend/services/paymentService.ts` after payment decision
- `backend/services/requestService.ts` after a registration-request decision

Payment submit still deletes the screenshot when the transaction throws, before any email. Email copy was not edited. WhatsApp remains the console helper in `updateMatchSchedule`.

`nodemailer` is in `serverExternalPackages` next to `mongoose`. `frontend/tsconfig.json` maps the `nodemailer` import to `frontend/node_modules/nodemailer` because this checkout has a real repo-root `node_modules` that does not contain the new package. CI links that root directory at `frontend/node_modules` when it is absent.

`.env.example` names the five variables and leaves them empty.

## Open-division authorization

`listOpenDivisionsForRegistration(actor)` calls `assertFighter` before it reads. The new-registration page loads the session and passes `actorFromSession`. An admin actor is `ForbiddenError`. The authorization test covers that rejection.

## Import boundary

`backend/services/import-boundary.test.ts` reads `matchService.ts` and fails if it statically or dynamically imports `registrationService`. `registrationService` still imports `recordMatchResult` and passes the outer session. No folders were moved. No cycle was found, so none was removed.

## Storage

`getStorageAdapter()` still returns `LocalDiskStorageAdapter`. No GridFS code was added. Production does not refuse local disk. That refusal stays off until a replacement store is approved.

## Verification after the three commits

From `frontend/` on 7 November 2026:

| Check | Result |
| --- | --- |
| `npx tsc --noEmit --pretty false` | exit 0 |
| `npm test` | 27 files, 156 tests passed |
| `npm run build` | exit 0, compiled in 47s, 42 static pages |

The transaction tests used Atlas database `upnrol_txn_test` and dropped only that database. The application database was not migrated. The dev server was stopped so the build could write `.next`.

The payment-reject integration test logged `[dev email — not sent]`, which is the console adapter under the test `NODE_ENV`. No message was delivered.

## Still required before production mail

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in the production server environment. Do not commit them. The host and the account are not chosen in this repo. Occupancy backfill, canonical URLs, and GridFS remain open.
