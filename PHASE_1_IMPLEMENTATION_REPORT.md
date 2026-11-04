# Phase 1 Implementation Report — Up 'n Roll

Implementation date: 2026-11-04
Scope: Tasks 1–3 from `PROJECT_RESCUE_REPORT.md` (admin dashboard, fighter dashboard, division-transfer capacity bug). No architecture, schema, or unrelated UI changes were made.

---

## Files modified

| File | Change |
|---|---|
| `src/server/services/registrationStateMachine.ts` | Exported the existing `ACTIVE_REGISTRATION_STATUSES` array (was a private module const) so other services stop re-declaring the same literal. |
| `src/server/services/registrationService.ts` | `createRegistration`'s capacity check now uses the shared constant instead of its own copy. Added `listRecentRegistrationsForAdmin(limit)`, enriched with event/division/fighter name, for the admin dashboard feed. |
| `src/server/services/requestService.ts` | **Task 3 fix.** `decideRequest`'s TRANSFER-approval path now re-validates the target division's capacity immediately before applying the transfer, with rollback-on-failure (see below). `createRequest`'s existing check now uses the shared constant. |
| `src/server/services/eventService.ts` | Added `listUpcomingEventsForAdmin(limit)` for the admin dashboard feed. |
| `src/server/services/fighterService.ts` | Added `getFighterProfile(userId)` (a reader was missing; only `updateFighterProfile` existed) and `countFighters()`. |
| `src/server/audit/log.ts` | Added `listRecentAuditLogs(limit)`, enriched with the actor's email, for the "recent tournament activity" feed. |

## Files created

| File | Purpose |
|---|---|
| `src/server/services/dashboardService.ts` | `getAdminDashboardData()` and `getFighterDashboardData(userId)` — pure composition over the services above via `Promise.all`, no new raw queries beyond what each service already runs. |
| `src/app/(admin)/admin/page.tsx` (replaced placeholder) | Real admin overview: stat tiles, upcoming events, pending payments, recent registrations, pending requests, recent activity feed. |
| `src/app/(admin)/admin/loading.tsx` | Skeleton loading state for the admin overview (this repo had zero `loading.tsx` files anywhere before this change — see `M-5` in the rescue report). |
| `src/app/(fighter)/fighter/dashboard/page.tsx` (replaced placeholder) | Real fighter dashboard: profile summary, registrations, upcoming matches, recent results (win/loss), pending requests. |
| `src/app/(fighter)/fighter/dashboard/loading.tsx` | Skeleton loading state for the fighter dashboard. |
| `src/server/services/requestService.test.ts` | Regression tests for the Task 3 fix (5 tests). |

---

## Features completed

