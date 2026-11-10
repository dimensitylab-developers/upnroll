# Up 'n Roll — Master Engineering Roadmap

Status: Phases 0–5 implemented. SMTP is implemented with Nodemailer 10.3.1. GridFS is the preferred private-file architecture. Its implementation design is not approved, and no GridFS code exists. Hosting is not selected. Phase 1 was re-verified on the James merge.

This document replaces the chat plan from the master programme. It includes the approved architecture amendment: Atlas plus Mongoose only, own SMTP, GridFS as the preferred private store once an implementation design is approved, and a server-first performance bar. The platform is not production-ready.

Branch: `suraj`. Phases 0–5 are implemented. The SMTP half of Phase 6 is implemented. The import-boundary check from Phase 7 is implemented. GridFS is not. Phase 1 was re-verified after the James merge (`8165cda`).

## Approved decisions

These are approved. Implementation still follows the phase order below.

| ID | Decision |
| --- | --- |
| AD-DB-1 | MongoDB Atlas is the system of record. Mongoose on the existing connection is the only application database. No Firebase, Supabase, PostgreSQL, or second database. |
| AD-DB-2 | Transactions use that same connection. No external persistence service for business data. |
| AD-DB-3 | MongoDB Atlas remains the only system of record. The existing Mongoose connection remains the shared connection. Transactions stay on that connection. No Firebase, Supabase, PostgreSQL, or second database. |
| AD-MAIL-1 | Email is our own SMTP. Resend is not approved. No paid email vendor. |
| AD-MAIL-2 | An SMTP adapter implements the existing `EmailAdapter` port. Console email is development only. Production must fail on startup if the console adapter is selected. |
| AD-MAIL-3 | SMTP credentials come from server environment variables. They are never sent to a client bundle. No credentials are invented in the repo. |
| AD-MAIL-4 | `send()` runs only after the related MongoDB transaction commits. It is never called inside a `withTransaction` callback. |
| AD-FILE-1 | GridFS on the existing Atlas database is the preferred production store for private payment screenshots and fighter profile photos. No object-storage vendor. No second database. Public brand assets, gallery images, and the homepage video stay in the Next.js public directory. |
| AD-FILE-2 | Section H is `Preferred architecture — implementation design and approval pending.` GridFS is not implemented and is not production-ready. Code waits for a separate implementation design. |
| AD-FILE-3 | Local disk remains the development store. Existing `.local-storage` files stay where they are. No automatic copy is authorized. Production must select storage explicitly. A production boot refusal of local disk stays off until a replacement adapter is implemented and configured. |
| AD-HOST-1 | No hosting provider or deployment topology is selected. A multi-instance or serverless production deployment must not proceed while private files depend on local disk. GridFS must be implemented and verified first. |
| AD-APP-1 | Server Components load initial data by calling backend services directly. No internal HTTP hop. No `useEffect` fetch for first paint. React Query is unused and is removed in Phase 3. |
| AD-APP-2 | Mutations stay Server Actions. Authorization stays in backend services. Interactive leaves stay small Client Components. |
| AD-CACHE-1 | Cross-request cache is only for public, non-personalized, published data, and only after Phase 0 and Phase 2. Sessions, fighter and admin areas, payments, private files, Aadhaar, and medical data are never cached. Invalidation runs after a successful commit. |
| AD-PERF-1 | Performance claims require before-and-after measurements recorded in the phase report. |

## Unresolved implementation details

These are not guessed.

