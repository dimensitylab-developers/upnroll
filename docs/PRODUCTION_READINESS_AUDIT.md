# Up 'n Roll — production readiness audit

Date: 7 November 2026. Branch `suraj` at `180a3d0`. This pass read the source and the local environment names. It did not change application code, install packages, connect to Atlas, run the backfill, change DNS, create credentials, implement GridFS, or push.

The reported local verification (27 files, 156 tests, typecheck exit 0, production build exit 0) is the implementation session's result. This audit did not re-run those commands. A green local build is not a staging or production deployment.

Decision update, 7 November 2026, documentation only. Atlas and the existing Mongoose connection stay the only database. GridFS is the preferred private-file architecture. Its status is `Preferred architecture — implementation design and approval pending.` It is not implemented. Hosting provider and topology are not selected. SMTP2GO is the preferred mail candidate. Delivery is not verified. No application code changed for this update.

## 1. Executive assessment

The application cannot safely take production traffic. Hosting is not selected, so this audit does not treat a single instance as an approved topology.

What is in place: server-side authorization, Atlas transactions for the business writes that were moved in Phase 2, a production SMTP adapter that refuses to boot without the five SMTP variables, public cache limits, a health check that does not return the URI, and report-only security headers.

What blocks production:

- Private files still live on the local disk of one process. A second instance, or a host with an ephemeral disk, loses or splits screenshots and profile photos.
- Occupancy counters on existing divisions are not backfilled. Registration changes fail until an operator runs the manual script during a write freeze, after a backup.
- Mail has never been delivered through a provider from this codebase. There is no timeout, no sender check beyond a non-empty string, no delivery log, and no safe retry. A failed send happens after the database commit and is shown to the user as a generic error.
- `suraj` is 12 commits ahead of `origin/suraj`. GitHub Actions has not been observed.
- There is one cluster URI in local env and no named staging database in the code. The backfill writes whatever database that URI opens.

GridFS is now the preferred private-file architecture. Implementation has not started, so it is not a production store. Do not turn on a production boot refusal of local disk until a GridFS adapter is implemented and configured. A multi-instance or serverless production deployment must not proceed while private files still use local disk.

## 2. Verified infrastructure capabilities

Verified means the source says this. It does not mean a live host was exercised.

| Capability | Evidence |
| --- | --- |
| Production mail refuses an empty SMTP config | `assertProductionEmailConfig` in `backend/email/smtp-config.ts` throws when `NODE_ENV` is `production`, `NEXT_PHASE` is not `phase-production-build`, and any of `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` is missing. `frontend/src/instrumentation.ts` calls that on Node.js server start. `getEmailAdapter()` throws again before send. |
| Development does not send | `getEmailAdapter()` returns `ConsoleEmailAdapter` unless that production-runtime check passes (`backend/email/console.ts`). |
| TLS mode follows the port | `backend/email/smtp.ts` sets `secure: true` only when the port is 465. Every other port, including 587 and 2525, leaves `secure` false so Nodemailer can upgrade with STARTTLS. Authentication is username and password on that connection. |
| Business mail is after commit | Payment submit sends only after `withTransaction` returns (`backend/services/paymentService.ts` around the send that follows the transaction `catch`). Payment decision and registration-request decision do the same. A thrown transaction deletes a screenshot written beforehand and does not send. |
| User-facing mail errors hide provider text | `toAppError` maps a non-`AppError` to `Something went wrong.` (`backend/http/errors.ts`). The SMTP adapter does not put the password into its own error string. |
| Transactions use the existing Mongoose connection | `backend/db/transaction.ts` calls `connectDB()`, `startSession()`, `withTransaction`, and `endSession()` in `finally`. Callbacks are sequential. Email, files, and cookies stay outside. |
| Occupancy backfill refuses a mismatch and does not start with the app | `backend/db/backfillDivisionOccupancy.ts` throws before writes when a stored number disagrees. Updates match `filledCount: { $exists: false }`. `scripts/backfill-division-occupancy.ts` is only the npm script `backfill-occupancy`. |
| Transaction tests target `upnrol_txn_test` | `backend/db/transactions.integration.test.ts` rewrites an Atlas URI path to that name and refuses to drop any other database. Localhost URIs skip the suite. CI's build URI is localhost, and `npm test` has no URI, so CI does not run these tests. |
| Private file paths stay under `.local-storage` | `resolveStoragePath` rejects absolute keys and `..`. Admin screenshot and fighter photo routes check the actor, then return bytes with `nosniff` and `private, no-store`. |
| Health check body | `GET /api/health` returns `{ ok: true }` or `{ ok: false }` only. |
| Headers | `frontend/next.config.ts` sets nosniff, `strict-origin-when-cross-origin`, `DENY`, and a report-only content security policy. |
| Import boundary | `backend/services/import-boundary.test.ts` fails if `matchService.ts` imports `registrationService`. |