### Task 1 — Admin dashboard
`/admin` now shows, all sourced from real services, no stubs:
- **Total registered fighters** — `fighterService.countFighters()` (`FighterProfile.countDocuments()`).
- **Upcoming events** — `eventService.listUpcomingEventsForAdmin()`.
- **Pending payments** — reuses `paymentService.listPaymentQueue("PENDING_REVIEW")` (the existing admin payments page's own data source).
- **Recent registrations** — `registrationService.listRecentRegistrationsForAdmin()`, enriched with fighter name, event, division.
- **Pending administrative requests** — reuses `requestService.listRequestsForAdmin()`, filtered to `PENDING`.
- **Recent tournament activity** — `audit/log.listRecentAuditLogs()`, reading the existing `AuditLog` collection that every service already writes to (event creation, payment decisions, match results, requests, etc.) — no new tracking mechanism needed.

Authorization unchanged: `src/app/(admin)/admin/layout.tsx` still redirects to `/login` unless `session.user.role === "ADMIN"`; the page itself does no additional access decisions (it only reads `session.user.email` for display).

### Task 2 — Fighter dashboard
`/fighter/dashboard` now shows, scoped entirely to the authenticated fighter:
- **Profile summary** — `fighterService.getFighterProfile(userId)` (new reader; previously only an update function existed).
- **Registration status** — reuses `registrationService.listMyRegistrations(userId)` (same function the "Your registrations" page already uses).
- **Upcoming matches** — reuses `matchService.listMatchesForFighter(userId)`, filtered to `SCHEDULED`/`PENDING`.
- **Recent match results** — same call, filtered to `COMPLETED`/`BYE`, with a computed `WIN`/`LOSS` outcome against the fighter's own registration IDs (never trusts a client-supplied identity).
- **Pending requests** — reuses `requestService.listRequestsForFighter(userId)`, filtered to `PENDING`.

Every underlying query is already filtered by `userId` (`listMyRegistrations`, `listMatchesForFighter`, `listRequestsForFighter`, `getFighterProfile` all take `userId` as a required parameter) — there is no code path in the new page or `dashboardService.ts` that can display another fighter's data. Authorization unchanged: `src/app/(fighter)/fighter/layout.tsx` still redirects to `/login` unless `session.user.role === "FIGHTER"`.

### Task 3 — Division transfer capacity bug (M-4)

**Root cause (recap):** `requestService.createRequest` checked the target division's capacity once, at request *creation* time. `requestService.decideRequest` applied the division change on admin *approval* without re-checking. If the division filled up in between — e.g. two pending TRANSFER requests approved close together, or new direct registrations landing first — approval could push a division over its stated capacity.

**Fix:** the capacity check was moved into the TRANSFER branch of `decideRequest`, executed immediately before `registration.save()`:

```ts
const activeCount = await Registration.countDocuments({
  divisionId: updated.requestedDivisionId,
  status: { $in: ACTIVE_REGISTRATION_STATUSES },
  _id: { $ne: registration._id },
});
if (activeCount >= targetDivision.capacity) {
  throw new ConflictError("The target division filled up before this transfer could be approved.");
}
```

This closes the window from "however long the request sat pending" down to a single DB round-trip immediately before the write. If the check fails, the request (already atomically claimed via `findOneAndUpdate({status: "PENDING"}, {status: decision, ...})` to prevent double-decision races) is **rolled back to `PENDING`** rather than left as `APPROVED` with no effect, and an `REGISTRATION_REQUEST_APPROVAL_FAILED` audit entry is written. No email is sent for a transfer that didn't apply. The admin sees the `ConflictError` message and can retry or reject instead.

**Why not a multi-document transaction:** I considered wrapping the recheck-and-apply in a MongoDB session transaction for full atomicity. I did not do this because:
1. The project's documented local/dev `MONGODB_URI` (`mongodb://127.0.0.1:27017/upnroll`) is a standalone instance — MongoDB only supports multi-document transactions on a replica set or sharded cluster. Requiring transactions would break approval in dev/local environments with no deployment-guide warning about it, which the task's "do not break existing functionality" constraint rules out.
2. No part of this codebase uses transactions or `mongoose.startSession()` anywhere; introducing one here would be a new infrastructure pattern, not a reuse of an existing one.
3. The existing codebase's own established pattern for exactly this class of problem (division capacity) is check-then-act (see `registrationService.createRegistration`, unchanged), and for exactly-once decisions is atomic single-document `findOneAndUpdate` with a status-guard filter (see `decideRequest`'s own request-claim, and `paymentService.decidePayment`). The fix follows both existing patterns rather than introducing a new one.

