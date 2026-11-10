# Production Hardening — Remediation Checklist

Branch: `suraj`  
Investigation date: 2026-11-09  
Method: Source inspection against architecture docs and live call sites.  
Status: Living checklist — items move to Completed as commits land.

## Phase 0 findings (summary)

The product core is wired (auth → registration → UTR review → brackets → rankings). Prior phases already delivered scrypt passwords, hashed session tokens, Actor-based service authorization, atomic occupancy claims, payment decision races via `findOneAndUpdate`, magic-byte image checks, and report-only CSP. Remaining work is gap closure, not a rewrite.

Pre-existing untracked architecture docs under `docs/architecture/` were left untouched (not part of this hardening commit stream).

---

## Phase 1 — Application security

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P1-01 | Fix `listRegistrationsForEvent` signature/auth (caller passes Actor; service ignores it → empty/wrong query + no `assertAdmin`) | Critical | Completed (`d8168be`) |
| P1-02 | Destroy prior session cookie/DB row before issuing a new session (login / verify / OAuth) | High | Completed (`9edbc4f`) |
| P1-03 | Rate-limit email verify + resend code actions | High | Completed (`df903cb`) |
| P1-04 | Bind Google OAuth `state` to an HttpOnly cookie; reject `DISABLED` users on callback | High | Completed (`e655999`) |
| P1-05 | Add strict MongoDB ObjectId validation; apply to ID fields in action schemas | High | Completed (`c82f83e`) |
| P1-06 | Enforce FIGHTER actor on fighter-only Server Actions that currently use bare `requireSession` | High | Completed (`914e6d5`) |
| P1-07 | Add HSTS + Permissions-Policy; keep CSP Report-Only until Next nonce strategy exists | Medium | Completed (`2dc10d1`) |
| P1-08 | Hash transfer-invite tokens at rest; return raw token only once to the creator | High | Completed (`914e6d5`) |

## Phase 2 — Database & data integrity

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P2-01 | Bound / filter `listPaymentQueue` query (status + limit) | Medium | Completed (`1c69684`) |
| P2-02 | Make teammate transfer claim transactional + occupancy-safe | High | Completed (`914e6d5` + `40e2a58`) |
| P2-03 | Harden bracket generation against concurrent duplicate creates (unique index awareness) | Medium | Completed (`8523785`) |
| P2-04 | Review indexes on Registration / PaymentSubmission / Session / TransferInvite | Medium | Completed (`793f6e1`) |
| P2-05 | Use detected image content-type (not client MIME) when storing payment screenshots | Medium | Completed (`1c69684`) |

## Phase 3 — GridFS & file security

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P3-01 | Stream large private downloads where route handlers currently buffer via `get()` | Medium | Completed (`0e22c1c`) |
| P3-02 | Confirm authorization on all private file routes; Content-Disposition attachment for screenshots | Medium | Completed (`0e22c1c`) |
| P3-03 | Document orphan cleanup expectations for failed GridFS uploads | Low | Completed (report) |

## Phase 4 — Backend code quality

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P4-01 | Migrate teammate transfer to Actor + assertFighter | Medium | Completed (`914e6d5`) |
| P4-02 | Centralize ObjectId parse helper used by services | Medium | Completed (`c82f83e` + match usage `dbe0216`) |
| P4-03 | Soft-fail / isolate WhatsApp mock behind clearer interface comments | Low | Completed (`dbe0216`) |

## Phase 5 — Next.js

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P5-01 | Ensure fighter/admin actions consistently use `requireActor` | Medium | Completed (`914e6d5` + `85cb144`) |
| P5-02 | Avoid leaking internal error detail through Server Action returns (audit) | Medium | Completed (existing `toAppError`; CastError `3242cdc`) |

## Phase 6 — External integrations

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P6-01 | SMTP transport timeouts (connection / greeting / socket) | High | Completed (`047f3b0`) |
| P6-02 | Document Google OAuth env vars in `.env.example` | Medium | Completed (`047f3b0`) |
| P6-03 | Keep WhatsApp mocked; document non-production status clearly | Medium | Completed (`dbe0216`) |

## Phase 7 — Errors & logging

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P7-01 | Structured server logger (no secrets / passwords / session tokens / full UTR dumps) | Medium | Completed (`3242cdc`) |
| P7-02 | Map Mongoose CastError → ValidationError at the boundary | Medium | Completed (`3242cdc`) |

## Phase 8 — Cleanup

| ID | Item | Priority | Status |
|----|------|----------|--------|
| P8-01 | Remove dead imports / obvious safe dead code only after path verification | Low | Deferred (no unsafe deletions) |
| P8-02 | Align stale production-readiness wording where GridFS is already implemented | Low | Completed (status note) |

## Explicitly out of scope (per task)

- New automated test suites / E2E / load / pen-tests
- Firebase, Supabase, Postgres, Nest, Express, Resend, React Query
- Replacing custom session auth or Mongoose
- Destructive DB migrations
- Pushing to remote

## Already in good shape (leave unless a regression appears)

- scrypt password hashing + timing-safe verify
- Session token SHA-256 at rest + HMAC-signed cookie
- Actor pattern + `assertAdmin` / `assertFighter` on most services
- Atomic division capacity claims
- Payment approval single-winner `findOneAndUpdate`
- Magic-byte image validation for screenshots / profile photos
- Private file routes with role checks + `nosniff` + `no-store`
- In-memory rate limit on login/register (single-instance limitation accepted)
