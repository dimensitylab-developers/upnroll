# Code Hardening Report

Date: 2026-11-09  
Branch: `suraj`

## What was inspected

- Architecture docs under `docs/architecture/` (untracked copies preserved where present)
- Auth/session/cookies/password, Actor authorization, Server Actions, Route Handlers
- Registration, payment, bracket, match, transfer, GridFS/local storage
- SMTP, Google OAuth, WhatsApp mock
- Next.js headers, proxy cookie gate, fighter/admin portals

## What was fixed / improved

- Critical admin registration listing authz + argument bug
- Session rotation, verify/resend rate limits, OAuth cookie-bound state
- ObjectId validation, fighter actor enforcement, hashed transfer tokens
- HSTS + Permissions-Policy
- Bounded payment queue, detected MIME storage, transfer payment ownership, bracket race mapping, indexes
- Streaming private file delivery + upload metadata
- WhatsApp mock port, SMTP timeouts, structured logger, CastError mapping
- Fighter new-registration page actor wiring

## Left unchanged (intentionally)

- Custom session architecture, Mongoose/MongoDB Atlas, GridFS preference
- No Firebase/Supabase/Postgres/Nest/Express/Resend/React Query
- WhatsApp remains mock (no real provider)
- CSP remains Report-Only pending Next nonce strategy
- In-memory rate limiter (single-instance)
- No new automated test suites / E2E / load / pen-tests
- Pre-existing untracked architecture docs not force-committed as a baseline

## Architecture impact

- Module boundaries preserved (`@/server/*` colocated services)
- TransferInvite schema field `token` → `tokenHash` (compatibility: regenerate pending invites)
- New modules: `backend/validation/objectId.ts`, `backend/auth/oauth-state.ts`, `backend/http/streamFile.ts`, `backend/observability/logger.ts`
- Private file routes now depend on `storage.open` streaming rather than `get` buffering