## 3. Unverified assumptions

- The 156 tests, the typecheck, and the webpack build were not repeated in this audit.
- No GitHub Actions run was opened. The workflow file is valid to read. It has not been shown executing on `180a3d0`.
- No SMTP provider has accepted a message from this process. Unit tests pass a fake transport.
- Nodemailer's default connection, greeting, and socket timeouts were not confirmed. The adapter sets none of `connectionTimeout`, `greetingTimeout`, or `socketTimeout`.
- The Atlas cluster's backup schedule, replica-set health, and database name were not queried. This audit did not connect.
- The local `MONGODB_URI` has no `/database` path. The driver then uses the default database `test`. That is a property of the URI string, not a confirmation of what Atlas contains.
- `docs/deployment/deployment-guide.md` still describes the console adapter as the sender and does not list the SMTP variables. The code has moved. The guide has not.
- Whether `frontend/src/proxy.ts` is safe on the Edge runtime was not re-read in this pass.

## 4. Production blockers

| Blocker | Why it stops a production cut |
| --- | --- |
| Local disk for private files | `getStorageAdapter()` always returns `LocalDiskStorageAdapter`. Two instances do not share `.local-storage`. An ephemeral disk loses files on restart. `mongodump` does not include them. |
| Occupancy not backfilled | `claimSeat` rejects a missing `filledCount`. The script has not been run. |
| Mail delivery unproven | No provider test. Local `SMTP_PASS` still contains spaces, so the current Gmail app password as pasted will not authenticate. `SMTP_FROM` is present and equals `SMTP_USER`. That file is local only. |
| No delivery log or retry record | A failed send after commit is not written to an audit row. The fighter sees `Something went wrong.` The payment or request decision is already saved. Repeating the same action is not a safe retry. |
| No staging database boundary in code | Staging versus production is only a different URI. The backfill does not check the database name. |
| Branch not on the remote | `origin/suraj` is 12 commits behind `180a3d0`. |
| CI does not prove transactions or mail | The Atlas suite skips. The build prerenders empty public data when `CI=true`. |
| Deployment guide is stale | An operator following it will believe mail is console-only. |
| No error monitoring | No Sentry or OpenTelemetry import. Rate limiting is one process (`backend/http/rateLimit.ts`). |
| Report-only CSP | Headers do not enforce script or frame policy. |
| Canonical host | No `metadataBase`. Not a boot blocker. It is a launch blocker for public SEO. |

A failed email does not roll back the MongoDB transaction. That split is intentional. It does mean the screen can report failure after the seat, payment, or request has already changed.

There is no automatic mail retry. Retrying by submitting the form again can hit a conflict or a second review. A safe retry needs a new operator action or a future outbox. Neither exists.

## 5. SMTP setup runbook

Provider: SMTP2GO. No account, password, or DNS record was created here.

### What the app will use

| Variable | SMTP2GO value |
| --- | --- |
| `SMTP_HOST` | `mail.smtp2go.com` |
| `SMTP_PORT` | `587` for STARTTLS, or `2525` if the host blocks 587. Both match this adapter because `secure` is false unless the port is 465. Use `465` only if you want implicit TLS. |
| `SMTP_USER` | The SMTP username from the SMTP2GO control panel. It is not the From address. |
| `SMTP_PASS` | The SMTP password from that panel. No spaces. |
| `SMTP_FROM` | One address on a sender domain SMTP2GO has verified. Gmail-style "the username is the from address" is not the SMTP2GO rule. |

Put these in the server environment, not in git. `frontend/.env.example` lists the names empty. `.env.local` is gitignored and is not production.

### Owner checklist

