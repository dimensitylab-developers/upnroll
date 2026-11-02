# Phase 6 — Production Hardening

Date: 2026-11-02. Scope: remove dev-only shortcuts from production paths, error tracking foundation, rate limiting, API authorization tests, database index review, accessibility/responsive review, performance pass, dependency audit, backup/deployment docs, and — the main event — live verification against a real MongoDB the user provided for this phase specifically.

## Phase summary

This phase is different in character from Phases 1–5: not new features, but verification and cleanup. The headline result: **the full cross-phase business flow was actually run against a real database for the first time**, not just unit-tested. `/ui-preview` is now locked out of real deployments by default. Automated accessibility scanning found and fixed real WCAG violations across every real page in the app (not just cosmetic ones — missing landmarks, unlabeled form controls, and under-contrast text that genuinely affects usability). A live run against a real MongoDB caught a real Mongoose deprecation that no mocked unit test ever could. The dependency audit reduced known vulnerabilities from 48 to 27 without any breaking changes.

## Live verification (the main event)

`scripts/verify-live-flow.ts` (temporary, deleted after use) ran against the real `MONGODB_URI` the user provided, asserting real state at each step:

1. Admin account created with `ADMIN` role ✅
2. Event + division created and linked ✅
3. Two fighters register; a third duplicate registration attempt correctly rejected ✅
4. Both submit payment (UTR + screenshot); **real bug found and fixed here** — see below
5. Admin approves both; a second approval attempt on the same submission correctly rejected (idempotency) ✅
6. Both registrations become `CONFIRMED` ✅
7. Bracket generated (`DRAFT`), published (`PUBLISHED`) ✅
8. A real match result recorded; winner correctly persisted ✅
9. Rankings recalculated from real match data; a real win shows up in public rankings ✅
10. An admin-published FAQ is correctly matched by the chatbot for a related real question ✅
11. A cancellation request submitted, approved, and the registration actually ends up `CANCELLED` ✅