| Item | Why it is still open |
| --- | --- |
| SMTP library | Approved and installed. `frontend/package.json` depends on `nodemailer@^10.3.1`. The lockfile resolves `10.3.1` (MIT-0). The package ships its own types. `@types/nodemailer` is not installed. |
| SMTP settings | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` are read from the environment. Values are not in the repo. SMTP2GO is the preferred provider candidate. Credentials, DNS verification, and a real delivery test are still pending. Delivery has not been verified. |
| Hosting | Not selected. Provider, single-instance versus multi-instance, persistent disk, deployment platform, runtime and resource limits, backup responsibility, a shared rate-limit store, and a monitoring provider are all unresolved. Do not assume a vendor. |
| Email copy | OD-009. The adapter sends the strings the services already build. |
| GridFS implementation | Preferred architecture. Implementation has not started. A separate design must be written and approved before code. The design must cover bucket configuration, file metadata, streaming upload and download, file size and MIME validation, protected delivery, cleanup and orphans, backup and restore, failure recovery, and integration tests. |
| GridFS inside a transaction | Uploads stay outside the retryable callback. If the business transaction fails after the upload, delete that file. Chunk writes inside `withTransaction` can replay the upload. That option stays closed unless a later design accepts idempotent keys. |
| `StorageAdapter.get` shape | Today it returns a full `Buffer`. GridFS can stream. Changing the port is part of the GridFS implementation approval, not this revision. |
| Retention and deletion | OD-011. Compensation deletes (failed payment or registration) are allowed. A retention sweeper is not. |
| Canonical production domain | Not configured. Canonical URLs and absolute sitemap URLs wait. |
| Product decisions OD-001–OD-010, OD-014 | Unchanged. Do not invent disciplines, classes, bracket formats, ranking formula, fees, UTR format, QR artwork, cancellation policy, refunds, or brand photography. |
| OD-012 | Narrowed, not closed. Email is own SMTP, with SMTP2GO as the preferred provider candidate. Private files prefer GridFS over a vendor. Hosting provider, topology, and the rest of the deploy shape are still open. |
| OD-013 | `proxy.ts` already exists. The decision log can be marked implemented when docs are next edited. It does not block engineering. |
| Aadhaar and medical encryption | Blocked until a schema, key holder, rotation, and migration plan exist. |

## A. Current state

| Phase | State |
| --- | --- |
| 0 Reliability | Implemented. `getSession` and `listPublicEvents` use React `cache()`. Schedule and results query `PUBLIC_EVENT_STATUSES`. `predev` is `node ./scripts/ensure-root-modules.mjs`. CI is `.github/workflows/ci.yml`. |
| 1 Security | Re-verified on the James merge. Typecheck passed, Vitest passed (23 files, 139 tests), production webpack build passed. The request-decision tests needed an Event mock and `save` on the request stub because cancellation now reads the event. No service behavior was changed for that fix. |
| 2 Transactions | Implemented. Registration, payment review, brackets, rankings, and request decisions run in one transaction on the existing Atlas connection. `filledCount` is claimed with a conditional update. The manual backfill was not run against the application database. |
| 3 Rendering | Implemented. Homepage sections and division brackets stream in Suspense. React Query is removed. The support chat is on the public layout only. Measured in `docs/PHASE_3_COMPLETION_REPORT.md`. TTFB and LCP did not improve. Client JavaScript dropped by 23,826 bytes. |
| 4 Public cache | Implemented. Published public reads use `use cache` with tags. `updateTag` runs in Server Actions after the mutation commits. Admin, fighter, session, payment, and private file routes are outside that cache. Drafts stay out because the cached reads call the public queries. |
| 5 SEO, media, operations | Implemented. Public pages expose titles from public DTOs. `robots.ts` disallows portals and the demo. Login, register, admin, fighter, demo, and preview are `noindex`. The sitemap lists public paths without a host. Local brand files use `next/image`. The homepage video preloads metadata and has a poster. `GET /api/health` returns `{ ok: true }` or `{ ok: false }`. Responses send nosniff, a referrer policy, frame denial, and a report-only content security policy. Canonical URLs wait on a domain. |
| 6 SMTP | Implemented. Nodemailer 10.3.1 sends through `EmailAdapter` when a production server is running. Development keeps `ConsoleEmailAdapter`. Missing production SMTP settings throw at startup and at `getEmailAdapter()`. The production build phase does not require those settings. Call sites are unchanged and stay after commit. |
| 6 GridFS | Preferred architecture. Implementation has not started. Section H is `Preferred architecture — implementation design and approval pending.` The running adapter is still local disk, for development. Production does not refuse local disk, because no replacement adapter exists. |
| 7 Boundaries | The import check is implemented. `matchService` must not import `registrationService`. No folders were moved. No circular import was present to remove. |

Phase 0 evidence, run from `frontend/` on 6 Nov 2026: `npx tsc --noEmit` exit 0, `npm test` 139 passed, `npm run build` exit 0 (`next build --webpack`). The dev server was stopped so the build could write `.next`. CI itself has not been executed on GitHub.

`getEmailAdapter()` returns `ConsoleEmailAdapter` in development, test, and during `next build`. A production server uses the SMTP adapter and throws if the five SMTP variables are missing. `getStorageAdapter()` always returns `LocalDiskStorageAdapter` (`.local-storage`). Payment screenshots and fighter photos use `put` / `get`. `getSignedUrl` returns `local-storage://…` and is not a public URL. Route handlers authorize the read, then buffer the whole file. Screenshot bytes are written before the payment documents. `delete` swallows a missing file. There is no retention job.

