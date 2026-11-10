# Up 'n Roll — post Phase 5 engineering review

Date: 6 November 2026. Reviewer pass: source inspection of the current checkout. Branch `suraj`. Reference: `docs/MASTER_ENGINEERING_ROADMAP.md`.

This review did not modify application code, install packages, run the occupancy backfill, connect to a database, push, merge, rebase, or reset. Completion reports were not treated as proof. Commands that would talk to Atlas were not repeated. Where a number comes only from an earlier session, it is marked not re-verified.

## 1. Executive summary

Phases 0–5 are present in the branch history and match the source that was inspected. The branch is not production-ready.

The durable gaps are operational, not missing phase commits:

- Registration changes fail on any division whose `filledCount` was never set. The backfill script is safe only as a manual, quiesced operation against the database named by `frontend/.env.local`. It was not run, and this review did not run it.
- Email is still the console adapter. Nothing is delivered.
- Private files still go to `.local-storage` on local disk. A production process does not refuse that adapter. Disk files are outside `mongodump`.
- Canonical URLs are still blocked. There is no production domain.
- `suraj` is 8 commits ahead of `origin/suraj`. GitHub Actions has not been observed running for those commits.
- A successful local build is not a production deployment. The public cache can be prerendered empty when `CI=true`, which is what the workflow sets.

Phase 6 can start with an SMTP adapter on the existing `EmailAdapter` port after Nodemailer is explicitly approved. GridFS stays unapproved. Phase 7 does not need a folder move: `registrationService` imports `matchService`, and that import is not a cycle.

## 2. Git and branch verification

| Check | Result |
| --- | --- |
| Branch | `suraj` |
| HEAD | `5e7b281be1fbe1ddf63e3580ecffc596bd7469cc` |
| Upstream | `origin/suraj` at `1d13b5fa0fe31dacc14fddbb9542235e1f67e45b` |
| Ahead | 8 commits. Not pushed by this review. |
| Working tree | One untracked file at inspection time: `docs/STATUS_UPDATE.md`. No staged or modified application files. This review adds only this document. |

Commits on `suraj` that are not on `origin/suraj`:

| Commit | Subject |
| --- | --- |
| `5e7b281` | phase 5: add public metadata, a path sitemap, and report-only headers |
| `611dd2e` | phase 4: cache published public reads and invalidate them after commit |
| `c1ac4f8` | phase 3: stream public sections and drop unused React Query |
| `a548ae9` | phase 2: make registration changes transactional and claim seats atomically |
| `55228da` | phase 0: dedupe session and public events, hide draft schedules, and add CI |
| `091b0af` | test: stub the event read in registration-request decisions |
| `8165cda` | Merge branch `james` into `suraj` |
| `414741c` | feat: assign mats, record fighter details for admins, and settle chat and header |

The six programme commits are all in this history. Phase 1 (`1d13b5f`, `fix(security): close phase 1 authorization and build gaps`) is the current `origin/suraj` tip, so it is on the remote. Phases 0 and 2–5 are local only.

Classification: **Verified** for branch, HEAD, the six commits, and the unpushed range. **Not verified** that the remote still matches `1d13b5f` after this review, because nothing was fetched.

## 3. Phase-by-phase evidence

### Phase 0 — reliability

**Verified.** `getSession` is wrapped in React `cache()` at `backend/auth/session.ts` lines 69–82. `listPublicEvents` is wrapped the same way at `backend/services/eventService.ts` lines 123–126. Both call `connectDB()` inside the cached function, so duplicate callers in one request share one read.

