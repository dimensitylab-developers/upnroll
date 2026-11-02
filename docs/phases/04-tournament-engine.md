# Phase 4 — Tournament Engine

Date: 2026-11-01. Scope: admin event/division management, deterministic single-elimination bracket generation (manual or seeded-random ordering), publishing, match result recording with automatic winner advancement, audited result correction, a fighter match view, and public schedule/bracket/results pages.

## Phase summary

An admin can now create an event and its divisions, select confirmed registrations for a division, order them (manually or via a seeded shuffle), generate a draft bracket, preview it, and publish it. Once matches are scheduled, the admin records results through a dialog that picks the winner from the match's two actual competitors; the engine automatically advances the winner into the correct slot of the next round using pure round/order arithmetic — no manual "who plays who next" bookkeeping. A completed result can be corrected (with a required reason, fully audited) as long as the match it fed into hasn't itself been decided yet, which is the one case Part N specifically calls out as needing a hard guard. Byes are resolved automatically at generation time, including cascading byes for very small fields — no separate admin step. Fighters can see their assigned matches; the public can see published brackets, schedules, and results for a given event, strictly limited to brackets an admin has actually published.

## Actual files changed

**Pure engine**: `src/server/services/bracketEngine.ts` (seeding, shuffle, bracket construction with bye resolution, winner-advancement arithmetic, correction guard)
**Models**: `src/server/models/{Bracket,Match}.ts`
**Services**: `src/server/services/{eventService,bracketService,matchService}.ts`
**Validation**: `src/features/events/schemas.ts`
**Actions**: `src/features/events/actions.ts`, `src/features/brackets/actions.ts`, `src/features/matches/actions.ts`
**UI**: `src/features/events/{create-event-form,create-division-form,event-status-form,event-status}.tsx/.ts`, `src/features/brackets/{participant-order-form,bracket-view,publish-bracket-button}.tsx`, `src/features/matches/match-result-dialog.tsx`
**Admin routes**: `src/app/(admin)/admin/events/{page,[id]/page,[id]/divisions/page,[id]/brackets/page,[id]/matches/page}.tsx`
**Fighter route**: `src/app/(fighter)/fighter/matches/page.tsx`
**Public routes**: `src/app/events/{page,[slug]/page,[slug]/brackets/page,[slug]/schedule/page,[slug]/results/page}.tsx`
**Tests**: `src/server/services/bracketEngine.test.ts`
**Docs**: `docs/architecture/route-map.md` (rewritten to reflect actually-built vs. later), `docs/architecture/data-model.md`, `docs/product/scope-matrix.md`, `docs/decisions/open-decisions.md`

## Architectural decisions

- **Bracket addressing is pure arithmetic** (`round`/`order`, `nextSlot()`), not a stored "next match" pointer — fewer fields to keep in sync, and it's exactly what made the core logic unit-testable without a database.
- **Byes resolve at generation time**, including cascading byes (e.g. a 3-participant field needs two rounds of auto-resolution before the bracket is actually contested) — verified directly by the test suite, not just asserted.
- **Result correction is guarded, not just logged**: `canCorrectResult()` blocks a correction once the downstream match has been decided, specifically to stop a correction from silently invalidating a later round's result — this was the one non-negotiable piece of Part N's bracket-integrity rule, and it's both unit-tested and enforced in `matchService.correctMatchResult`.
- **Scope cut, stated plainly**: swapping competitors between two not-yet-played matches in an *already-published* bracket is not implemented. The two things Part N actually requires — never silently overwrite a played result, and preserve audit history on correction — are fully built. Free-form re-seeding of a live bracket is useful but not load-bearing, and was cut to keep this phase reviewable; a `DRAFT` bracket can still be freely regenerated.
- **Public pages are `force-dynamic`**: they were the first routes in this project with no `cookies()` call (which is what made `/admin`/`/fighter` pages auto-dynamic in Phases 2–3) but real DB reads, so Next tried to statically prerender them at build time against a database that doesn't exist yet in CI/this sandbox. Caught by the build failing, not guessed — every public events page now explicitly opts out of static generation.
- **Plain routes instead of a `(public)` route group** for the new event pages — the route-map's original plan called for a `(public)` group with its own layout, but no such shared public layout exists yet (the homepage is still Phase 1's placeholder), so a route group would be pure ceremony right now. Noted in `docs/architecture/route-map.md` as a deliberate, revisit-when-relevant deviation.
- **One real client/server boundary bug caught by the build, not by review**: `event-status-form.tsx` (a Client Component) originally imported `EVENT_STATUSES` from `@/server/models/Event`, which pulled Mongoose — and therefore the Node-only `mongodb` driver — into the browser bundle. Build failed with `Module not found: Can't resolve 'net'`. Fixed by extracting the status list into a tiny server-free constant module (`src/features/events/event-status.ts`), same pattern as Phase 2's `cookie-name.ts` split for the Edge proxy. Audited the rest of the codebase afterward (`grep` for `@/server/` imports inside every `"use client"` file) — no other instances.