The verification commands above are the current evidence. Do not treat an older completion report as a newer run.

## B. Dependency map

```text
Phase 1 (present, re-verify)
    │
    ├─ Phase 0  request cache, hide drafts, Windows dev, CI
    │
    ├─ Phase 2  transactions and filledCount
    │      │
    │      └─ Phase 4 public cache   (also needs Phase 0 draft hiding)
    │             invalidation after commit
    │
    ├─ Phase 3  server-first rendering, Suspense, drop unused React Query
    │      measured before and after
    │
    ├─ Phase 5  SEO, media, health, headers
    │      canonicals wait on a domain
    │
    ├─ Phase 6  SMTP adapter (implemented; delivery not verified)
    │             GridFS preferred; implementation design still required
    │             production refuses the console adapter
    │
    └─ Phase 7  import boundaries, no folder move

Encryption stays off this sequence.
```

Phase 6 SMTP work does not wait on GridFS. GridFS code does not start until the implementation design in section H is approved. A multi-instance or serverless production deploy does not start while private files still use local disk. Phase 4 does not start before Phase 0 and Phase 2.

## C. Implementation matrix

### Phase 0 — Reliability

Done. `getSession` and `listPublicEvents` are wrapped in React `cache()`. `listPublicSchedule` and `listPublicResults` load only `PUBLIC_EVENT_STATUSES`, the same set as `getEventBySlug`. `predev` no longer calls `ln`. If the repo root already has a real `node_modules`, the script leaves it. If it is missing, the script links `frontend/node_modules` with a Windows junction or a Unix symlink. CI uses `frontend/package-lock.json`, then typecheck, Vitest, and `npm run build`.

Rollback: revert `backend/auth/session.ts`, `backend/services/eventService.ts`, `backend/services/matchService.ts`, `frontend/package.json`, `frontend/vitest.config.ts`, `frontend/scripts/ensure-root-modules.mjs`, and `.github/workflows/ci.yml`.

### Phase 1 — Security

Re-verified. Typecheck, the full Vitest suite, and the production webpack build passed. The only code change was the request-decision test double: James's cancellation path reads the event and saves the request, and the stub did not provide either. Service authorization was not changed.

### Phase 2 — Transactional integrity

Unchanged approval: one helper on the existing mongoose connection, sequential operations, `endSession()` in `finally`, email and files outside the callback.

`Division.filledCount` is claimed with a conditional update. Missing counters are not treated as zero. Backfill is a manual script that stops on mismatch and is not run on startup or against Atlas by this programme. The counter moves with every active/inactive transition, including rejection, resubmit, cancellation, withdrawal, and transfer. Capacity cannot drop below `filledCount`.

Ranking math stays `winLossPointsStrategy`. Persistence writes only when `calculationVersion` is still the version read inside the transaction.

Transaction tests use the existing Atlas cluster on a separate database, `upnrol_txn_test`, and drop that database when they finish. They do not write to the application database and they do not download a local MongoDB binary.