Public event status is `PUBLIC_EVENT_STATUSES`: `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `COMPLETED` (`backend/services/eventService.ts` lines 25, 125, 130). `listPublicSchedule` loads the event with that same filter before it loads matches (`backend/services/matchService.ts` lines 298–301). `listPublicResults` filters that schedule to `COMPLETED` and `BYE` (lines 310–312). A draft event therefore has no public schedule or results.

`frontend/package.json` line 6 sets `predev` to `node ./scripts/ensure-root-modules.mjs`. The script leaves a real root `node_modules` in place (lines 20–24), and on Windows it creates a junction (lines 34–35). It does not call `ln`.

CI is `.github/workflows/ci.yml`. It checks out the repo, uses Node 22, runs `npm ci` in `frontend/`, runs the predev script, typechecks, runs Vitest, then `npm run build`. The dummy `MONGODB_URI` and `SESSION_SECRET` are set only on the build step (lines 24–27). Workflow execution on GitHub is **Not verified**.

### Phase 1 — authorization and private data

**Verified** for the actor model, public field lists, screenshot validation, path confinement, and the private file routes that were read.

`Actor` is a frozen `{ userId, role }` built only by `actorFromSession` (`backend/auth/actor.ts` lines 7–39). `assertAdmin` and `assertFighter` throw `ForbiddenError` for the wrong role. Services inspected (`registrationService`, `requestService`, `eventService`, `paymentService`, `rankingService`, `matchService`) call those asserts before mutations.

Public fighter reads select `displayName slug gym discipline` and, for one profile, also `userId` (`backend/services/fighterService.ts` lines 185, 201, 213). The admin view type includes `aadhaar` and medical fields (lines 10–30) and is not that public select.

Screenshot validation requires bytes, a 3 MB cap, and PNG, JPEG, or WEBP magic that matches the declared type (`frontend/src/features/payments/file-validation.ts` lines 1–46). `resolveStoragePath` rejects absolute keys, NUL, and paths that escape `.local-storage` (`backend/storage/local-disk.ts` lines 24–33).

`GET /api/v1/fighter/photo` requires a fighter session and sends `nosniff` plus `private, no-store` (`frontend/src/app/api/v1/fighter/photo/route.ts` lines 6–25). `GET /api/v1/admin/payments/[id]/screenshot` requires an admin actor and uses `paymentProofHeaders`, which sets attachment disposition, `nosniff`, and `private, no-store` (`frontend/src/features/payments/delivery-headers.ts` lines 1–7).

**Risk.** `listOpenDivisionsForRegistration` takes no actor (`backend/services/registrationService.ts` lines 171–183). The fighter page is behind the layout redirect. The service itself does not. It also returns the full division document, including `filledCount`. The page maps a smaller shape before render. This is an authorization gap at the service boundary, not a cached public leak.

`frontend/src/proxy.ts` was not re-read in this pass. The roadmap says it only checks cookie presence. That claim is **Not verified** in this review.

### Phase 2 — transactions and occupancy

**Verified** in source for the boundaries below. The Atlas suite was **Not verified** again; this review did not connect.

`withTransaction` uses the shared Mongoose connection, runs the callback once per attempt, and calls `endSession()` in `finally` (`backend/db/transaction.ts` lines 23–35). The comment requires sequential work and keeps email, files, and cookies outside the callback.

Seat claim updates only when `filledCount` is a number and `$lt` capacity, then `$inc` 1 (`backend/services/divisionOccupancy.ts` lines 23–37). A missing counter throws `ValidationError` with the backfill message (lines 7–13, 35–36). Release requires `filledCount > 0` (lines 41–51). The schema has `min: 0` and no default (`backend/models/Division.ts` lines 8–10). `createDivision` sets `0` (`backend/services/eventService.ts` line 162). `setDivisionCapacity` reads the counter through `requireFilledCount` before it writes (line 178).

Active statuses are `AWAITING_PAYMENT`, `PENDING_VERIFICATION`, and `CONFIRMED`, with a partial unique index on `{ userId, divisionId }` (`backend/models/Registration.ts` lines 12, 39–40). Create and withdraw run inside `withTransaction` and call `claimSeat` or `releaseSeat` (`backend/services/registrationService.ts` lines 38–56 and 214–221). Payment submit writes the file first, deletes that key if the transaction throws, and sends mail only after commit (`backend/services/paymentService.ts` lines 63–115). Payment decision adjusts the seat only on an active/inactive transition, inside the transaction, and sends mail after (lines 136–180). Request approval claims the target seat before releasing the source, and the failure audit is outside the transaction ( `backend/services/requestService.ts` lines 75–137).

Withdraw calls `recordMatchResult` with the outer session (`registrationService.ts` line 238). `recordMatchResult` uses that session and does not start a second transaction (`matchService.ts` lines 26–30).

Ranking recalculation reads the latest `calculationVersion` inside the transaction and refuses to save a row whose version is already newer (`backend/services/rankingService.ts` lines 36–46). That is compare-and-set logic, not a silent overwrite. Whether two overlapping runs share one version was covered by `backend/db/transactions.integration.test.ts` and was **Not verified** by re-running it.

`updateMatchSchedule` is not in a transaction. It saves the match, then calls `notifyWhatsApp` (`matchService.ts` lines 173–199). WhatsApp is a console log (`backend/notifications/whatsapp.ts` lines 1–5). It is outside SMTP.

### Phase 3 — rendering

**Verified** for structure. The byte and timing table is **Not verified** in this review.

The homepage renders four `<Suspense>` boundaries around the card, events, rankings, and FAQ (`frontend/src/app/(public)/page.tsx` lines 74–85). Brackets use their own boundary (`frontend/src/app/(public)/events/[slug]/brackets/page.tsx` line 31). `ChatbotWidget` is imported by `frontend/src/app/(public)/layout.tsx` line 3. The root layout does not import it (`frontend/src/app/layout.tsx` lines 56–73). `frontend/package.json` dependencies do not include `@tanstack/react-query`. `frontend/src/lib/queryClient.ts` is not in the tree.

`docs/PHASE_3_COMPLETION_REPORT.md` says TTFB and LCP did not improve and that client JavaScript dropped by 23,826 bytes. This review did not recount `.next/static/chunks` and does not adopt that number as evidence.

### Phase 4 — public cache

**Verified** for the cache boundary that was read. Invalidation call sites were located, not executed.

`cacheComponents: true` is set in `frontend/next.config.ts` line 7. Cached readers live in `frontend/src/lib/public-reads.ts`. They call `use cache`, `cacheTag`, and `cacheLife("minutes")`. `cachedPublicDivisions` returns `_id`, `name`, `discipline`, and `capacity` only (lines 50–61). It does not return `filledCount`.

`invalidatePublicTags` calls `updateTag` and ignores the error whose message contains `updateTag can only be called` (`frontend/src/lib/public-tags.ts` lines 5–14). Event creation awaits the service, then invalidates ( `frontend/src/features/events/actions.ts` lines 32–43). The same after-await pattern is in the registration, profile, media, content, ranking, match, and bracket actions. Invalidation is not inside `withTransaction`.

Sessions, admin pages, fighter pages, payment bytes, and profile photos are not in `public-reads.ts`. Photo and screenshot routes stay request handlers.

**Risk.** When `process.env.CI === "true"`, list readers return `[]` and single-record readers throw `NotFoundError` before `connectDB()` (`public-reads.ts` lines 21–22 and the matching checks in the other cached functions). That lets the GitHub build prerender without Atlas. A production build that has `CI=true` will prerender empty public pages. Runtime refill depends on a later revalidation in a process where `CI` is unset and Atlas credentials exist. That runtime behavior is **Not verified**.

Draft exclusion is **Verified** only because the cached functions call `listPublicEvents` and `getEventBySlug`, which filter `PUBLIC_EVENT_STATUSES`. A draft created by an admin still invalidates the `events` tag. The refreshed query does not include the draft.

### Phase 5 — SEO, media, operations

**Verified** in source. The live HTTP checks from the implementation session were **Not verified** again. The production server is not running for this review.

`generateMetadata` reads the cached public event or fighter on the event, brackets, schedule, results, and fighter profile pages. List pages export a static title (`events`, `fighters`, `rankings`, `faq`, `announcements`, `policies`). Login, register, the admin layout, the fighter layout, the rankings demo, and `ui-preview` set `robots: { index: false, follow: false }`.

`frontend/src/app/robots.ts` lines 3–10 disallow `/admin`, `/fighter`, `/api`, `/ui-preview`, and `/rankings/demo`. There is no sitemap URL in that file, so it does not invent a host.

`frontend/src/app/sitemap.xml/route.ts` builds `<loc>` values from path strings. The `http://` in the urlset namespace is the sitemap schema identifier, not a site URL. No `metadataBase` was found in `frontend/src`.

