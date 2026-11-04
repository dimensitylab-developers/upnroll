# Project Rescue Report — Up 'n Roll

Audit date: 2026-11-04
Auditor: Claude Code (Sonnet 5), read-only Phase 1 audit per the Project Rescue Engineer brief.
Scope: full repository inspection, `tsc --noEmit`, `eslint`, `vitest run` (93 tests), `next build` (production), and a document cross-check against the project's own `docs/` tree. **No source code was modified.**

---

## Executive summary

This is **not** a distressed codebase in the usual "rescue" sense. It is a small, actively-maintained Next.js 16 / React 19 / MongoDB (Mongoose) tournament platform that has been built in disciplined, documented phases (Phase 0 through Phase 6, visible in `docs/phases/`), with its own scope matrix, open-decisions log, data model doc, route map, and two self-run security/accessibility reviews already on record.

Verified directly in this audit:
- `npx tsc --noEmit` — **0 errors**.
- `npx eslint .` — **0 errors/warnings**.
- `npx vitest run` — **93/93 tests pass** (13 files: auth, session, bracket engine, ranking engine, registration state machine, payment queue, rate limiting, chatbot, HTTP errors, file validation, schemas).
- `npx next build` — **succeeds**, 35 routes compiled (one transient `MODULE_NOT_FOUND` on a cold `.next` dir reproduced once, then succeeded on retry twice in a row — see Medium-3 below).
- `.env` is real but correctly git-ignored (`.gitignore:34-35`); only `.env.example` is tracked. No secrets found in the repo.
- Every `src/features/*/actions.ts` module (events, matches, brackets, payments, admin-payments, requests, rankings, content, media, profile, registrations) calls `requireRole`/`requireSession` itself — authorization is not delegated to layout redirects anywhere checked.
- The payment-screenshot route (`src/app/api/v1/admin/payments/[id]/screenshot/route.ts`) calls `requireRole("ADMIN")` inside the handler before reading the file; storage keys are server-generated (`registrationId` + timestamp + random hex, extension from a whitelist), not derived from user-supplied filenames — no path-traversal surface.
- Session cookies are HMAC-signed with `timingSafeEqual` verification, DB-backed (immediately revocable), `httpOnly`/`sameSite=lax`/`secure`-in-prod. Passwords use `scrypt` + `timingSafeEqual`. This is correct, modern practice, not a shortcut.

The team's own docs are candid about what's genuinely unfinished — those gaps are tracked below without re-discovering them as if they were hidden defects.

---

## Repository health

| Check | Result |
|---|---|
| Type check | Pass (0 errors) |
| Lint | Pass (0 errors) |
| Unit tests | 93/93 pass |
| Production build | Pass (flaky once on a cold cache — see Medium-3) |
| Secrets in git history / tracked files | None found |
| Dependency audit | 27 known vulns remain, all in the `shadcn` CLI devDependency tree (not shipped), documented in `docs/phases/06-production-hardening.md` |

