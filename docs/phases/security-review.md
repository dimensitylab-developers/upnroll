# Security Review — Phase 6

Two passes: a manual review against Part M's specific requirements, and an automated OWASP-style diff review (the `security-review` skill) against this phase's actual code changes.

## Automated review (diff-scoped)

Ran against the full Phase 6 diff (rate limiting, error boundaries, `/ui-preview` gating, index additions, the `findOneAndUpdate` option fixes, accessibility fixes). **Zero high-confidence findings.** The one thing it surfaced during analysis — that `getClientIp()` trusts the `X-Forwarded-For` header for rate-limit keying, which is spoofable if the app isn't deployed behind a proxy that sets it — is explicitly out of scope for that review (rate-limiting bypass is a hard exclusion in its own rules) and was already called out honestly in the code's own comment and in `docs/deployment/deployment-guide.md` before the review ran, not discovered by it.

## Manual review against Part M

- **Session management**: DB-backed, immediately revocable (not a bare JWT), HMAC-signed cookie reference (Phase 2) — unchanged this phase, re-verified by the new `session.test.ts` (8 tests covering no-cookie, tampered-cookie, expired-session, disabled-user, wrong-role, and correct-role paths with the DB layer mocked, so the *decision logic* itself is now under test, not just exercised informally).
- **CSRF**: confirmed directly from `node_modules/next/dist/server/app-render/action-handler.js` that Server Actions reject requests whose `Origin` doesn't match the `host`/`x-forwarded-host` header ("Invalid Server Actions request.") — this is Next's own built-in protection, not something this app opted into or could accidentally disable. No custom CSRF token layer was added, deliberately — it would be redundant.
- **Rate limiting**: added for login/registration (the two unauthenticated, credential-guessing-relevant actions) this phase. Explicitly documented as single-instance-only — see deployment guide.
- **No public admin registration**: unchanged since Phase 2 — `/register` only ever creates `FIGHTER` accounts; `scripts/create-admin.ts` is the only path to an `ADMIN` account and is CLI-only, verified again this phase (grepped for any route that imports it or constructs a `User` with role `ADMIN` outside that script — none).
- **Authorization re-checked server-side everywhere**: every admin Server Action calls `requireRole("ADMIN")` itself rather than trusting the admin layout's redirect — this was already true from Phase 2 onward; this phase adds the first real *test coverage* proving `requireRole` actually rejects a mismatched role rather than just asserting it by inspection.
- **Private data exposure**: payment screenshots are served only through `GET /api/v1/admin/payments/[id]/screenshot`, which calls `requireRole("ADMIN")` inside the handler itself (not just relying on the admin layout) — confirmed again this phase, unchanged.
- **`/ui-preview` production exposure**: this phase's one real new restriction — previously the showroom (fictional data only, but still internal-facing UI patterns and the full admin/fighter chapter structure) was reachable in any deployment. Now gated behind an explicit `UI_PREVIEW_ENABLED` opt-in outside local dev, correctly implemented as a per-request check (`force-dynamic`) rather than a build-time one that would have baked the wrong answer into a static 404 for every environment including ones where it should be enabled.

## What this review does not cover

- No live penetration testing — code review only, same limitation as the rest of this phase's "no live multi-user adversarial testing" gap.
- No dependency-level CVE review beyond the `npm audit` pass already documented in `docs/phases/06-production-hardening.md` (that's a supply-chain concern, handled separately from this code-level review).
- OWASP categories not newly touched by this phase's diff (e.g., no new file upload paths, no new injection surfaces) weren't re-audited from scratch — they were already covered in Phases 2–5's own work and aren't revisited here unless this phase's changes touched them.
