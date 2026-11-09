# Bug Fix Report — Runtime Audit

## BUG-QA-001 — Public pages 500 under cacheComponents

- **Affected routes:** `/`, `/events`, `/rankings`, `/faq`, `/about`, `/brackets`, fighter/event detail pages using `force-dynamic`
- **Description:** Next.js 16 rejects `export const dynamic = "force-dynamic"` when `cacheComponents: true`
- **Reproduction:** `npm run dev` → open `/` → compile error 500
- **Root cause:** Incompatible route segment config
- **Severity:** Critical (app unusable)
- **Fix:** Remove `force-dynamic` exports from 9 public pages
- **Files:** `frontend/src/app/(public)/**/page.tsx` (listed in commit)
- **Commit:** `902a3a1`
- **Retest:** `/` loads with full homepage content — PASS

## BUG-QA-002 — SiteHeader current-time prerender error

- **Affected routes:** Any public layout using `SiteHeader` (e.g. `/rankings/demo`)
- **Description:** `toLocaleDateString` / `new Date` flagged before request data under cacheComponents
- **Reproduction:** Navigate public pages; server log shows `next-prerender-current-time`
- **Root cause:** Date formatting without prior `connection()`
- **Severity:** High (noisy errors; potential unstable rendering)
- **Fix:** `await connection()` then format date
- **Files:** `frontend/src/components/layout/site-header.tsx`
- **Commit:** `5d9e3e4`
- **Retest:** Public pages load; error no longer dominant in terminal for subsequent navigations — PASS

## BUG-QA-003 — Wrong-role portal redirect to login

- **Affected routes:** `/admin` as FIGHTER (and `/fighter` as ADMIN by symmetry)
- **Description:** Authenticated fighter visiting `/admin` landed on `/login`, appearing logged out
- **Reproduction:** Sign in as fighter → open `/admin` → `/login` (session still valid)
- **Root cause:** Layouts redirected all non-matching roles to `/login`
- **Severity:** Medium (authz OK; UX confusing; Suspense child threw ForbiddenError)
- **Fix:** Redirect fighters → `/fighter/dashboard`, admins → `/admin`; admin overview returns null if not ADMIN
- **Files:** `admin/layout.tsx`, `fighter/layout.tsx`, `admin/page.tsx`
- **Commit:** `f951b63`
- **Retest:** Fighter `/admin` → fighter dashboard — PASS

## Open defects (not fixed this pass)

| ID | Issue | Severity | Why not fixed |
|----|-------|----------|---------------|
| BUG-QA-004 | Home Shuffle click intercepted by overlapping element | Medium | Needs design/CSS pointer-events investigation beyond smallest safe change in this pass |
| BUG-QA-005 | Intermittent Next hydration issue badge during automated form fills | Low/Medium | Not reproduced on clean register load; may be automation artifact |
| BUG-QA-008 | Soft-click on `/admin/events` cards sometimes does not navigate | Low | Hard nav works; Link/overlay intercept still open |

## BUG-QA-007 — AdminNav hydration mismatch

- **Affected routes:** `/admin/*`
- **Description:** Next Dev Tools reported hydration attribute mismatch rooted at `admin-nav.tsx` (and bubbled as media-page issue 2/2)
- **Reproduction:** Browse admin after prior soft navigations / HMR; Issues badge shows react-hydration-error
- **Root cause:** Pathname-driven `className` on server HTML vs client after Cache Components / soft nav
- **Severity:** Medium (dev noise; possible flash of wrong active link)
- **Fix:** Defer active styles until after hydrate via `useSyncExternalStore`; set `aria-current="page"`. Same pattern on `FighterNav`
- **Files:** `frontend/src/features/admin/admin-nav.tsx`, `frontend/src/features/fighter/fighter-nav.tsx`
- **Retest:** Clean `/admin` and `/admin/media` load — no Issues badge — PASS

## Coverage note

- BUG-QA-006 (admin untested) **closed** by admin portal pass — see `ADMIN_PORTAL_AUDIT.md`. Approve/Reject payment and request Decide still need seeded pending rows.
