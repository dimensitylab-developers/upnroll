# Up 'n Roll — status update

Date: 6 November 2026. Branch: `suraj`. Not pushed.

Phases 0 through 5 of the master engineering programme are implemented. Phases 6 and 7 are not. The application database was not migrated. The occupancy backfill was not run.

| Commit | What landed |
| --- | --- |
| `1d13b5f` | Phase 1 security: actor checks, public field lists, upload limits |
| `55228da` | Phase 0: request dedupe, draft schedules hidden, Windows `predev`, CI |
| `a548ae9` | Phase 2: transactions and atomic seat claims |
| `c1ac4f8` | Phase 3: streaming public sections, React Query removed |
| `611dd2e` | Phase 4: public cache tags and invalidation after commit |
| `5e7b281` | Phase 5: public metadata, path sitemap, health, report-only headers |

The detailed write-ups are `docs/PHASE_1_COMPLETION_REPORT.md`, `docs/PHASE_2_COMPLETION_REPORT.md`, `docs/PHASE_3_COMPLETION_REPORT.md`, and the Phase 4 and Phase 5 sections of `docs/MASTER_ENGINEERING_ROADMAP.md`.

## What the app is

Next.js 16 App Router, React Server Components, and Server Actions. The `backend/` TypeScript library is imported as `@/server/*`. MongoDB Atlas and Mongoose are the only system of record. Sessions are custom HMAC cookies. Passwords use scrypt. Authorization uses a readonly actor taken from a validated server session. Files stay on local disk. Email stays on the console adapter. There is no REST API for the product, and no second database.

The production build is `npm run build` in `frontend/`, which runs `next build --webpack`.

## Done

### Phase 0 — reliability

`getSession` and `listPublicEvents` are wrapped in React `cache()`, so one request does not load them twice. Public schedule and results use the same published statuses as the public event query, so drafts stay off those pages. `predev` is a Node script that can create the root `node_modules` link on Windows. CI is `.github/workflows/ci.yml`: Node 22, `npm ci` from `frontend/`, typecheck, Vitest, and the webpack build. GitHub Actions has not been run for this branch yet.

### Phase 1 — security

Protected services take a readonly actor. The session handed to application code does not include the password hash. Public reads use field allowlists. Payment screenshots are capped at 3 MB and must match PNG, JPEG, or WEBP bytes. Storage keys stay inside the storage root. Private file responses send `nosniff`. `server-only` marks session, service, and storage modules. `frontend/src/proxy.ts` only checks that a session cookie is present before `/fighter` and `/admin`. It is not the authorization check.

### Phase 2 — transactions and occupancy

Registration create and withdraw, payment review, bracket generate-and-publish, ranking recalculation, and registration-request decisions each run in one transaction on the existing Mongoose connection. The helper ends the session in `finally`. Email, filesystem writes, cookies, and WhatsApp stay outside the retryable callback. A payment screenshot written before the transaction is deleted if the transaction aborts. A failed email after commit does not delete that file.

`Division.filledCount` has no schema default. A missing counter is a validation error. A seat is claimed only when the counter is a number and is below capacity. A seat is released only when the counter is above zero. The counter moves on every active/inactive transition. Capacity cannot be set below the current occupancy. Ranking writes do not overwrite a newer `calculationVersion`. The ranking formula and single-elimination brackets are unchanged.

`npm run backfill-occupancy` from `frontend/` is the manual repair. It stops and writes nothing if any stored counter disagrees with the active registration count. It only fills missing counters. It was not run. Existing divisions without `filledCount` will reject registration changes until an operator runs it.

Transaction tests use Atlas database `upnrol_txn_test` and drop only that database. They do not download a MongoDB binary and they do not write the application database.

### Phase 3 — rendering

The homepage sends the shell first. The card, events, rankings, and FAQ stream inside Suspense. Division brackets do the same. The support chat is on the public layout only. Sign-in does not render it. `@tanstack/react-query` is removed.

Measured on a warm production server: TTFB and LCP did not improve. Client JavaScript dropped by 23,826 bytes (77 files, 1,441,780 bytes down to 1,417,954 bytes).

### Phase 4 — public cache

`cacheComponents` is on. Published public reads use `use cache`, `cacheLife("minutes")`, and `cacheTag`. Server Actions call `updateTag` after a successful commit, not inside the transaction. Cached division lists expose name, discipline, and capacity. They do not expose occupancy.

Not cached: sessions, fighter and admin data, payments, private files, Aadhaar, and medical fields. Drafts stay out because the cached functions call the existing public queries. Public routes prerender with a 1 minute revalidate and a 1 hour expiry. Private photo and screenshot routes stay dynamic.

### Phase 5 — SEO, media, operations

Public event, bracket, schedule, results, and fighter pages set titles from those cached records. List pages set their own titles. `robots.ts` disallows `/admin`, `/fighter`, `/api`, `/ui-preview`, and `/rankings/demo`. Login, register, both portals, the seeding demo, and the preview page are `noindex`.

`/sitemap.xml` lists public paths. Locations have no host. There is no `metadataBase` and no canonical URL, because there is no production domain yet.

The wordmark and mark use `next/image`. The homepage video uses `preload="metadata"` and `poster="/gallery/grappling-mat.jpg"`.

`GET /api/health` pings MongoDB and returns `{ "ok": true }` or `{ "ok": false }`. The body has no URI and no error text. A production check returned `200` and `{"ok":true}`.

Every response sends `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and `Content-Security-Policy-Report-Only`. The policy stays report-only. GSAP and the inline JSON-LD would violate an enforced script policy.

When `CI=true`, cached public reads return an empty collection, or a not-found error for one record, so the GitHub build can prerender without Atlas. A database error outside CI still fails the build. The fighter registration page reads the request with `connection()` before it reads the clock, so prerender does not freeze "now".

## Latest checks

From `frontend/` on 6 November 2026, after Phase 5:

| Check | Result |
| --- | --- |
| `npx tsc --noEmit --pretty false` | exit 0 |
| `npm test` | 24 files, 147 tests passed |
| `npm run build` | exit 0 |

The homepage wordmark rendered through `next/image`. The event page title for Underground Arena Vol. 4 was that event's name.

## Still open

- Phase 6. Own SMTP on the existing `EmailAdapter`. No mail package is installed. Production still uses the console adapter. Adding a package needs an explicit decision before it is installed. GridFS is evaluated in the roadmap and is not implemented. Production still stores files on local disk.
- Phase 7. Import-boundary check only. No folder move. The candidate cycle is `registrationService` calling `matchService` on withdraw. It has not been changed.
- Occupancy backfill. Run `npm run backfill-occupancy` from `frontend/` before registration against existing divisions. Do not point it at a database other than the application database, and do not run it as part of startup.
- Canonical URLs and absolute sitemap URLs, until a production domain exists.
- Product decisions OD-001 through OD-010 and OD-014: disciplines, classes, extra bracket formats, ranking formula, fees, UTR format, QR artwork, cancellation policy, refunds, email copy, content workflow, and brand photography. The recorded cancellation refund remains 50% when the request is at least 30 days before the event starts.
- Hosting provider, SMTP credential values, retention sweeper, and Aadhaar or medical encryption.
- This branch has not been pushed, and the GitHub Actions workflow has not been executed.