Implemented on 6 Nov 2026. Evidence, from `frontend/`: `npx tsc --noEmit` exit 0, `npm test` 24 files / 147 tests passed, `npm run build` exit 0 (compiled in 21.5s). The dev server was stopped so the build could write `.next`. The occupancy backfill script was not executed. Existing divisions that have no `filledCount` will refuse registration changes until an operator runs `npm run backfill-occupancy` from `frontend/`. Run that before relying on registration in production. Details are in `docs/PHASE_2_COMPLETION_REPORT.md`.

### Phase 3 — Server-first rendering and client performance

Objective: initial data from Server Components calling services, Suspense for independent sections, no serial waterfall where the reads are independent, small client leaves, chatbot only on public routes.

Remove `QueryClientProvider`, `frontend/src/lib/queryClient.ts`, and `@tanstack/react-query` after confirming no `useQuery` or `useMutation` remains. That search is already clean outside `queryClient.ts`; re-check at implementation time.

Do not convert server pages into client components. Do not add a data-fetching library. Transactions stay sequential even when page reads are parallel.

Measure before and after, and write the numbers in the phase report:

- server response and TTFB for `/`, `/events`, and one event detail
- LCP for `/`
- client JavaScript and the route chunks from `next build`
- hydration cost of the remaining client leaves
- duplicate queries for `getSession` and `listPublicEvents` on `/` (Phase 0 should already make these one each)
- server time spent in the homepage service reads

No improvement is claimed without those numbers.

Implemented on 6 Nov 2026. The numbers are in `docs/PHASE_3_COMPLETION_REPORT.md`. TTFB and LCP did not improve. Client JavaScript fell from 1,441,780 bytes to 1,417,954 bytes.

### Phase 4 — Public cache

Unchanged gate and scope. `cacheComponents`, `use cache`, `cacheLife`, `cacheTag`, `updateTag`.

Cached only after publication checks: public events, published brackets, public schedule and results, public fighter directory and public profile DTO, public rankings, published content and media.

Never cached: sessions, fighter dashboards, admin pages, payments, private files, Aadhaar, medical data.

`updateTag` runs after the transaction commits, not inside the callback.

Implemented on 6 Nov 2026. `cacheComponents` is on. Public reads live in `frontend/src/lib/public-reads.ts` and are tagged `events`, `event:{slug}`, `divisions:{eventId}`, `brackets:{divisionId}`, `schedule`, `schedule:{slug}`, `rankings`, `fighters`, `fighter:{slug}`, `content:{type}`, and `media`. The cached division list exposes name, discipline, and capacity. It does not include occupancy, Aadhaar, or medical fields. Server Actions call `invalidatePublicTags` after a successful commit. The production build lists public routes as partial prerender with a 1 minute revalidate. Private photo routes stay dynamic. `npm test` passed 147 tests and `npm run build` exited 0.

### Phase 5 — SEO, media, operations

Implemented on 6 Nov 2026. `generateMetadata` reads the cached public event, bracket, schedule, results, and fighter DTOs. List pages set a title. `robots.ts` disallows `/admin`, `/fighter`, `/api`, `/ui-preview`, and `/rankings/demo`. Login, register, the admin layout, the fighter layout, the seeding demo, and the preview page are `noindex`. `sitemap.xml` lists public paths only. The sitemap namespace URL is the schema identifier; locations have no host. Brand marks use `next/image`. The homepage video uses `preload="metadata"` and `poster="/gallery/grappling-mat.jpg"`. `GET /api/health` pings MongoDB and returns `{ ok: true }` or `{ ok: false }` with no URI. Every response sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and `Content-Security-Policy-Report-Only`. The policy stays report-only because GSAP and the inline JSON-LD would violate an enforced script policy. Cached public reads return an empty collection, or `NotFoundError` for a single record, when `CI=true`, so the GitHub build can prerender without Atlas. A database error outside CI still fails the build. The open-registration page calls `connection()` before it reads the clock. Production build exit 0. `npm test` passed 147 tests. A production server returned health `200 {"ok":true}`, path-only sitemap locations, the headers above, and the event title `Underground Arena Vol. 4`.