Architecture, at a glance:
- **Framework**: Next.js 16 App Router, Turbopack, React 19, Server Components/Actions as the default data path (confirmed: no page-level Client Component per the Phase 6 performance pass).
- **DB**: MongoDB via a cached Mongoose singleton (`src/server/db/connect.ts`), 14 models under `src/server/models/`.
- **Auth**: custom session (not NextAuth) — DB session table, signed opaque cookie, role enum (`GUEST`/`FIGHTER`/`ADMIN`), `proxy.ts` (Next 16's replacement for `middleware.ts`) does a cheap cookie-presence redirect only, with every real check re-done server-side — correct defense-in-depth, documented as intentional.
- **Business logic** is split into pure, dependency-free "engine" modules (`bracketEngine.ts`, `rankingEngine.ts`, `registrationStateMachine.ts`, `chatbotEngine.ts`) each with its own unit tests, separate from the DB-touching `*Service.ts` files that call them. This is a notably good pattern for testability and is why 93 tests can run in ~3 seconds with no DB.

---

## Findings

### Critical
None found. No build-breaking, data-loss, or auth-bypass defects were identified.

### High
**H-1. Local-disk storage is not production-viable for payment screenshots (private, server-only; self-documented).**
`src/server/storage/local-disk.ts:7-10` — the adapter writes to `.local-storage/` on the local filesystem. This is explicitly commented as "dev-only... not for production use" and is correctly cross-referenced as a known gap in `docs/deployment/deployment-guide.md` (OD-012, object storage provider not yet chosen). The read path is already safely gated behind `requireRole("ADMIN")`, so there is no *access-control* issue — the issue is purely operational: on any multi-instance or ephemeral-filesystem host (serverless, autoscaled containers), uploaded screenshots will be lost or inconsistently visible across instances.
*Impact*: payment verification would silently break in most real hosting setups.
*Recommendation*: this is already an open, client-blocked decision (OD-012) — do not pick a provider unilaterally; flag it for sign-off before any production deployment, per the project's own Part F/M rules.

**H-2. Ranking methodology and bracket format set are explicit placeholders, not a defect but a go-live blocker.**
`src/server/services/rankingEngine.ts:24-29` ships `winLossPointsStrategy` (3 pts/win) labeled in-code and on both the admin and public `/rankings` pages as "not an approved methodology" (OD-004). Only single-elimination brackets are implemented (OD-003 baseline). Both are fine as engineering decisions pending client input, but they mean the ranking numbers a real user would see today are not production-accurate.
*Recommendation*: get OD-004 (ranking formula) and the "beyond single-elimination" question resolved before any public launch; the swap point (`winLossPointsStrategy`) is a single function, so this is cheap once decided.

### Medium
**M-1. `/admin` overview is a Phase 2 placeholder, not a working dashboard.**
`src/app/(admin)/admin/page.tsx:1-17` renders only "Signed in as {email} (role: {role})" — literally labeled "Phase 2 foundation" in its own copy — while every other admin surface (events, payments, content, media, rankings, requests, matches, brackets) is fully built and functional. This is self-documented as a gap in `docs/architecture/route-map.md:48` ("`/admin` ... overview placeholder"), so it is not a hidden regression, but it is a real, user-visible usability gap against requirement ADM-001 ("Admin dashboard").
*Recommendation*: build a real landing dashboard aggregating pending-payment count, upcoming events, and recent registrations/requests — all the underlying services already exist (`eventService`, `paymentService`, `requestService`), so this is additive, not architectural.

**M-2. `getClientIp()` trusts `X-Forwarded-For` for rate-limit keying.**
Already flagged honestly in the code's own comment and in `docs/deployment/deployment-guide.md` (confirmed in `docs/phases/security-review.md:7`) — spoofable unless deployed behind a proxy that sets this header reliably, and rate limiting is explicitly single-instance/in-memory only. Not a new finding; re-verified as still true and still documented.

**M-3. Cold-cache production build is flaky on this Windows environment.**
`npx next build` failed once with `Cannot find module '.next/server/app/(admin)/admin/requests/page.js'` (`MODULE_NOT_FOUND` in the Turbopack worker) immediately after a `.next` wipe, then succeeded cleanly on two immediate retries with identical input. This looks like a Turbopack worker race writing/reading page manifests concurrently on Windows (the project's own Phase 6 notes a similar Turbopack dev-cache panic on this filesystem). Low severity since it self-heals on retry and CI/CD typically retries failed builds, but worth a flag if deployment automation treats the first build failure as fatal without retry.

**M-4. Division-transfer approval re-checks target-division capacity at request time, not at approval time (TOCTOU).**
`src/server/services/requestService.ts:40-44` checks the target division's capacity when the fighter *creates* a TRANSFER request, but `decideRequest` (`requestService.ts:71-79`) applies the division change on admin approval without re-checking capacity. If the target division fills up between request creation and admin approval (e.g. two fighters request transfer into the last open slot, or new direct registrations land first), approving the request can push the division over its stated capacity.
*Impact*: a division could silently exceed its admin-set capacity, undermining requirement 5 (admin-approved fair matchmaking) and bracket generation's capacity assumptions.
*Recommendation*: re-run the same `activeCount >= targetDivision.capacity` check inside `decideRequest` immediately before applying the TRANSFER, inside the same lookup used for `findOneAndUpdate`.

**M-5. No `loading.tsx` anywhere in the app — every route blocks with no loading UI.**
`find src/app -name "loading.tsx"` returns zero results. Every page (public, fighter, admin) fetches data with `force-dynamic`/uncached server-side calls and has no Suspense boundary or skeleton, so navigation always blocks on a blank screen until the full server render completes — no perceived-performance affordance exists anywhere.
*Recommendation*: add `loading.tsx` (or Suspense + the existing `skeleton.tsx` shadcn component) at least for the heavier admin/event pages; low effort, meaningfully improves perceived responsiveness.

**M-6. `fighter/dashboard` is the same kind of stale "Phase 2" stub as the admin overview (M-1), not just `/admin`.**
`src/app/(fighter)/fighter/dashboard/page.tsx:12,17-19` literally reads "Phase 2 foundation" and "Registrations, payments, matches, and rankings are built in later phases — see docs/architecture/route-map.md" — but those phases have since shipped (fighter registrations, payments, matches, and requests all have real, working sub-pages). This is the same forgotten-landing-page pattern as the admin dashboard, just not mentioned in the M-1 write-up.
*Recommendation*: fold into the same fix as M-1 — have the fighter dashboard surface the fighter's own upcoming matches, registration status, and pending requests, all of which already have working services/pages to pull from.

### Low
**L-1. `LocalDiskStorageAdapter.put()` declares 2 parameters but the `StorageAdapter` interface requires 3 (`key, data, contentType`).**
`src/server/storage/local-disk.ts:21` vs `src/server/storage/types.ts:9`. TypeScript's method bivariance permits this (confirmed — `tsc` raises no error), and it causes no runtime bug since the adapter derives content-type from the file extension on read instead. Purely a latent inconsistency that would bite if a future real adapter swap assumed `contentType` was being honored by this one. Trivial fix: add the unused third parameter for interface clarity.

**L-2. No dedicated `notifications` collection.**
Status-change emails go through the dev `ConsoleEmailAdapter` with no persisted record of what was "sent." Self-documented as intentional in `docs/architecture/data-model.md:3` ("not needed yet since nothing currently queries notification history independently"). Flagging only because NOT-001/NOT-002 implies some notification history may eventually be expected by the client — worth confirming scope, not fixing speculatively.

**L-3. Dependency audit: 27 remaining `npm audit` findings.**
All trace to the `shadcn` CLI devDependency tree (build-time only, not shipped to the production bundle) and all require a forcing major-version bump (documented in `docs/phases/06-production-hardening.md:72`). No action needed unless the `shadcn` CLI itself becomes a supply-chain concern for the dev environment.

**L-4. `FighterProfile` has no weight, age, or gender fields — "fair matchmaking" is entirely a manual admin judgment call, with no system-level fairness guardrail.**
`src/server/models/FighterProfile.ts:4-12` only stores `displayName`, `gym`, `discipline`; `Division.ts` only carries `discipline` + `capacity`. There is no data for the system to validate or even warn on (e.g. a lightweight fighter being manually seeded against a heavyweight within the same division). This matches the project's own scope (divisions are presumably pre-split by weight/discipline at creation time by the admin), so it is not a bug, but it means requirement 5 is satisfied by trusting the admin completely — worth confirming this is the intended scope before calling matchmaking "fair" in client-facing copy.

**L-5. Admin section is visually non-responsive; inconsistent with the public side's responsive discipline.**
Only 1 of 12 files under `src/app/(admin)/` uses any `sm:`/`md:`/`lg:` breakpoint (`admin/media/page.tsx`), versus consistent, deliberate responsive patterns across every public page and the shared header/footer. Admin pages use fixed `max-w-xl`/`max-w-3xl` single-column containers that will underuse wide viewports and may feel cramped on tablets mid-breakpoint. Not broken — admins are a controlled, presumably desktop-first audience — but worth a deliberate pass if admins are expected to use tablets/mobile.

**L-6. `docs/product/client-acceptance-checklist.md:30` is stale and contradicts the latest shipped commit.**
It still states "The public homepage doesn't exist yet" and that `/ui-preview` is the design reference — but commit `0472581` ("Fix missing homepage and navbar: real (public) layout + data-driven landing page") already shipped a real, data-driven homepage, and `docs/product/scope-matrix.md`'s WEB-001 row was updated to reflect this while this checklist was not. Since this is a client-facing document, it should be corrected before client handoff to avoid the client being told a shipped feature doesn't exist.

---

## Requirements validation (against the 8 core requirements in the brief)

| # | Requirement | Status |
|---|---|---|
| 1 | Athlete registration and management | **Built** (Phase 3) — duplicate-registration prevention via compound index + state machine, unit-tested (17 tests) |
| 2 | Tournament creation | **Built** (Phase 4) — event + division CRUD, admin-gated |
| 3 | Single-elimination bracket generation | **Built** (Phase 4) — deterministic, seed-order correct (standard "1v2 only in final" seeding verified in `bracketEngine.ts`), byes auto-resolved, 20 unit tests. Formats beyond single-elimination are open (OD-003) |
| 4 | Match scheduling and management | **Partially built** — result recording, winner advancement, audited correction done; mat/time scheduling exists in the data model but has no dedicated admin view yet (`docs/architecture/route-map.md:59`) |
| 5 | Admin-approved fair matchmaking | **Built, with caveats** — manual seed ordering before bracket generation (`participant-order-form.tsx`), admin-only generate/publish actions; fairness has no system-level guardrail since fighter profiles carry no weight/age data (L-4), and division-transfer approval has a capacity TOCTOU gap (M-4) |
| 6 | Athlete ranking system | **Built but placeholder formula** — see H-2 |
| 7 | Admin dashboard | **Partially built** — all sub-sections (events/payments/content/media/rankings/requests/matches/brackets) work; the `/admin` and `/fighter/dashboard` landing pages are both stale Phase-2 stubs — see M-1, M-6 |
| 8 | Role-based access control | **Built and consistently enforced** — verified independently in this audit across every `features/*/actions.ts` module and the payment-screenshot route |

No requirement was found to be silently broken or missing without the project's own docs already saying so.

---

## UI/UX assessment

- Phase 6 ran an automated `axe-core` accessibility scan and fixed all 11 found violations (missing `<main>` landmarks, unlabeled `Select` triggers, several under-contrast color tokens) — re-scan showed 0 violations across the scanned pages. This audit did not re-run that scan (no reason to assume regression; the fixes are still present in `globals.css`/component code as reviewed).
- Responsive layouts were screenshot-verified by the prior phase at 360/390/768/1024/1440px breakpoints.
- The most recent commit (`0472581`) fixed a real structural gap: public pages had no shared header/nav/footer until a `(public)` route group + layout was added — this is now in place and functioning (`site-header.tsx`, `site-footer.tsx`, data-driven homepage pulling real events/rankings/FAQs).
- No further UI/UX redesign is warranted by this audit; the remaining gap is the admin dashboard stub (M-1), which is a missing feature, not a visual defect.

---

## Rescue roadmap (prioritized)

1. **Stability** — already green (build/lint/tests pass). No action needed beyond watching M-3 (flaky cold build) in CI.
2. **Auth/authorization** — already solid; no action needed.
3. **Database/API correctness** — already solid; the Phase 6 live-DB run caught and fixed the one real cross-cutting bug (deprecated `{ new: true }` Mongoose option) that unit tests couldn't catch. No open correctness issues found.
4. **Core tournament workflows** — functionally complete for the single-elimination baseline; schedule/mat-time admin UI (item 4 above) is the only concrete missing piece with a clear acceptance criterion: an admin view to assign mat/time to existing `Match` records (model field already exists).
5. **Bracket/ranking functionality** — bracket engine is solid. Ranking formula is explicitly pending client decision (OD-004) — this is a business decision, not an engineering task.
6. **Admin workflows** — build the real `/admin` and `/fighter/dashboard` landing pages (M-1, M-6): pending-payment count, upcoming events, recent registration/request activity for admin; upcoming matches, registration status, pending requests for fighters — all sourced from existing services. Also close the TRANSFER-approval capacity TOCTOU gap (M-4): re-check division capacity inside `decideRequest` before applying the transfer. Acceptance: dashboards show live data, not static copy; transfer approval rejects once the target division is full, re-checked at approval time.
7. **UI/UX** — add `loading.tsx`/Suspense boundaries for perceived-performance (M-5); correct the stale client-acceptance-checklist.md homepage claim (L-6); consider a responsive pass on admin pages (L-5) if admins use non-desktop devices. No redesign needed beyond what's already fixed in Phase 6.
8. **Testing/deployment readiness** — resolve OD-012 (storage/email/hosting provider) before any real deployment; everything else in `docs/deployment/deployment-guide.md` already anticipates this.

**Dependencies**: item 6 (dashboards, transfer-capacity fix) depends on nothing new — all underlying services and models already exist. Item 4 (scheduling UI) depends on nothing new. Item 8 (storage provider) blocks real production payment-screenshot persistence and must be a client decision, not an engineering default, per this project's own ground rules.

---

## Technical debt

- Open decisions log (`docs/decisions/open-decisions.md`) lists 14 items (OD-001 through OD-014) genuinely pending client sign-off — ranking formula, weight classes, bracket formats beyond single-elimination, storage/email/hosting provider, brand assets, payment reference format, and more. None of these are engineering debt; they are correctly gated behind explicit client approval and should not be resolved by assumption.
- `LocalDiskStorageAdapter` (L-1, H-1) is the one piece of code explicitly self-labeled as a placeholder that must not reach production unchanged.

## Conclusion

The project does not need a rescue in the sense of untangling broken or abandoned work — it needs the handful of explicitly tracked, client-gated decisions (ranking formula, storage provider, bracket formats) resolved, plus a small set of well-scoped engineering gaps closed: two stale "Phase 2" dashboard stubs (admin and fighter), one real logic bug (the division-transfer capacity TOCTOU gap, M-4), missing loading states, and a stale client-facing doc. None of these require architectural change or rewrite — all are additive fixes against services and models that already exist. No code changes have been made in this audit; the above is submitted for review before any implementation work begins.