The homepage wordmark and `BrandMark` use `next/image` (`frontend/src/app/(public)/page.tsx` lines 27–28, `frontend/src/components/layout/brand.tsx` lines 1–12). The homepage video sets `preload="metadata"` and `poster="/gallery/grappling-mat.jpg"` (`page.tsx` lines 40–50). Gallery `<img>` tags outside the brand files were not migrated. That matches the phase scope. Classification for gallery photos: **Blocked** on a photography decision, not a Phase 5 miss.

`GET /api/health` pings with `{ ping: 1 }` and returns `{ ok: true }` or `{ ok: false }` (`frontend/src/app/api/health/route.ts` lines 3–11). The `catch` body has no URI and no error message. The route is unauthenticated. That reveals whether the database answers. It does not reveal the connection string. Classification of the body: **Verified**. Classification of exposing reachability: **Risk**, accepted for a health check, not a secret leak.

Response headers are `nosniff`, `strict-origin-when-cross-origin`, `DENY`, and `Content-Security-Policy-Report-Only` (`frontend/next.config.ts` lines 18–42). The policy is report-only. The root layout still inlines JSON-LD (`frontend/src/app/layout.tsx` lines 64–67), and the app depends on `gsap`. An enforced `script-src 'self'` would conflict with that inline script. Leaving the policy report-only is consistent with the code.