1. Create the SMTP2GO account and pick the sending domain. Do not paste the password into the repo, a chat, or a screenshot.
2. In SMTP2GO, add the domain and copy the DNS records they show. Typical records are an SPF include, one or more DKIM CNAMEs, and a DMARC TXT if you want a policy. Add those at the DNS host yourself. This audit does not change DNS.
3. Wait until SMTP2GO shows the domain as verified. Do not point the app at it before that.
4. Create an SMTP user. Store the username and password in the host's secret store.
5. Choose `SMTP_FROM` on that verified domain. Send one message from the SMTP2GO dashboard to a mailbox you control. Confirm it arrives and that the From domain aligns.
6. On a staging process with `NODE_ENV=production`, set the five variables and a staging `MONGODB_URI`. Start the server. It must boot. Unset `SMTP_FROM` in a throwaway start and confirm the process exits with `The console adapter is not used in production.`
7. Trigger one real payment or request decision on staging. Confirm the recipient inbox, not only the absence of an error. Then restore the staging data if that decision changed a row you still need.
8. Do not treat `npm run dev` as this test. Development never opens SMTP.

### Gaps to accept or fix before production mail

- No connection or socket timeout is configured. A stalled SMTP server can hold the server action until the platform kills it.
- `SMTP_FROM` is not checked as an email address. Any non-empty string passes.
- The adapter opens a new connection per send and does not log success or failure. Add a log later that records the message id and the outcome, not the password, the body, or the UTR.
- Provider errors that escape `toAppError` stay off the user's screen. They also stay off any log the adapter writes, because it writes none. An operator cannot see a bounce from the app.

## 6. Database backfill runbook

Do not run this as part of deploy automation. Do not run it while fighters can register. This audit did not run it.

The script is `npm run backfill-occupancy` from `frontend/`. It loads `frontend/.env.local` and calls `applyDivisionOccupancyBackfill()`. It writes the database named by `MONGODB_URI`. It does not rewrite the path to `upnrol_txn_test`.

### Before anyone runs it

1. In Atlas, open the cluster and read the database name that contains `divisions` and `registrations`. Write that name down.
2. Read the URI that the script will use. Confirm the path is that database. If the URI has no database path, the driver uses `test`. Stop if that is not the database you inspected.
3. Confirm Atlas backups are on, and that you can see a snapshot time from before this window. `docs/deployment/backup-restore.md` describes `mongodump` and Atlas backups. A snapshot that you have not opened is not verified. Take a dump only if you can store it outside the laptop and you will not restore it onto the wrong URI.
4. Stop registration writes. Stop the app processes that serve fighter and admin actions, or block those routes at the host. A registration between the count and the `$set` stores a stale counter, and the next run will refuse to repair it because the stored number will then disagree.
5. There is no dry-run flag. Inspection and writes are one command. Read the script output only after the freeze.

### Execution

From `frontend/`, with the confirmed URI in the environment the script actually loads:

`npm run backfill-occupancy`

Success prints how many missing counters were set, then each division id and name. A disagreement prints `Division occupancy backfill stopped` and exits non-zero. In that case it has written nothing.

### After

1. Run the script a second time. It should set zero counters. Any mismatch now means a write got in, or a counter was wrong before. Do not edit the script to overwrite.
2. Start the app only after that second run is clean.
3. Try one registration on a division that previously had no `filledCount`. It should not return the missing-counter error.

### Recovery

- If the script stopped on a mismatch, the data is unchanged. Fix the counter or the registrations by hand in Atlas, using the printed division id. Do not guess.
- If the process died mid-loop, some missing counters are set and others are not. A later run during a freeze fills the rest, as long as nothing drifted.
- If a stale count was written, do not run a blanket update. Restore that division from the snapshot taken in step 3, or set `filledCount` to the active registration count you count yourself while writes are still stopped.
- Never `mongorestore` the snapshot onto the URI until you have read the target database name out loud and it is not the live database. Restore into a new database name first.

## 7. Storage recommendation

Owner decision, recorded after this audit's first draft: GridFS on the existing Atlas database is the preferred production store for private payment screenshots and fighter profile photos. Public brand assets, gallery images, and the homepage video stay in the Next.js public directory. Authorization stays in services and protected routes. GridFS ids and metadata are not authorization. Uploads stay outside retryable transactions. A failed business transaction deletes the file uploaded just before it. Existing `.local-storage` files are not copied or deleted. No second database and no object-storage vendor.

Status: `Preferred architecture — implementation design and approval pending.` GridFS is not implemented and is not production-ready.

`LocalDiskStorageAdapter` remains the development store. It is not a valid store for more than one instance, for serverless, or for a disk that disappears on deploy. Payment submit writes the file before the transaction and deletes it if the transaction throws. A crash after the write and before the transaction leaves an orphan file. Nothing sweeps orphans. `delete` ignores a missing file. `get` reads the whole buffer.