## Functional verification

- `npm run lint` — clean (after fixing one React-purity violation: a seed-input default was being computed from `Date.now()` during render, same class of bug as Phase 1's `sidebar.tsx` fix — moved to an imperative post-mount `useEffect` writing directly to the uncontrolled input's DOM value, since a plain `setState` in the effect also tripped an "avoid cascading renders" rule).
- `npm run test` — **70/70 passing** (20 new, all in `bracketEngine.test.ts`): the classic seeding sequences for n=2/4/8/16 verified against hand-computed values (not just "it runs"), deterministic-shuffle reproducibility, bye auto-resolution and cascading-bye behavior for odd participant counts, winner-advancement arithmetic, and the result-correction guard's both branches.
- `npm run build` — passes, 22 routes total, all new admin/fighter/public routes compile and are correctly dynamic; `/`, `/login`, `/register`, `/ui-preview` remain static.
- `scripts/seed-demo.ts` re-smoke-tested after the new models were added — same fail-fast/connects-then-times-out behavior as before, confirming no import regressions.

## Known limitations (stated plainly)

- **Still no live database available in this sandbox** — same constraint as every prior phase. The full generate → publish → record-result → advance → correct lifecycle is verified at the pure-function level (which is where all the actual tournament-integrity logic lives) but not as a live multi-request integration test. This is the correct place to draw the line given the environment, but it is the first thing to run for real once a MongoDB URI exists.
- Free-form competitor swapping in a published, unplayed match — deferred (see architectural decisions above).
- No admin UI for match scheduling (mat/time) yet, even though the model and service method (`updateMatchSchedule`) exist — noted in `route-map.md`'s admin section rather than silently left out.
- No admin audit-log viewer UI yet, even though every sensitive action in this phase (event creation, status change, division creation, bracket generation/publish, result record/correct) is already being written to `AuditLog` via the Phase 2 `writeAuditLog` writer.
- Division taxonomy remains intentionally generic (free-text `discipline`, no weight class) — OD-001/OD-002 still open.

## Requirement status

WEB-003, BRK-001, BRK-002 move to "built" in `docs/product/scope-matrix.md`; BRK-003 moves to "partially built" with the specific deferred piece named. REG-002 extends from the Phase 3 payment queue to full event/division/match admin.

## Next phase dependencies

- A reachable MongoDB — now genuinely blocking real verification of a non-trivial stateful workflow (bracket progression across multiple rounds), not just a single CRUD action.
- OD-001/OD-002/OD-003 (disciplines, weight classes, additional bracket formats) if Phase 5 or client feedback calls for anything beyond the generic single-elimination baseline shipped here.
- OD-004 (ranking methodology) before Phase 5's ranking engine can consume the match results this phase now actually produces.