The fighter registration page calls `connection()` before `listOpenDivisionsForRegistration`, so the clock read is after request data (`frontend/src/app/(fighter)/fighter/registrations/new/page.tsx`).

## 4. Test and build evidence

| Evidence | Classification |
| --- | --- |
| Source of the eight Atlas cases in `backend/db/transactions.integration.test.ts` | **Verified** that the file exists and that `describe.skipIf(!usesAtlas)` wraps it (line 51). |
| Those tests passed | **Not verified** in this review. They were not run. Running them would connect to Atlas. |
| `npx tsc --noEmit` and `npm run build` after Phase 5 | **Not verified** in this review. They were not re-run. |
| Client JavaScript byte delta | **Not verified.** |

What the test file does, from source:

- It reads `MONGODB_URI` from the environment or from `frontend/.env.local`, `frontend/.env`, or the repo `.env` (`transactions.integration.test.ts` lines 8–43). It does not print the URI. Connection errors are redacted (lines 56–58).
- `usesAtlas` is false for a missing URI and for any URI containing `127.0.0.1` or `localhost` (line 44). CI's dummy URI is localhost, and `npm test` in the workflow has no URI, so the suite skips in GitHub Actions. That skip is **Verified** from the condition. A green CI run would not prove the transaction tests passed.
- When the URI is an Atlas URI, the pathname is rewritten to `/upnrol_txn_test` before `connectDB()` (lines 37–46).
- `afterAll` returns without dropping if the connection is down, and throws if the open database is not `upnrol_txn_test` (lines 62–69).

A local `npm test` on a machine that has `frontend/.env.local` will connect and then drop `upnrol_txn_test`. That is isolated from whatever database name is in the original URI only because of the pathname rewrite. This review did not confirm the application database name, because reading `.env.local` would expose the URI.

## 5. Production blockers

These block a production cut. A local webpack build does not clear them.

| Blocker | Evidence | Class |
| --- | --- | --- |
| Occupancy not backfilled | `claimSeat` rejects a missing number. The script was not run. | **Risk** |
| Console email in every environment | `getEmailAdapter` always returns `ConsoleEmailAdapter` (`backend/email/console.ts` lines 10–12). No `NODE_ENV` guard. | **Risk** |
| Local disk is the only store, including if `NODE_ENV` is production | `getStorageAdapter` always returns `LocalDiskStorageAdapter` (`backend/storage/local-disk.ts` lines 62–64). | **Risk** |
| No production domain | No `metadataBase`. Sitemap locations are paths. | **Blocked** |
| Branch not on the remote | `origin/suraj` is `1d13b5f`. Eight commits are local. | **Risk** |
| GitHub Actions not observed | Workflow file exists. No run was inspected. | **Not verified** |
| CI prerender is empty | `public-reads.ts` returns empty data when `CI=true`. | **Risk** |
| Report-only CSP | Headers do not enforce script, frame, or connect policy. | **Risk** |
| Unauthenticated health | Reachability only. | **Risk**, low |
| `listOpenDivisionsForRegistration` has no actor | Service lines 171–183. | **Risk** |

## 6. Database backfill readiness

**Partially verified.** The script is safe against a mismatched counter. It is not safe to run blindly, and it is not isolated from the application database by its own code.

`scripts/backfill-division-occupancy.ts` calls `connectDB()` then `applyDivisionOccupancyBackfill()`. `npm run backfill-occupancy` loads `frontend/.env.local` (`frontend/package.json` line 14). Unlike the tests, it does not rewrite the database name. The database it writes is whatever path is in that URI.

