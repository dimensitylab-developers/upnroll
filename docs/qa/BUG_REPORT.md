# Bug Report — Manual QA 2026-11-12

**Branch:** `qa/client-demo-readiness-2026-11-12` @ `eb3c5ed`  
**Policy:** Findings only. **No code fixes applied** in this pass (per stakeholder direction).

Severity: Critical / High / Medium / Low

---

## BUG-QA-2026-01 — Missing public event returns HTTP 200

- **Severity:** Medium (SEO/crawlers; UI still shows 404 page)
- **Area:** Public `/events/[slug]` (and related missing resources)
- **Steps:** `curl -D - http://localhost:3000/events/does-not-exist-xyz`
- **Expected:** HTTP 404 with not-found UI
- **Actual:** Not-found UI in browser; response status **200 OK**, `Cache-Control: no-store`
- **Evidence:** curl header dump 2026-11-12; browser snapshot title/headings “404 / Page not found”
- **Root cause (hypothesized):** Next.js 16 Cache Components + `notFound()` status propagation when data is read via `"use cache"`
- **Fix needed:** Product/engineering decision — ensure true 404 status without redesigning public cache model
- **Retest:** Not fixed this pass

---

## BUG-QA-2026-02 — React hydration errors on public nav and auth layout

- **Severity:** Medium (dev Issues badge; possible flicker)
- **Area:** `comic-nav.tsx`, `(auth)/layout.tsx`
- **Steps:** Open `/` or `/login` with Next Dev Tools Issues overlay
- **Expected:** No hydration mismatch
- **Actual:** Hydration error overlay referencing those files
- **Evidence:** Browser snapshot issue text during manual session
- **Retest:** Not fixed this pass

---

## BUG-QA-2026-03 — Coupon apply action has no rate limit

- **Severity:** Medium (abuse / guessing surface)
- **Area:** `frontend/src/features/registrations/coupon-actions.ts`
- **Steps:** Inspect apply path vs login/judge rate limits
- **Expected:** Rate limit similar to login/judge (requirement §4)
- **Actual:** Login/judge use `checkRateLimit`; coupon apply does not
- **Evidence:** Code inspection (runtime brute-force not run against shared DB)
- **Retest:** Not fixed this pass

---

## BUG-QA-2026-04 — Very slow cold navigations on some public routes (dev)

- **Severity:** Medium for demo polish; High if reproduced on production build
- **Area:** `/brackets`, `/rankings`, first compiles
- **Steps:** Sequential curl against cold/compiling `next dev`
- **Expected:** Warm navigations snappy; cold within demo tolerance
- **Actual (lab, dev server):** `/brackets` ~37s, `/rankings` ~35s, `/faq` ~19s; home warm ~1.1s; event detail ~4.4s
- **Evidence:** Timed curl log 2026-11-12
- **Limitation:** Dev + compile + Atlas latency — **not** production RUM
- **Retest:** Production `next start` timings **BLOCKED** this pass (build not re-run after no-fix rule)

---

## BUG-QA-2026-05 — Rankings board can show “Champion” with 0–0

- **Severity:** Low (presentation / seeding UX)
- **Area:** `/rankings`
- **Steps:** Open rankings
- **Expected:** Champion seats reflect meaningful competitive standing or clear “unofficial / seeding” labeling
- **Actual:** Weight-class champions shown with `0 - 0 · 0 pts` while copy says 3 points per win; E2E test fighter also listed
- **Evidence:** Browser snapshot
- **Note:** Ranking methodology still OD-004 placeholder

---

## Open / previously known (not re-validated as fixed)

| ID | Issue | Severity | Notes |
| --- | --- | --- | --- |
| BUG-QA-004 | Home Shuffle click intercept | Medium | Prior report |
| BUG-QA-005 | Hydration during automation fills | Low/Medium | Prior |
| BUG-QA-008 | Soft-click admin event cards | Low | Prior |

## Defects fixed this pass

**None** — stakeholder requested no file changes; earlier experimental edits were reverted.
