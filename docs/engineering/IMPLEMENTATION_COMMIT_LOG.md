# Implementation Commit Log

Branch: `suraj`  
Started: 2026-11-09  
Rule: one focused Conventional Commit per implementation point; phase milestone after each phase.

| Phase | Implementation | Commit Hash | Status |
|-------|----------------|-------------|--------|
| Phase 0 | Remediation checklist + commit log | `ed24b64` | Completed |
| Phase 1 | Event registration listing authz | `d8168be` | Completed |
| Phase 1 | Session rotation on create | `9edbc4f` | Completed |
| Phase 1 | Verify/resend rate limits | `df903cb` | Completed |
| Phase 1 | ObjectId validation | `c82f83e` | Completed |
| Phase 1 | Google OAuth state cookie | `e655999` | Completed |
| Phase 1 | Fighter actor + hashed transfer tokens | `914e6d5` | Completed |
| Phase 1 | HSTS + Permissions-Policy | `2dc10d1` | Completed |
| Phase 1 | Phase completion checkpoint | `8189bd2` | Completed |
| Phase 2 | Payment queue bound + detected MIME | `1c69684` | Completed |
| Phase 2 | Transfer payment ownership rewrite | `40e2a58` | Completed |
| Phase 2 | Bracket concurrent generation | `8523785` | Completed |
| Phase 2 | Compound indexes | `793f6e1` | Completed |
| Phase 2 | Phase completion checkpoint | `8cb5a15` | Completed |
| Phase 3 | Stream private downloads + metadata | `0e22c1c` | Completed |
| Phase 3 | Phase completion checkpoint | _pending_ | In progress |

---

## Commit detail

### Phase 0 — Repository investigation

- **Hash:** `ed24b648206019008a889506468fd0f57ae31bfe`
- **Message:** `docs(engineering): add production hardening remediation checklist`
- **Files:** `docs/engineering/REMEDIATION_CHECKLIST.md`, `docs/engineering/IMPLEMENTATION_COMMIT_LOG.md`
- **Summary:** Documented inspected architecture, prioritized remediation items, and commit-tracking process. No application code changed.
- **Limitations:** Untracked pre-existing architecture docs under `docs/architecture/` intentionally excluded.

### Phase 1 — Application security hardening

#### P1-01 Event registration listing
- **Hash:** `d8168be2f4adf6cd7afb51f1dc927ca5f4a95b82`
- **Message:** `security(authz): require admin actor for event registration listing`
- **Files:** `backend/services/registrationService.ts`, `backend/services/authorization.security.test.ts`
- **Summary:** `listRegistrationsForEvent` now takes `Actor`, asserts ADMIN, and matches the admin page call site (previously treated the Actor object as `eventId`).
- **Limitations:** Manual verification needed on an admin event with real registrations.

#### P1-02 Session rotation
- **Hash:** `9edbc4f28cd3e95ab84c0e79f0ab700463d3dcda`
- **Message:** `security(auth): revoke prior session cookie before issuing a new token`
- **Files:** `backend/auth/session.ts`, `backend/auth/session.test.ts`
- **Summary:** `createSession` deletes any prior cookie-bound session row before issuing a new token.
- **Limitations:** Does not revoke sessions on other devices (by design for this pass).

#### P1-03 Verify/resend rate limits
- **Hash:** `df903cb3bbcdb93b9e0b1cd8d8ea7b01334b21f3`
- **Message:** `security(auth): rate-limit email verification and code resend`
- **Files:** `frontend/src/features/auth/actions.ts`
- **Summary:** IP token-bucket limits on verify and resend actions.
- **Limitations:** In-memory limiter remains single-instance only.

#### P1-05 ObjectId validation
- **Hash:** `c82f83ecdd6816c73c3c63b0b1771347c293fd61`
- **Message:** `security(validation): enforce MongoDB ObjectId format on id inputs`
- **Files:** `backend/validation/objectId.ts`, schemas under `frontend/src/features/*`, registration/payment services
- **Summary:** Canonical 24-hex validation at schemas and key service boundaries.
- **Limitations:** Not every service method wrapped yet (bracket/match/event update paths follow in later phases).

#### P1-04 Google OAuth state
- **Hash:** `e6559990dc49591ec5257891ad3330ba67452da5`
- **Message:** `security(oauth): bind Google OAuth state to an HttpOnly cookie`
- **Files:** `backend/auth/oauth-state.ts`, Google auth route handlers
- **Summary:** Signed cookie + signed query state must match; DISABLED users rejected; cookie cleared after use.
- **Limitations:** Requires live Google credentials for end-to-end verification.

#### P1-06 / P1-08 Fighter actor + transfer tokens
- **Hash:** `914e6d591ec7ef9d7ef2617986ca9caedf354588`
- **Message:** `security(authz): require fighter actors and hash transfer invite tokens`
- **Files:** fighter Server Actions, `teammateTransfer.ts`, `TransferInvite` model
- **Summary:** `requireActor("FIGHTER")` on fighter mutations; transfer tokens hashed at rest; claim uses transaction + `findOneAndUpdate`.
- **Limitations:** Existing plaintext `token` invites (if any) become invalid; operators should regenerate links. PaymentSubmission.userId is not rewritten on transfer (pre-existing behavior).

#### P1-07 Security headers
- **Hash:** `2dc10d14163cd560d854a81d98365d6f9babe177`
- **Message:** `security(headers): add HSTS and Permissions-Policy`
- **Files:** `frontend/next.config.ts`
- **Summary:** Added HSTS and Permissions-Policy; CSP remains Report-Only.
- **Limitations:** Enforcing CSP needs a Next.js nonce strategy first.