**Residual limitation:** the window between the recheck and `registration.save()` is not literally zero — true elimination of the race under heavy concurrent load would require either a MongoDB transaction (needs a replica-set deployment, an infra decision out of scope here, flagged already as `OD-012`-adjacent) or a maintained capacity counter field on `Division` with atomic `$inc` (a schema change, excluded by this task's constraints). Given that admin approvals are a manual, low-frequency, one-admin-at-a-time action in practice, the fix reduces the race window from "the lifetime of a pending request" (hours/days) to "one database round-trip" (milliseconds) — a complete practical fix, with the remaining theoretical gap documented here rather than silently claimed away, consistent with this project's own documentation style (see `docs/decisions/open-decisions.md`).

**Regression tests added** (`src/server/services/requestService.test.ts`, 5 tests, model-mocked in the same style as `session.test.ts`):
1. Transfer applies when the division has capacity at approval time.
2. Transfer is rejected and the request reverted to `PENDING` when the division is at capacity at approval time (direct M-4 regression test).
3. Two sequential approvals targeting the same division: the first succeeds, the second fails once the (mocked) count reflects the first's change — simulating the concurrent-approval scenario at the unit level.
4. The pre-existing double-decision guard (deciding the same request twice) still works.
5. `CANCELLATION` approvals are unaffected by the capacity-check change (regression safety for the other request type).

---

## Technical decisions

- **Reused existing services wherever one already existed** for the dashboard data (`listPaymentQueue`, `listRequestsForAdmin`/`listRequestsForFighter`, `listMyRegistrations`, `listMatchesForFighter`), adding new functions only where no reader existed (`getFighterProfile`, `countFighters`, `listUpcomingEventsForAdmin`, `listRecentRegistrationsForAdmin`, `listRecentAuditLogs`).
- **`dashboardService.ts` is pure composition** (`Promise.all` over existing service calls) — it contains no direct Mongoose queries itself, so there's exactly one place that owns each query.
- **Design system**: both pages reuse the existing `manga-panel` CSS class and `Badge` component used throughout the rest of the admin/fighter UI (confirmed against `admin/events/page.tsx`, `admin/payments/page.tsx`, `admin/requests/page.tsx`) — no new visual language introduced.
- **"Recent tournament activity" uses the existing `AuditLog` collection** rather than a new activity-feed concept, since every mutating service call (`writeAuditLog`) already writes to it — this was the lowest-footprint way to satisfy that requirement.
- **No schema changes.** `Division`, `Registration`, `FighterProfile`, `AuditLog`, etc. are untouched; all new functions query existing fields.
- **No new dependencies** were added.

## Tests executed and results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npx eslint .` | **0 errors/warnings** |
| `npx vitest run` | **98/98 tests pass** (14 files — 93 pre-existing + 5 new in `requestService.test.ts`) |
| `npm run build` (`next build`, Turbopack) | **Succeeds** — all 34 routes compile, no type or build errors |
| Authorization re-check | `admin/layout.tsx` and `fighter/layout.tsx` confirmed unmodified; both dashboard pages render only session-scoped data, no new access-control branches were introduced in either page |

## Known limitations

- The division-transfer capacity fix closes the race to a single DB round-trip but is not a hard, transaction-level guarantee (see rationale above) — acceptable given the manual, low-concurrency nature of admin approvals, but worth revisiting if the platform later needs stricter guarantees under heavier concurrent admin usage.
- The admin dashboard's "pending payments" and "pending requests" tiles reuse `listPaymentQueue()`/`listRequestsForAdmin()`, which (per the existing, unmodified implementation) load the *entire* collection and filter/enrich in application code. This was already true of the admin Payments and Requests pages before this change; the dashboard does not make it worse, but it does mean the dashboard's cost scales with total submissions/requests, not just pending ones — worth a dedicated `countDocuments` query if submission volume grows large enough to matter.
- No dedicated unit tests were added for `dashboardService.ts` itself (only for the Task 3 logic change, which was the task's explicit testing requirement) — its correctness is covered indirectly by the type check, build, and the fact that every function it composes already has its own test or is exercised by an existing page.

## Remaining tasks

Everything else identified in `PROJECT_RESCUE_REPORT.md` remains open and was intentionally not touched in this phase:
- **H-1**: local-disk payment screenshot storage (client-gated, `OD-012`).
- **H-2**: ranking formula / bracket-format placeholders (client-gated).
- **M-2**: spoofable `X-Forwarded-For` rate-limit key (deployment-dependent, already documented).
- **M-3**: flaky cold-cache Turbopack build on Windows (self-heals on retry).
- **M-5 (partial)**: `loading.tsx` was added only for the two routes touched in this phase (`/admin`, `/fighter/dashboard`); the rest of the app still has no loading states.
- **L-1 through L-6**: storage-adapter interface mismatch, no notifications collection, dependency audit noise, missing weight/age fields on fighter profiles, non-responsive admin UI, stale client-acceptance-checklist.md.

Not proceeding to Phase 2 pending your review of this report.