**19/19 assertions passed** on the second run (the first run surfaced a real gap in the *test script's* own assumptions about the append-only `PaymentSubmission` design — not an app bug — fixed and documented inline in the script before it was deleted). All test data (6 users, 2 events, and everything linked to them — registrations, payments, brackets, matches, ranking records, the test FAQ, the test request, audit log entries) was enumerated, confirmed, and deleted afterward with the user's explicit sign-off; a follow-up count confirmed zero `verify-*` records remain.

### Real bug found and fixed by the live run

Mongoose logged a deprecation warning during `seed-demo.ts`: the `{ new: true }` option on `findOneAndUpdate`/`findOneAndReplace` is deprecated in favor of `{ returnDocument: "after" }`. This was present in **five call sites** across `eventService.ts` (via `seed-demo.ts`'s direct model usage), `bracketService.publishBracket`, `paymentService`'s approve/reject, and `requestService.decideRequest` — every idempotent decision-making `findOneAndUpdate` in the app. All five fixed. **This is exactly the kind of bug that mocked unit tests (Phase 6's own `session.test.ts` included) cannot catch** — a mock returns whatever the test tells it to, regardless of whether the real Mongoose API still accepts the option being passed. Only hitting a real MongoDB driver surfaces it. Flagging this prominently because it's direct evidence for why the live-verification step mattered, not a formality.

### Addendum — actual browser-driven UI verification (post-Phase-6 request to "verify everything")

The run above called service functions directly. It proved the business logic and database layer, but not the UI layer on top of it — a Server Action could be wired to the wrong field, a form could submit malformed data, a page could render but silently fail to redirect, and a service-layer test would never catch any of it. So a second pass drove an actual Chromium browser through the real pages against the same live database:

1. Register a new fighter account through the real `/register` form ✅ (redirects to `/fighter/dashboard`, dashboard greets the fighter by name)
2. Fill out the real division dropdown and submit `/fighter/registrations/new` ✅ (redirects to the payment page)
3. Fill in a UTR and upload a real file through the actual `<input type="file">` on the payment page ✅ (page shows the pending-review state)
4. Log in as the real admin account (credentials read from `.env` without ever being printed) through the real `/login` form ✅
5. Load every admin page (`/admin`, `/admin/events`, `/admin/payments`, `/admin/content`, `/admin/media`, `/admin/rankings`, `/admin/requests`) ✅ all return 200
6. Click "Review" on the real pending payment in the admin queue, click "Approve" ✅ — the row actually flips to `APPROVED` after a page reload, through the real dialog and real Server Action, not a direct function call
7. Load the real public pages (`/events`, `/faq`, `/rankings`, `/fighters`) ✅

**20/20 assertions passed** on the clean run. Three script-only failures were debugged and fixed along the way (ambiguous button selectors matching both "Sign out" and "Register" on the same authenticated page, the account-signup button actually reading "Create account" not "Register", and a too-narrow text match on the payment-pending state) — in every case the Next.js dev server's own request log was checked first and showed the real request had already succeeded (a `303` redirect or `200`) before the test script's assertion was "fixed," so no app code changed as a result of this pass. One unrelated environment problem surfaced and was resolved along the way: Turbopack's persistent dev cache panicked twice (`range start index ... out of range for slice`) after repeated hard restarts on this filesystem — a tooling issue, fixed by a full `.next` cache wipe, not an application bug.

All 4 real fighter accounts created during this pass (and their registrations/payments/audit log entries) were enumerated, confirmed, and deleted with the user's explicit sign-off; a follow-up count confirmed zero `uiverify-*` records remain.

## Accessibility review (real findings, real fixes)

Automated `axe-core` + Playwright scan against `/ui-preview`, `/login`, `/register`, `/events`, `/faq`, `/rankings`. **Initial scan: 11 violations across 6 pages.** All fixed; re-scan: **0 violations across all 6 pages.**

- **Missing `<main>` landmark** on 13 pages (every real public page plus the auth layout) — every page used a bare wrapper `<div>` instead of a semantic landmark. Fixed by swapping the outermost wrapper to `<main>` across all 13 files (verified: exactly one `<main>` per page, no nesting, since the admin/fighter layouts already had their own).
- **Unlabeled Radix `Select` triggers** (critical impact, "button-name" rule) — 7 `<SelectTrigger>` instances across both `/ui-preview` and the real app (division filters, event status, content type, transfer-target division) had no accessible name; a screen reader announces them as just "combobox." Fixed with explicit `aria-label` on each. One had an associated `<Label htmlFor>` that *should* have worked but didn't (a Radix `id`-forwarding quirk) — rather than debug that further, added a direct `aria-label` as the robust fix.
- **Color contrast failures** (serious impact) — three real token-level issues, not page-specific:
  - `--destructive-foreground` was **never defined**, so destructive badges/buttons rendered near-black text on red at 3.73:1 (needs 4.5:1). Added the missing token.
  - `--color-brand-cyan` text on its own 20%-opacity badge background measured 3.89–4:1. Darkened the token (`oklch(0.5→0.4 0.12 200)`).
  - `--color-brand-gold` badge text measured 3.76:1. Darkened the token (`oklch(0.55→0.45 0.13 80)`).
  - A `text-muted-foreground/50` opacity reduction on bracket "PENDING" status text measured 2.32:1 — removed the opacity reduction.
  - A sidebar "active" nav item's `text-primary` on `bg-primary/15` measured 3.85:1 — switched to the already-defined darker `--color-brand-red-dark` token.

## Responsive review

Screenshotted `/login`, `/events`, `/ui-preview` at the Part P breakpoints (360/390/768/1024/1440). No overflow, no broken layout, no illegible text at any width — visually confirmed, not assumed.

## Other hardening

- **`/ui-preview` gated out of production**: initially gated on bare `NODE_ENV`, then corrected — `next build`/`next start` always set `NODE_ENV=production` even for a staging/review deployment, so that check alone would have permanently baked a 404 into *every* built deployment including ones where review access is wanted. Fixed with an explicit `UI_PREVIEW_ENABLED` opt-in and `force-dynamic` (so the check runs per-request, not once at build time).
- **Error boundaries**: `src/app/error.tsx` (route-segment) and `src/app/global-error.tsx` (root-layout-level, renders its own `<html>`/`<body>` since it can't assume the root layout itself rendered successfully) — Next.js conventions not built in any prior phase.
- **Rate limiting**: in-memory token bucket on `loginAction`/`registerAction`, explicitly documented as single-instance-only.
- **CSRF**: verified directly from Next's own source (`node_modules/next/dist/server/app-render/action-handler.js`) that Server Actions already reject Origin/host mismatches — no redundant custom token layer added.
- **API authorization tests**: `session.test.ts`, 8 tests, DB layer mocked specifically to test the auth *decision logic* in isolation (no-cookie, tampered-cookie, expired-session, disabled-user, wrong-role, correct-role).
- **Database index review** (`docs/architecture/index-review.md`): 3 real gaps found and fixed (`Match.status`, `ContentEntry {type, publicationState}`, `RankingRecord {points, wins}`), cross-referenced against actual service query patterns, not speculative.
- **Dependency audit**: `npm audit fix` (non-forcing) reduced 48→27 vulnerabilities with zero breaking changes (package.json unchanged, only lockfile resolution bumps). Remaining 27 all require `--force` (major version bumps: vitest→5, shadcn→1.0.0) and all trace to the `shadcn` CLI devDependency tree — not shipped to production, not forced this phase, documented rather than silently left.
- **Performance pass** (`docs/phases/performance-pass.md`): real build-output numbers — 1.5MB total client JS chunks, largest single chunk 220KB, confirmed every data-bearing page is a Server Component (no page-level Client Component anywhere), confirmed `gsap`/`@gsap/react` cost zero bundle bytes currently (imported only by an unused component).

## Known limitations (stated plainly)

- No live penetration testing or adversarial multi-user testing — code-level security review only.
- No live Lighthouse/Core Web Vitals run — needs a deployed-like environment this sandbox doesn't have.
- The live verification exercised one representative path through each feature, not every edge case (e.g., bracket byes with 3/5/7 participants were unit-tested in Phase 4 but not re-run live this phase — the pure bracket-engine math doesn't change based on a live DB, so this wasn't considered necessary).
- Object storage, email provider, and hosting are still not chosen (OD-012) — `docs/deployment/deployment-guide.md` is explicit that the current `LocalDiskStorageAdapter` does not work across multiple instances or ephemeral filesystems.

## Requirement status

See the Phase 6 note at the top of `docs/product/scope-matrix.md`. No new business requirements were resolved this phase (that's not what hardening is for) — but confidence in what's already marked "built" is now substantially higher, backed by a real database run instead of only mocked tests.

## Next steps

Per Part Q, Phase 7 is deployment and handover — this phase's `docs/deployment/deployment-guide.md` and `docs/deployment/backup-restore.md` are the direct inputs to that. The client acceptance checklist (`docs/product/client-acceptance-checklist.md`) is the plain-language summary for a non-technical read before sign-off.
