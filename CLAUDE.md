# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Up 'n Roll — a full-stack tournament management platform for combat sports (fighter registration, QR payments, bracket generation, live results/rankings, admin review workflows). Next.js 16 (App Router) + TypeScript + MongoDB/Mongoose.

## Commands

All commands run from the repo root (they delegate into `frontend/`):

```bash
npm run dev            # next dev --webpack, http://localhost:3000
npm run build          # next build --webpack
npm run start           # next start
npm run lint             # eslint
npm test                 # vitest run (all tests, frontend + backend)
npm run create-admin    # tsx script, provisions an admin user (needs frontend/.env.local)
npm run seed-demo       # tsx script, seeds demo tournament data
```

Run a single test file or pattern from `frontend/`:

```bash
cd frontend && npx vitest run src/features/auth/some.test.ts
cd frontend && npx vitest run ../backend/services/bracketEngine.test.ts
cd frontend && npx vitest run -t "some test name"
```

Tests live next to the code they cover (`*.test.ts`), in both `frontend/src/**` and `backend/**`. Vitest resolves `@/server/*` → `backend/`, `@/*` → `frontend/src/*`, and stubs `server-only` (see `frontend/vitest.config.ts`).

## Monorepo layout

```
frontend/   Next.js app — routes, UI, server actions, API handlers
backend/    Server-only: Mongoose models, services (business rules), auth, db, http, storage
scripts/    CLI utilities (create-admin, seed-demo, backfills) — run via tsx with frontend/.env.local
docs/       Architecture, phase reports, audits, decisions
```

`frontend/` and `backend/` are two folders in one Next.js project, not independent packages — `backend/` has no `package.json`/`node_modules` of its own. `frontend/tsconfig.json` aliases `@/server/*` → `../backend/*`, and `next.config.ts` adds matching webpack aliases plus `outputFileTracingRoot` pointing at the repo root so backend/ ships correctly on Vercel. **Dependencies used by `backend/` code must be installed in `frontend/package.json`** — there's no separate backend install step.

**Business logic lives in `backend/services/*`, not in routes or components.** Pages, Server Actions, and `frontend/src/app/api/**` route handlers call into `backend/services/*` through the `@/server/*` alias — they should stay thin. Do not re-implement a rule that already exists in a service; add to or extend the service instead. See `backend/README.md`.

### backend/

- `models/` — Mongoose schemas (User, Event, Division, Match, Bracket, Registration, PaymentSubmission, RankingRecord, RegistrationRequest, Session, SiteSettings, MediaAsset, ContentEntry, AuditLog, …)
- `services/` — business logic: `bracketEngine`/`bracketService` (deterministic single-elim generation, seeded-random or manual seeding, bye resolution), `matchService`, `rankingEngine`/`rankingService` (pluggable `RankingStrategy`), `registrationService`/`registrationStateMachine`, `paymentService`/`paymentQueue`, `requestService` (generic admin-reviewed cancel/transfer workflow), `chatbotEngine` (deterministic keyword matching over admin-published FAQ content — no LLM), `eventService`, `fighterService`, `dashboardService`, `mediaService`, `contentService`, `siteSettingsService`, `tournamentRules`
- `auth/` — custom session auth (no third-party auth provider): `session.ts` (cookie + hashed-token sessions in Mongo), `password.ts`, `cookies.ts`, `actor.ts` (session → `Actor` for service calls)
- `storage/` — private-file adapter abstraction (`factory.ts` picks `LocalDiskStorageAdapter` or `GridFSStorageAdapter` via `STORAGE_DRIVER` env var; production requires it set explicitly, no silent default)
- `http/` — rate limiting, typed errors (`UnauthorizedError`, `ForbiddenError`), response helpers, client IP extraction
- `audit/`, `observability/`, `email/`, `notifications/`, `content/`, `validation/`

### frontend/src/app/ route groups

- `(public)/` — public marketing/content pages, shared `SiteHeader`/`SiteFooter`
- `(auth)/` — login, register, verify
- `(fighter)/fighter/` — fighter portal, guarded in `layout.tsx` (redirects to `/login` if no session)
- `(admin)/admin/` — admin portal, guarded in `layout.tsx` (redirects to `/login` if no session, to `/fighter/dashboard` if role isn't `ADMIN`)
- `(preview)/ui-preview/` — internal design showroom, not part of the product
- `api/v1/{admin,fighter,public}/**` — REST handlers, grouped by caller role

There is no `middleware.ts`; auth/role gating happens per-route-group inside each group's `layout.tsx` via `getSession()`/`requireSession()`/`requireRole()` from `@/server/auth/session`.

### frontend/src structure

- `features/<domain>/` — feature-sliced modules (auth, events, brackets, fighter, admin, payments, rankings, requests, chatbot, …) — client components, forms, and thin wrappers around server actions/services for that domain
- `components/` — shared UI (shadcn/ui-based primitives in `components/ui/`, plus layout/content/home components)
- `lib/`, `hooks/`, `data/` — shared utilities, hooks, static/reference data

## Next.js 16 specifics (non-obvious, don't assume prior-knowledge Next.js behavior)

- **Cache Components is on** (`cacheComponents: true` in `next.config.ts`), with `partialPrefetching: true` required alongside it on this Next 16.4.x version to avoid shared-shell poisoning. Routes that read cookies/session/DB must be marked request-bound — call `connection()` (from `next/server`) before reading cookies/Mongo/`Date.now()`. See the `readSession`/`getSession()` split in `backend/auth/session.ts`: `getSession()` calls `connection()` first, then delegates to a `cache()`-wrapped (request-deduped) inner reader.
- Session/role-gated layouts export `export const instant = false;` to prevent Next from trying to instant-prerender a cookie-bound portal (see `(admin)/admin/layout.tsx`).
- `DynamicBoundary` (`frontend/src/components/dynamic-boundary.tsx`) is a thin `Suspense` wrapper used to isolate dynamic (session-dependent) subtrees from statically-prerenderable shells.
- A `node_modules/next/dist/server/lib/generate-agent-files.js`-managed block exists at the top of `frontend/AGENTS.md` — it's regenerated by `next dev`/`next build` and references Next.js docs bundled in `node_modules/next/dist/docs/` that may diverge from training data for this Next.js version. If touching App Router APIs, check those docs rather than assuming a prior Next.js version's behavior.
- `mongoose`, `mongodb`, and `nodemailer` are `serverExternalPackages` and get an explicit webpack alias pinned to a single resolved path — this is required to keep one shared Mongoose connection across server chunks; don't remove the aliasing in `next.config.ts` when touching webpack config.
- `scripts/ensure-root-modules.mjs` runs as `predev`/`prebuild` — it links/ensures root-level `node_modules` exist so `backend/` (which resolves packages by walking up from its own folder) can find dependencies installed under `frontend/node_modules`.

## Security headers

`next.config.ts` sets strict security headers (HSTS, X-Frame-Options: DENY, nosniff, restrictive Permissions-Policy) and a `Content-Security-Policy-Report-Only` header. CSP is enforced in report-only mode until a nonce/hash strategy for Next's inline bootstrap scripts exists — don't flip it to enforcing without that in place.