`inspectDivisionOccupancy` counts registrations in `ACTIVE_REGISTRATION_STATUSES` per division (`backend/db/backfillDivisionOccupancy.ts` lines 12–28). `applyDivisionOccupancyBackfill` throws before any write when any stored number disagrees (lines 36–42). Updates use `filledCount: { $exists: false }` and `$set` the counted value (lines 45–49). A second run does not overwrite a counter that was stored. The script is not imported from application startup.

Remaining hazards, all from reading the script:

- There is no dry-run command. The npm script always applies.
- The count and the `$set` are not one transaction. A registration that commits between those two steps can leave the new counter wrong, and the next run will then refuse to fix it because the stored number disagrees. Run it only while registration writes are stopped.
- A crash mid-loop leaves some missing counters filled and others not. A later run can finish the missing ones if nothing drifted.
- It logs division ids and names. It does not log the URI. This review did not execute it and did not open `.env.local`.

Backup and restore are documented in `docs/deployment/backup-restore.md`: `mongodump` / `mongorestore`, with a warning not to restore into the production URI without checking the target. The same document says screenshot bytes are not in the dump while they live on disk. No backup was taken in this review. Classification of the procedure: **Verified** as documentation. Classification of a restorable backup existing: **Not verified**.

The application database and `upnrol_txn_test` are distinguishable in the test file. They are not distinguishable inside the backfill. An operator must read the database name from the URI themselves before running the script. This review deliberately did not.

## 7. SMTP implementation plan

**Verified** that the port and the call sites exist. **Blocked** on approving the Nodemailer dependency and on real SMTP settings. This review did not install Nodemailer and did not invent credentials.

The port is `EmailAdapter.send({ to, subject, body })` (`backend/email/types.ts` lines 7–9). There is no Nodemailer import anywhere in the repo.

Call sites, all after the transaction returns:

| Site | When |
| --- | --- |
| `backend/services/paymentService.ts` lines 111–115 | After payment submit commits. The `catch` deletes the screenshot and rethrows, so mail is not sent on abort. |
| `backend/services/paymentService.ts` lines 171–180 | After payment decision commits. |
| `backend/services/requestService.ts` lines 135–144 | After request decision commits. The failure audit is in the `catch`, before the throw, and does not send mail. |

No other `.send(` email call was found. WhatsApp is a separate console helper and is not part of this port.

Smallest implementation, after approval:

1. Add `backend/email/smtp.ts` implementing `EmailAdapter` with Nodemailer. Mark the module `server-only`.
2. Change `getEmailAdapter()` so development keeps `ConsoleEmailAdapter` and does not require SMTP variables.
3. In production, throw at first selection if the adapter would have been the console adapter, or if `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, or `SMTP_FROM` is missing. Do not fall through to console.
4. Leave the three call sites where they are. Do not move `send` into `withTransaction`.
5. Do not add Resend or another hosted email SDK. Do not change the strings the services already pass. Copy remains OD-009.
6. Stop before `npm install` if Nodemailer is not approved. Do not write a raw SMTP socket client as a substitute.

Provider choice and credential values stay outside the repo.

## 8. GridFS decision status

**Blocked.** Section H of `docs/MASTER_ENGINEERING_ROADMAP.md` is an evaluation, and the roadmap says it is not approval to write code. This review does not change that.

Re-read against the current adapter:

- The port is still `put`, `getSignedUrl`, `get`, and `delete` (`backend/storage/types.ts` lines 7–15).
- `get` reads the whole file into a `Buffer` (`backend/storage/local-disk.ts` lines 44–48).
- `getSignedUrl` returns `local-storage://…` and is not an HTTP URL (lines 51–53).
- Payment bytes are written before the transaction and deleted if it throws (`paymentService.ts` lines 63 and 107). That matches the section H rule that chunk writes stay outside the retryable callback.
- Profile photos and screenshots are the private objects. Brand images and the homepage video are files under `frontend/public`. Section H still says those public files should stay on Next. That split still matches the code.
- No `GridFSBucket` import exists. No storage package was added.
- `docs/deployment/backup-restore.md` is correct for today's disk files and would be wrong after GridFS, because the binaries would then be inside the database dump. The backup doc should be updated in the same change that introduces GridFS, not before.