Blocked: `metadataBase`, canonical URLs, absolute sitemap URLs, until a domain is provided.

### Phase 6 — SMTP and GridFS

Two different authorizations.

SMTP is implemented. See `docs/PHASE_6_COMPLETION_REPORT.md`.

- `backend/email/smtp.ts` implements `EmailAdapter` with Nodemailer. Development and test keep `ConsoleEmailAdapter`. `frontend/src/instrumentation.ts` calls `assertProductionEmailConfig()` when the Node.js server starts.
- A production server throws when `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, or `SMTP_FROM` is missing, both at startup and again from `getEmailAdapter()` if a send is attempted. `NEXT_PHASE=phase-production-build` is not a running server, so `next build` does not need credentials.
- Payment submit, payment decision, and registration-request decision still call `getEmailAdapter().send()` after the transaction commits. The strings they pass are unchanged.
- Nodemailer `10.3.1` is the installed release. No Resend package was added. No SMTP values were committed.

GridFS is the preferred production architecture for private screenshots and fighter photos. Implementation has not started. Section H is `Preferred architecture — implementation design and approval pending.` Local disk remains the development store. Existing `.local-storage` files are not copied or deleted. Production must not silently use local disk on ephemeral or multi-instance infrastructure. The boot refusal of local disk stays off until a replacement adapter is implemented and configured. SMTP2GO is the preferred mail provider candidate. Real delivery has not been verified. Production must not fall back to the console adapter.

### Phase 7 — Boundaries

No folder migration. `registrationService` imports `recordMatchResult` from `matchService` and passes the outer session, so withdraw does not open a nested transaction. `matchService` does not import `registrationService`. That direction was inspected and is not a cycle.

`backend/services/import-boundary.test.ts` fails if `matchService.ts` gains a static or dynamic import of `registrationService`. No service files were moved.

## D. Decision register

### Approved engineering

Phase 0 scope, Phase 2 transactions and `filledCount`, actor authorization, webpack build, server-first data loading, removal of unused React Query, cache rules, SMTP on the existing port, production refusal of console email, Atlas as the only database, and the existing Mongoose connection for transactions.

### Approved direction, implementation still gated

GridFS for private payment screenshots and fighter profile photos, on the existing Atlas database. Status: `Preferred architecture — implementation design and approval pending.` Public brand files stay on Next.js. Local disk stays for development. No automatic migration. No production boot refusal until a replacement adapter is implemented and configured. SMTP2GO is the preferred mail provider candidate. Delivery is not verified.

### Product, still blocked

OD-001 disciplines, OD-002 classes, OD-003 extra formats, OD-004 ranking formula, OD-005 fees, OD-005a UTR format, OD-006 QR artwork, OD-007 cancellation policy, OD-008 refunds, OD-009 email copy, OD-010 content workflow, OD-014 brand photography.

### Infrastructure, still blocked

Hosting provider, single-instance versus multi-instance, persistent disk, deployment platform, runtime and resource limits, backup responsibility, shared rate limiting, and monitoring provider. Production domain. SMTP2GO credentials and DNS verification. A multi-instance or serverless production deployment is gated until GridFS is implemented and verified.

### Security, still blocked

OD-011 retention. Field encryption, key management, rotation, and recovery.

## E. Execution sequence

1. Re-verify Phase 1 on the James merge. Fix only breakage.
2. Phase 0, one commit.
3. Phase 2, two commits: transaction boundaries, then `filledCount`, manual backfill, and replica-set tests.
4. Phase 3, one commit, with the measurement table in `docs/PHASE_3_COMPLETION_REPORT.md`.
5. Phase 5 unblocked items, one commit. No invented domain.
6. Phase 4, one commit, after 0 and 2.
7. Phase 6 SMTP adapter and production email guard, one commit. GridFS code stays out.
8. GridFS only after the section H implementation design is approved, as its own commit, with a migration note and no automatic copy of `.local-storage`.
9. Phase 7 only if an import violation is real.

Each phase runs typecheck, the existing Vitest suite, its new tests, and a production build. Phase 2 also runs the replica-set suite. Failed integration tests are not replaced with mocks.

## F. Risk register

| Risk | Control |
| --- | --- |
| Capacity drift | `filledCount` updates in the same transaction as the status change. Backfill aborts on mismatch. Missing counter is an error. |
| Accidental Atlas migration | Backfill is manual. This programme does not execute it. |
| Email or upload retried inside `withTransaction` | Send and binary writes stay outside the callback. Failed business commit deletes a file written beforehand. |
| Ranking overwrite | Compare-and-set on `calculationVersion` inside the transaction. |
| Draft content cached or listed | Phase 0 filter before Phase 4 and before the sitemap. |
| SMTP secrets in the client | Adapter is `server-only`. Env is read on the server. CI does not print env. |
| Production console email | Startup throws if that adapter is selected when `NODE_ENV=production`. |
| GridFS built before its design | No GridFS code until the section H implementation design is approved. Preference is recorded. Implementation has not started. |
| GridFS upload replay | Do not upload inside the retryable callback unless a later approval says otherwise. |
| Large private files buffered | Current `get()` loads the whole file. Streaming is part of the GridFS port change, not a silent rewrite. |
| Public media forced into GridFS | Brand files and the homepage video stay on the Next server. GridFS is for private screenshots and profile photos only. |
| Retention invented | Compensation delete only. No sweeper until OD-011. |
| Performance claims | Phase 3 report must contain the measurements. Otherwise the claim is omitted. |
| Second database | Reject any Firebase, Supabase, Postgres, or object-store client in review. Atlas and the existing Mongoose connection stay the only store. |
| Multi-instance on local disk | Do not deploy serverless or more than one instance while private files use `.local-storage`. |
| Windows dev | Phase 0 removes `ln`. |
| CSP lockout | Report-only first. |
| James merge regressions | Step 1 re-runs the suite before feature work. |

## G. Commits

1. Phase 0 reliability.
2. Phase 2 transaction boundaries.
3. Phase 2 `filledCount`, backfill script, replica-set tests.
4. Phase 3 server-first performance, with measurements.
5. Phase 5 SEO, media, health.
6. Phase 4 public cache.
7. Phase 6 SMTP adapter and production email guard.
8. GridFS, only after the section H implementation design is approved. Not started.
9. Phase 7 boundary check, only if needed.

`docs/ARCHITECTURE_DECISION_RECORDS.md`, `docs/ENGINEERING_RISK_REGISTER.md`, and `docs/IMPLEMENTATION_STATUS.md` are written with the phase that first needs them, after implementation starts. They are not split out in this revision.

## H. GridFS

Status: `Preferred architecture — implementation design and approval pending.`

GridFS is not implemented. It is not production-ready. No bucket, adapter, or migration has been written.

The preferred design, once an implementation design is approved:

- The bucket uses the existing MongoDB Atlas database and the existing Mongoose connection, with the MongoDB driver already available through that connection.
- Private payment screenshots and fighter profile photos go in GridFS.
- Authorization stays in backend services and the protected file routes. A GridFS id or metadata field is not an access check.
- Public brand assets, gallery images, and the homepage video stay in the Next.js public directory.
- Uploads stay outside retryable transaction callbacks. If the business transaction fails after the upload, delete that file.
- Do not copy or delete existing `.local-storage` files automatically.
- Do not add a second database or an object-storage vendor.
- Do not enable a production boot refusal of local disk until that adapter exists and is configured.

Code does not start until a separate design is written and approved. That design must cover bucket configuration, file metadata, streaming upload and download, file size and MIME validation, protected delivery, cleanup and orphan handling, backup and restore, failure recovery, and integration tests.

### What the code does today

`StorageAdapter` is `put`, `getSignedUrl`, `get`, and `delete`. `LocalDiskStorageAdapter` writes under `.local-storage`, rejects absolute keys and `..`, ignores the content type on write, and infers type from the extension on read. `get` returns the entire file as a `Buffer`. `getSignedUrl` does not grant HTTP access.

Payment submit validates the screenshot, writes it, then creates the payment submission and updates the registration. Phase 2 will keep that write outside the transaction and delete the key if the transaction aborts. Admin retrieval checks an admin actor, then returns the bytes with `nosniff` and `private, no-store`. Fighter photo retrieval checks the fighter actor. Public pages never receive the storage key for a screenshot.

There is no second store. Limits stay 3 MB for screenshots and 1.5 MB for profile photos. No retention job exists. `delete` ignores a missing file.

### Why GridFS fits the approved database decision

GridFS uses the existing Atlas database and the existing Mongoose connection (`connection.db` plus `GridFSBucket` from the installed `mongodb` driver). It does not add a vendor, a second cluster, or a new database. Private files then sit in the same backup as the business documents. Screenshots are under the 16 MB BSON limit either way; GridFS is still the right bucket API so the application does not stuff binaries into registration documents.

Public brand images and the homepage video should stay files served by Next. `MediaAsset` external URLs stay URLs. GridFS is only for private uploads that already use `StorageAdapter`.

### Authorization, streaming, cleanup

Authorization stays in the route and the service. A GridFS file document may store `purpose`, `ownerUserId`, and `contentType` as metadata. That metadata is not the access check.

Download should become a stream from `openDownloadStream` once the port is allowed to change. Until then, buffering a 3 MB object is the current behavior and is acceptable. `getSignedUrl` should not become a public GridFS URL. Private reads stay on the authenticated route handlers.

Cleanup that must exist on day one: `delete` after an aborted payment or registration transaction, using the same key the adapter returned. Cleanup that must not be invented: expiry of Aadhaar-adjacent photos and old screenshots. That is OD-011.

Transactions: business writes (registration, payment, audit, `filledCount`) stay in the MongoDB transaction. The binary upload stays outside it, then `delete` compensates on abort. This matches the approved rule that retryable callbacks do not repeat side effects. GridFS chunk writes can take a session, but a retry would upload again. That option is rejected unless a later decision accepts idempotent upload keys and a session.

### Migration

No production object store has been used. There is no production file set to copy. Development files in `.local-storage` are disposable. The migration is:

1. Add a GridFS adapter behind `getStorageAdapter` when `STORAGE_DRIVER=gridfs`.
2. Leave `local` as the development default.
3. Do not run a copy from disk to GridFS automatically.
4. New uploads use GridFS only where the driver is selected.
5. Existing local keys keep working in development until someone deletes `.local-storage`.
6. Production storage selection must be explicit. Do not enable a boot refusal of local disk until the GridFS adapter is implemented and configured. Until then, production must not be placed on ephemeral or multi-instance infrastructure that would silently depend on local disk.

Rollback: set development back to `local`. Drop the GridFS bucket only with an explicit operational step, never from application boot.

### Remaining GridFS risks

Cluster load from chunk writes is acceptable at current volume and is not a reason to add object storage. A future public CDN for fighter photos would be a new decision; profile photos are private today. The driver already in the tree can open a bucket, so a separate GridFS package is unnecessary.

## I. SMTP evaluation

Implemented. The approved package is Nodemailer 10.3.1, license MIT-0, with its own TypeScript types. Node 20 or newer is required. CI uses Node 22.

The port is still `send({ to, subject, body })`. Call sites are payment submit, payment decision, and registration-request decision, all after commit. WhatsApp notification in match scheduling is a separate console-style helper and is not SMTP.

The adapter module imports `server-only`. Production requires the five environment variables. Development uses the console adapter and does not require those variables. A production server throws instead of selecting the console adapter. The production build does not, because it is not serving mail.

SMTP2GO is the preferred provider candidate. Its credentials and DNS verification are not done. No message from this application has been accepted by a provider. No credentials are stored in the repo. Production must not fall back to console email. Copy and templates are not decided here.
