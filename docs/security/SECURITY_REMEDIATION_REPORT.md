# Security Remediation Report — Phase 1

Date: 2026-11-09  
Branch: `suraj`  
Scope: Application security hardening (Phase 1 of production code remediation)

## Issues addressed

| Issue | Original | Change | Improvement |
|-------|----------|--------|-------------|
| Admin event registrations listing ignored Actor / lacked `assertAdmin` | `listRegistrationsForEvent(eventId)` while page called `(actor, id)` | Require `Actor` + `assertAdmin` | Closes authz gap and restores correct eventId query |
| Session fixation / stale cookie after login | New session issued without revoking prior cookie session | Delete prior hashed session before create | Prior cookie cannot remain valid post-auth |
| Verify / resend brute force | Unauthenticated code paths unlimited | IP rate limits | Reduces guessing and inbox flooding |
| OAuth login CSRF / unbound state | HMAC state only in query string | Cookie-bound signed state + clear after use; reject DISABLED | State must match browser cookie |
| Loose Mongo ids | Raw strings into `findById` | Canonical ObjectId refine + service guards | Fewer CastError / injection-shaped inputs |
| Fighter actions used bare session | Admin could enter fighter mutation path until service assert | `requireActor("FIGHTER")` | Role enforced at action boundary |
| Transfer invite tokens plaintext | Raw token stored in Mongo | SHA-256 `tokenHash` only; rotate on recreate | DB leak does not yield usable tokens |
| Missing transport / feature headers | nosniff / referrer / frame only | HSTS + Permissions-Policy | Stronger browser default posture |

## Remaining security concerns

- CSP still Report-Only (Next.js inline bootstrap needs nonces before enforce).
- In-memory rate limiter is single-instance.
- ObjectId guards not yet on every bracket/match/event mutation path.
- Enforcing CSP / multi-instance rate limits / dependency CVE review still open.
- Manual verification required for login, OAuth, transfer links, and admin registration lists.

## Manual security verification (owner)

1. Login → confirm prior session cookie no longer authenticates after re-login.
2. Exhaust verify attempts → rate-limit message.
3. Admin event page → registrations list populates for a real event.
4. Fighter cannot call admin payment approve (already covered by services; spot-check UI).
5. Google OAuth with env configured → success; tamper state cookie → fail.
6. Create transfer link → claim with teammate → second claim fails; DB shows `tokenHash` only.