Section H remains the right proposal: same Atlas database, no second vendor, metadata is not the authorization check, no automatic copy from `.local-storage`, production must fail closed if the driver is unset or `local`. That fail-closed guard is also not implemented. Until both the section H acceptance and that guard exist, production cannot treat local disk as the private store.

## 9. Phase 7 dependency analysis

**Verified** that the suspected cycle is not a cycle. A folder move is not justified.

Imports that were read:

- `backend/services/registrationService.ts` line 10 imports `toAdminFighterView` from `fighterService`.
- The same file line 13 imports `recordMatchResult` from `matchService`.
- `backend/services/fighterService.ts` line 6 imports `listPublicMatchHistory` from `matchService`.
- `matchService.ts` imports models, `PUBLIC_EVENT_STATUSES` from `eventService`, and the transaction helper. It does not import `registrationService` or `fighterService`.
- `eventService.ts` imports `divisionOccupancy` and does not import `registrationService` or `matchService`.
- `dashboardService.ts` imports both `registrationService` and `matchService`. Neither of those imports `dashboardService`.

The graph is `registrationService → fighterService → matchService` and `registrationService → matchService`. Nothing points back. There is no initialization-order cycle in these modules.

The real coupling is behavioral. `withdrawRegistration` needs a match result written on the same session so a withdrawal does not open a nested `withTransaction`. That is already how `recordMatchResult` behaves when `existingSession` is passed (`matchService.ts` lines 26–30).

A narrow inversion would extract something like `applyWithdrawalResult(actor, matchId, winnerId, session)` into a module that does not import registration. That is optional cleanup. It does not fix a current cycle, and it should not be done as a drive-by. Folder restructuring is not necessary.

Phase 7 should be a check that fails if `matchService` starts importing `registrationService`, not a move of directories.

## 10. Prioritized next actions

1. Do not deploy this checkout. Keep serving from the current host only if that host is still the pre-phase environment the operator already accepted.
2. Before any registration traffic against existing divisions, stop writes, confirm the database name in the URI, and run `npm run backfill-occupancy` from `frontend/`. If it prints a disagreement, fix the data by hand. Do not loosen the script to overwrite.
3. Push `suraj` only when asked, then confirm the GitHub Actions run. Remember that a green test job does not include the Atlas transaction suite, because CI skips it.
4. Approve or reject Nodemailer. If approved, implement section 7 and keep console email out of production.
5. Decide section H separately. Do not start GridFS in the SMTP commit. Until that decision, add the production refusal of local disk only when the replacement driver is actually selected. A refusal with no replacement makes production unable to boot, which is the intended fail-closed state and needs an operator decision before it is turned on.
6. Add the Phase 7 import check around `matchService` and `registrationService`. Do not move folders.
7. Put an actor argument on `listOpenDivisionsForRegistration` when the next security pass touches that file.
8. Leave canonical URLs, email copy, fees, and the other open product decisions untouched until the client decides them.

## 11. Explicit approvals required

| Approval | Why it is still required | This review |
| --- | --- | --- |
| Nodemailer dependency | No SMTP client is installed. Node does not provide one. | Not granted here. |
| SMTP host, port, user, password, and from-address | Roadmap names the variables. Values are not in the repo and must not be invented. | Not granted here. |
| Email copy beyond the three existing bodies | OD-009. | Not granted here. |
| Section H as permission to write a GridFS adapter | AD-FILE-2. Evaluation is not implementation approval. | Not granted here. |
| Production fail-closed on local disk before a GridFS driver exists | Boot would fail with no store. | Not granted here. |
| Running `npm run backfill-occupancy` | Writes `filledCount` on the database in `.env.local`. | Not granted here. Not executed. |
| Push of the 8 local commits | Remote is still `1d13b5f`. | Not granted here. |
| Production domain | Required before `metadataBase`, canonical links, and absolute sitemap URLs. | Not granted here. |
| Enforced Content-Security-Policy | Report-only is what the current GSAP and JSON-LD code can tolerate. | Not granted here. |
| Product decisions OD-001–OD-010 and OD-014 | Unchanged. | Not granted here. |
| Retention sweeper and field encryption | OD-011 and the encryption plan. | Not granted here. |

A green local build, including the one observed while Phase 5 was implemented, does not mean this system is ready for production.
