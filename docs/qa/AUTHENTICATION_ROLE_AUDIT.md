# Authentication & Role Audit

## Unauthenticated

| Check | Result |
|-------|--------|
| Public pages accessible | PASS |
| `/fighter/*` without cookie | HTTP 307 → `/login` |
| `/admin/*` without cookie | HTTP 307 → `/login` |
| Private photo/screenshot APIs | Not re-hit this pass; prior hardening requires role |

## Fighter (live test account)

| Check | Result |
|-------|--------|
| Register → verify → session | PASS |
| Dashboard/profile/new registration | PASS |
| Header shows Dashboard when logged in on public home | PASS |
| Access `/admin` | After fix: redirect to `/fighter/dashboard` (not login). Server still enforces `assertAdmin` if page races. |
| Cross-fighter private data | Not attempted (no second fighter session) |

## Admin

| Check | Result |
|-------|--------|
| Admin login | **BLOCKED** — no admin seed credentials in `.env.local` |
| Admin pages / actions | **NOT TESTABLE** |

## Session

| Check | Result |
|-------|--------|
| Login via verify creates session | PASS |
| Refresh fighter dashboard | PASS (session retained) |
| Logout | Not clicked (kept session for subsequent pages) |
| Google OAuth | BLOCKED — missing `GOOGLE_CLIENT_ID/SECRET` |
| Session expiration | NOT TESTED |

## Fixes from this audit

- Role-mismatch redirects no longer dump authenticated users onto `/login` (`f951b63`)
- Admin overview skips data load when role ≠ ADMIN during Suspense race (`f951b63`)