Do not write the adapter until a separate design is approved. That design must cover bucket configuration, file metadata, streaming upload and download, file size and MIME validation, protected delivery, cleanup and orphans, backup and restore, failure recovery, and integration tests.

Do not enable a production boot refusal of local disk until that adapter is implemented and configured. Until then, do not place production on ephemeral or multi-instance infrastructure. Hosting topology itself is still unresolved, including whether a single persistent disk will ever be used.

## 8. Deployment checklist

Local evidence is the 7 November verification on this machine. Remote CI and a live deploy are not done.

1. Do not pick a host in this checklist. Hosting provider, instance count, persistent disk, platform, runtime limits, backup responsibility, shared rate limiting, and monitoring are unresolved. A multi-instance or serverless production deployment stops here until GridFS is implemented and verified.
2. Create a staging database on Atlas with its own name. Put that name in the staging URI. Do not reuse the database the laptops use.
3. Set staging `MONGODB_URI`, `SESSION_SECRET` (at least 32 characters, not the production secret), the five SMTP variables, and leave `UI_PREVIEW_ENABLED` unset unless you mean to expose the preview.
4. Push `suraj` only when you ask for it. Confirm the GitHub Actions run. Remember a green test job skips the Atlas transaction tests.
5. Build with the real staging environment only if you accept that `CI=true` prerenders empty public pages. A production build on a machine where `CI` is unset will prerender from the database in that environment. Prefer building where `CI` is unset and the URI is staging, or accept a one-minute stale empty shell.
6. Run `next start` with `NODE_ENV=production`. Confirm `/api/health` returns `{ "ok": true }` and that the body has no URI.
7. Confirm response headers include nosniff, the referrer policy, and `X-Frame-Options: DENY`.
8. Run the backfill runbook against staging first, even if staging is empty. Then run it against the real database only under the freeze.
9. Send one staging email through the app.
10. Create the first admin with `create-admin` against the staging URI, then again against production when that URI exists. The script resets the password of an existing email.
11. Read `docs/deployment/deployment-guide.md` before a deploy. It records the open hosting and storage gates. It is not a production sign-off.

## 9. Rollback plan

Application rollback is "run the previous build." There is no down migration.

| Change | Rollback |
| --- | --- |
| This git range | Deploy the previous image or the commit you marked good. `filledCount` fields that the backfill added stay. Old code treats a missing counter as a problem only after Phase 2. Rolling back past `a548ae9` ignores the counter. Do not drop the field as part of rollback. |
| A bad backfill | Use the recovery steps in section 6. Do not restore the whole cluster onto the live URI. |
| SMTP outage | The database rows already committed stay committed. Fix SMTP and send the notice by hand. Turning SMTP variables off in production makes the process fail at startup. To stop mail without taking the site down you would need a code change. There is no feature flag. |
| GridFS | Not deployed. Nothing to roll back. |
| Session secret rotation | Every cookie stops working. Users sign in again. That is expected. |
| Local disk deploy | Rolling the app back does not delete files. It also does not move them to another machine. |

`docs/deployment/backup-restore.md` is the restore procedure. Read the target URI before `mongorestore`. Screenshots are not in the dump while they are on disk.

## 10. Explicit decisions required from the owner

| Decision | Needed before |
| --- | --- |
| Approve the GridFS implementation design listed in section 7, then implement and verify it | Any multi-instance or serverless production host, and any production private-file store |
| Staging database name, separate from the laptop database and from `upnrol_txn_test` | First staging boot |
| SMTP2GO account, verified domain, and DNS records you add yourself | Any real mail |
| Where the five SMTP secrets live on the host | Staging boot |
| Whether to add timeouts and a redacted delivery log before production mail | Production mail |
| Whether to run the occupancy backfill, and the calendar window for the write freeze | Registration on existing divisions |
| Push `suraj` and watch CI | Treating GitHub as the gate |
| Production hostname | Canonical URLs |
| Hosting provider, instance count, persistent disk, platform, runtime limits, backup responsibility, and monitoring provider | Deploy |
| Error monitoring and a shared rate-limit store | More than one instance |
| Retention for screenshots and backups | OD-011, still open |

GridFS is the preferred architecture. Implementation is not approved and has not started. No is still assumed for DNS edits, for running the backfill, for pushing, and for choosing a host, until you say otherwise. This document does not mark the platform production-ready.
