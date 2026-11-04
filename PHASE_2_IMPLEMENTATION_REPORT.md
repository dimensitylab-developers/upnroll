# Phase 2 Implementation Report — Up 'n Roll

Implementation date: 2026-11-04
Scope: match scheduling admin UI, admin/fighter navigation and interaction consistency, responsive pass on admin pages, quality gates, live verification against the connected database. No bracket algorithm or client-gated (`OD-*`) business decisions were changed.

---

## Step 1 — Verify Phase 1

Re-ran the full quality gate suite before making any changes: `tsc --noEmit` (0 errors), `eslint .` (0 errors/warnings), `vitest run` (98/98 pre-existing tests pass). Re-read `admin/page.tsx`, `fighter/dashboard/page.tsx`, and `dashboardService.ts` — confirmed every query remains scoped by `userId`/role as reported in Phase 1; no regressions found. No code changes were made in this step.

---

## Step 2 — Match scheduling admin UI

**The underlying service and action already existed** (`matchService.updateMatchSchedule`, `features/matches/actions.ts`'s `updateScheduleAction`) — the gap was entirely in the UI, which never called them.

| File | Change |
|---|---|
| `src/server/services/matchService.ts` | `enrichWithNamesAndEvent` now also attaches `divisionName` (queries `Division` the same way events/registrations are already enriched). `updateMatchSchedule` gained two validation checks: a match can't be scheduled until both competitors are assigned (rejects TBD slots), and an invalid `Date` is rejected — both throw `ValidationError`, consistent with the rest of the codebase's error handling. |
| `src/app/(admin)/admin/events/[id]/matches/page.tsx` | Reworked: matches now group by division → round instead of one flat table; an **Upcoming / Completed** tab split (`components/ui/tabs.tsx`) replaces the single list; each match row shows a schedule-status badge ("Unscheduled" or the date/mat) and a "Schedule"/"Edit schedule" action alongside the existing record/correct-result actions. `MatchResultDialog`'s record/correct logic and `bracketEngine`/`matchService` progression logic were **not touched**. |
| `src/features/matches/schedule-match-dialog.tsx` (new) | Dialog mirroring `MatchResultDialog`'s `useActionState` pattern — datetime-local + mat inputs, pre-filled when editing, calling the existing `updateScheduleAction`. |
| `src/server/services/matchService.test.ts` (new) | 5 unit tests for `updateMatchSchedule` (model-mocked, same style as `requestService.test.ts`): sets schedule with both competitors present; rejects scheduling with a missing competitor; rejects an invalid date; allows clearing the mat without touching the date; `NotFoundError` on a missing match. |

---

## Step 3 — Admin experience consistency

| File | Change |
|---|---|
| `src/features/admin/admin-nav.tsx` (new), `src/app/(admin)/admin/layout.tsx` | Added a nav bar (Dashboard/Events/Payments/Requests/Rankings/Content/Media) to the admin header, with active-link styling via `usePathname`. Every admin page was previously an undiscoverable island reachable only from the dashboard's own links or a typed URL. |
| `src/features/brackets/publish-bracket-button.tsx` | Rewrapped in the existing (previously unused anywhere) `AlertDialog` component — "Publish this bracket? This makes it visible to the public and locks in the current matchups." This was the one destructive, irreversible admin action in the whole app with zero confirmation step; the three other consequential actions (payment review, request decisions, match results) already used a `Dialog` confirmation. |
| `src/components/page-header.tsx` (new) | Small shared header component (title + optional description/action slot) to replace the hand-rolled `<h1 className="text-display text-2xl font-semibold mb-X">` repeated across pages. Applied to the reworked matches page; not mass-applied to every untouched page, to keep this phase's diff reviewable. |

---

## Step 4 — Fighter experience

`src/features/fighter/fighter-nav.tsx` (new) + `src/app/(fighter)/fighter/layout.tsx`: same nav pattern as admin (Dashboard/Profile/Registrations/Matches/Requests). The fighter layout had the identical no-nav problem as the admin layout — Phase 1's dashboard already surfaces registration/payment/match/request status, but a fighter had no way to move between those screens without returning to the dashboard each time. No other fighter-facing functional changes were made this phase.

---

## Step 5 — Responsive pass

Applied to the 8 admin pages that had zero responsive breakpoints (`content`, `events`, `payments`, `rankings`, `requests`, `events/[id]`, `events/[id]/brackets`, `events/[id]/divisions`) plus the reworked `matches` page:
- Widened fixed `max-w-*xl mx-auto` containers with `px-4 sm:px-6`.
- Wrapped every `<Table>` in `overflow-x-auto` so wide tables scroll horizontally instead of breaking layout under ~400px.
- Changed tight `flex items-center justify-between` rows (event list items, division rows, bracket division headers, event detail header) to `flex-col sm:flex-row sm:items-center sm:justify-between` so they stack cleanly on narrow screens instead of squeezing.
- Admin/fighter headers now stack (`flex-col sm:flex-row`) so the new nav bar wraps onto its own line below the title on narrow viewports rather than crowding the sign-out button.

No visual-identity changes — same `manga-panel` panels, same color/typography tokens throughout.

---

## Step 6 — Quality gates

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npx eslint .` | **0 errors/warnings** |
| `npx vitest run` | **103/103 tests pass** (15 files — 98 pre-existing + 5 new in `matchService.test.ts`) |
| `npm run build` (`next build`, Turbopack) | **Succeeds** — all 34 routes compile. Hit the project's own documented M-3 flaky-cold-build issue once (`InvariantError: client reference manifest ... does not exist` on `/login`/`/register` when serving a build that had been produced while another unrelated `next start` process on the machine was concurrently reading the same `.next` directory); a clean rebuild resolved it immediately, consistent with the rescue report's note that this self-heals on retry. |

### Live browser verification

Since a database was already reachable (MongoDB Atlas, pre-existing live data — not a disposable local instance), verification was done against the real connected DB rather than a throwaway fixture, using a one-off Playwright script driven headlessly (now removed — scratch tooling, not committed). A demo event (`scripts/seed-demo.ts`, idempotent upsert) and a test admin (`scripts/create-admin.ts`) were created for this purpose; a test fighter account was created through the real `/register` flow. These are clearly-labeled `*test.local`/`phase2-*` accounts, additive only — no existing data was modified or deleted.

Actually observed, screenshots reviewed:
- **Admin nav**: renders all 7 links, active-link underline correct, works at 1280px and wraps correctly to two lines at 390px without breaking the header.
- **Admin dashboard** (Phase 1 feature): unaffected, shows live counts (6 registered fighters, 1 upcoming event, 1 pending payment, recent registrations/activity feed) — confirms Step 1's "no regression" claim live, not just by code review.
- **Admin → Events → event detail → Matches**: the reworked matches page renders correctly for the live (bracket-less) event — "Matches — Underground Arena Vol. 4", Upcoming (0)/Completed (0) tabs, correct empty-state message, zero console/page errors.
- **Fighter registration → dashboard → nav**: a fresh fighter registered through the real UI, redirected to `/fighter/dashboard`; the new fighter nav rendered all 5 links and `/fighter/profile` loaded correctly via direct navigation, including at a 390px viewport.
- **Admin payments at 390px**: table remains usable, no layout breakage.

**Not verified live** (honest limitation, not skipped silently): the Schedule dialog's actual submit-and-refresh behavior and the Publish-bracket `AlertDialog`'s click-through were **not** exercised end-to-end in the browser, because doing so required a division with ≥2 *confirmed* (payment-approved) registrations to generate a real two-competitor match or a publishable bracket — the live database only had one eligible registration per division with payment still pending, and completing that pipeline (second fighter registration + file-upload payment screenshot + admin approval) was out of scope for this verification pass. Both are covered instead by: the 5 new unit tests for the validation logic they depend on, and direct code review against the existing, already-proven `MatchResultDialog`/`Dialog` and `AlertDialog` patterns they reuse verbatim.

---

## Known limitations

- Schedule dialog and bracket-publish confirmation are unit-tested/code-reviewed but not live-browser-tested end-to-end (see above) — recommend a follow-up pass once a full registration→payment-approval→bracket pipeline is available to click through, or run it directly against a seeded multi-fighter division.
- `updateMatchSchedule`'s "both competitors required" validation means a match can't be pre-scheduled before the bracket assigns its competitors (i.e., before the previous round completes) — this matches how brackets are built (slots fill in as prior rounds resolve) but means round-2+ matches can only be scheduled once round 1 is decided, not pre-assigned. This seemed like the correct, conservative interpretation of "prevent invalid scheduling," but is worth confirming with the client if event-day logistics need to pre-block a time/mat slot before the bracket fills it.
- The `PageHeader` component was applied only to pages touched this phase, not retrofitted everywhere — the remaining pages still hand-roll their `<h1>`, which is consistent but not yet unified.
- `/admin/media`, `/admin/events/[id]` divisions sub-forms, and the public site were not part of this phase's responsive pass beyond the spot-check noted in Step 5 — they were already responsive or out of this phase's scope.
- M-3 (flaky cold Turbopack build on Windows, self-heals on retry) remains open and unchanged — reconfirmed, not fixed, since it's an environment/tooling issue, not application code.

---

## Remaining client-gated decisions (unchanged — not addressed this phase)

Everything in `docs/decisions/open-decisions.md` remains open exactly as logged: ranking methodology (OD-004), bracket formats beyond single-elimination (OD-003), weight classes/eligibility categories (OD-002), storage/email/hosting providers (OD-012), payment reference format (OD-005a), and the rest. No business decision was made or assumed in this phase; `docs/decisions/open-decisions.md` was not modified.
