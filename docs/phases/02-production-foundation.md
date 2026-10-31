# Phase 2 — Production Foundation

Date: 2026-10-31. Scope: auth, roles, database connection, foundational domain models, validation, API/error conventions, auditing, storage/email abstractions, minimal production route layouts, environment configuration. Full scope rationale and architectural decisions are in `C:\Users\Suraj\.claude\plans\ethereal-floating-sparrow.md` (approved plan) — summarized here per Part U's reporting format.

## Phase summary

Built the auth-adjacent production foundation only, per "do not implement every phase simultaneously." Events/Divisions/Registrations/Brackets/Matches/Rankings/Content remain Phase 3–5 (unbuilt). The public homepage remains the Phase 1 placeholder. What now exists end-to-end: a fighter can register, get a session, and reach a guarded `/fighter/dashboard`; an admin account (created only via a local CLI script, never a public endpoint) can reach a guarded `/admin` overview. All of it is backed by real MongoDB models, server-side session verification, and audit logging — not fixtures.

## Actual files changed

**Config/DB**: `.env.example`, `src/lib/config.ts`, `src/server/db/connect.ts`
**Models**: `src/server/models/{User,Session,FighterProfile,AuditLog}.ts`
**Auth**: `src/server/auth/{password,cookie-name,cookies,session}.ts`
**HTTP conventions**: `src/server/http/{errors,response}.ts`
**Audit**: `src/server/audit/log.ts`
**Storage/email abstractions**: `src/server/storage/{types,local-disk}.ts`, `src/server/email/{types,console}.ts`
**Auth feature**: `src/features/auth/{schemas,actions,login-form,register-form}.tsx`
**Routes**: `src/app/(auth)/{layout,login/page,register/page}.tsx`, `src/app/(fighter)/fighter/{layout,dashboard/page}.tsx`, `src/app/(admin)/admin/{layout,page}.tsx`
**Proxy**: `src/proxy.ts`
**Scripts**: `scripts/create-admin.ts`
**Tests**: `vitest.config.ts`, `src/server/auth/password.test.ts`, `src/server/auth/cookies.test.ts`, `src/features/auth/schemas.test.ts`, `src/server/http/errors.test.ts`
**Config changes**: `package.json` (added `vitest`, `tsx` devDependencies; `test`/`create-admin` scripts), `.gitignore` (`.local-storage/`)

## Architectural decisions

- **Hand-rolled session auth**, not a third-party framework — avoids an unverified adapter-compatibility risk against Next 16/React 19, keeps the session model under direct control (DB-backed, immediately revocable, unlike a bare JWT). Passwords hashed with Node's built-in `crypto.scrypt`; session cookie is an HMAC-signed reference to a server-side `Session` document, not the credential itself.
- **`src/proxy.ts` confirmed as the correct Next 16 filename** by reading `node_modules/next/dist/lib/constants.js` directly (`PROXY_FILENAME = 'proxy'`) rather than assuming — resolves OD-013. The file only checks cookie *presence* (no crypto) so it stays Edge-runtime-compatible; actual session/role verification happens server-side in every guarded layout and Server Action, never trusting the proxy alone.
- **No public admin registration**: `/register` only creates `FIGHTER` accounts. `scripts/create-admin.ts` is a local CLI tool (`npx tsx scripts/create-admin.ts --email ... --password ...`), not an HTTP route.
- **Storage/email are interfaces + dev adapters only** (local disk, console log) — no real provider chosen, per OD-012 still being open. Swapping in a real provider later won't touch calling code.
- **No REST endpoints yet** — Phase 2's auth UI uses Server Actions (`src/features/auth/actions.ts`), matching Part K's guidance to share services between Server Actions and REST handlers; `/api/v1/*` arrives with Phase 3's registration API, which needs externally-callable routes.

## Functional verification

Commands actually run, with real results:

- `npm run lint` — clean (0 errors, 0 warnings).
- `npm run test` (vitest) — **20/20 tests passed**: password hashing roundtrip + rejection + salt-uniqueness + malformed-input handling; cookie signing roundtrip + tamper rejection + malformed-input handling; register/login zod schema acceptance and rejection cases; `AppError` subclass → HTTP status/code mapping, including that an internal error's message never leaks (`toAppError` test asserts the raw error text doesn't appear in the sanitized message).
- `npm run build` — **passes**. Route output confirms `src/proxy.ts` compiled as an Edge proxy (`ƒ Proxy (Middleware)`), `/login` and `/register` prerender as static (no DB touched at build time), `/admin` and `/fighter/dashboard` are correctly marked dynamic (server-rendered per request, since they call `getSession()`).
- `scripts/create-admin.ts` smoke-tested twice: (1) run with no env vars — fails fast with the exact expected `zod` validation error listing both missing vars, confirming `getConfig()`'s fail-fast behavior; (2) run with valid-shaped env vars but no reachable MongoDB — reaches `mongoose.connect()` and hangs until timeout, confirming the code path is correct up to the point an actual database is required.

## Known limitations (stated plainly, not glossed over)

- **No live database was available in this environment** (Docker is installed but its daemon isn't running; no local `mongod`). The full register → login → `/fighter/dashboard` flow, and the admin-creation → login → `/admin` flow, are verified at the code/type level and via the unit tests above, but **not as a running end-to-end test against a real MongoDB**. This is the single biggest gap before calling Phase 2 done — it should be the first thing verified once a MongoDB URI (local or Atlas) is available.
- `StorageAdapter`/`EmailAdapter` are interfaces with dev-only stand-ins; no file is actually served back out yet (no signed-URL route), and no email is ever really sent (console log only) — both correctly scoped as Phase 2 "foundation," completed when their real features (payment screenshots, notifications) are built.
- Pre-existing `npm audit` findings (critical/high severity) trace entirely to the `shadcn` CLI devDependency's own dependency tree (inherited from Phase 0/1, confirmed via `npm ls @modelcontextprotocol/sdk`) — not introduced by this phase, not shipped to production, flagged for the Phase 6 hardening pass rather than fixed here (force-fixing risks breaking the CLI tool and wasn't in this phase's scope).
- Rate limiting and CSRF-beyond-`sameSite` (Part M) are not yet implemented — noted as still open, to be addressed before Phase 6 hardening if not sooner.

## Requirement status

Advances FTR-001 (fighter login + private dashboard shell) and ADM-001 (admin portal access gating) from the scope matrix to "foundation in place, content pending." No scope-matrix row is marked fully complete — all of them still need their Phase 3–5 feature content.

## Next phase dependencies

- A reachable MongoDB (local Docker container or Atlas URI) to actually run the auth flow end-to-end and unblock Phase 3's registration/payment work, which builds directly on `User`/`FighterProfile`.
- OD-012 resolution (storage/email provider) before Phase 3's payment-screenshot upload can move past the local-disk dev adapter.
- Client sign-off on OD-001–OD-008 (disciplines, divisions, bracket format, ranking methodology, fees, QR artwork, cancellation policy, refund workflow) before Phase 3/4 domain models can be finalized.
