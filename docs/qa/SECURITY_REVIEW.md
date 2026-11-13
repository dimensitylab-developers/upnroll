# Security Review — Manual / non-destructive QA 2026-11-12

**Scope:** Isolated local/dev exercise + Vitest security suites. **Not** a penetration test or certification.  
**Environment:** Shared Atlas DB name `test` via local `.env.local` — treat as staging/shared, not a clean production silo.

## Findings

| ID | Finding | Severity | Evidence | Status |
| --- | --- | --- | --- | --- |
| SEC-A | Unauthenticated `/fighter/*` and `/admin` redirect to login | — | curl 307 | Control working |
| SEC-B | Unauthenticated `/judge` redirects to `/judge/login` | — | curl 307 | Control working |
| SEC-C | Service-layer rejects fighter admin operations | — | `authorization.security.test.ts` PASS | Control working |
| SEC-D | Judge bad credentials rejected without session | — | Browser alert | Control working |
| SEC-E | Login bad credentials rejected | — | Browser alert | Control working |
| SEC-F | Coupon apply lacks rate limiting | Medium | Code vs login/judge | BUG-QA-2026-03 |
| SEC-G | Missing-event HTTP 200 | Medium | curl | BUG-QA-2026-01 (info disclosure low; SEO) |
| SEC-H | Payment screenshots intended admin-only | — | Route + prior audits | Not re-hit byte delivery this pass |
| SEC-I | In-memory rate limiter not multi-instance safe | Medium (known) | `rateLimit.ts` comments | Accepted limitation |
| SEC-J | MONGODB URI without explicit DB name lands on `test` | Medium ops | Env classification | Misconfiguration risk |
| SEC-K | Secrets in `.env.local` | — | Present | Never logged in reports |

## AuthZ notes

- Hiding UI is not authorization; service `assertAdmin` / `assertFighter` / judge match binding are the real gates (covered by unit tests).
- Judge credentials scoped per match; passwords hashed; plaintext returned once on generate (by design).

## Explicitly not covered this pass

- Dependency CVE scan (`npm audit`) not run  
- CSRF deep dive beyond Next Server Actions defaults  
- Production header enforcement beyond local header sample  
- Concurrent coupon race against live shared DB (avoided to protect shared data)  
- Real email phishing / link token abuse  

## Verdict

**Security posture for a client demo of core flows is acceptable with limitations.** Manual payment + admin verification reduces card-data risk. Coupon guessing rate limit and shared Atlas `test` DB should be addressed before calling the deployment hardened.
