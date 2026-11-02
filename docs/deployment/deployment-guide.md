# Deployment Guide

Phase 6. Covers what's actually needed to run a real deployment of the code as it exists today — not a speculative future-state guide.

## Required environment variables

See `.env.example` for the authoritative list. Summary:

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | Yes | Validated at request time by `src/lib/config.ts` (zod) — the app fails fast with a clear error if missing, not a silent crash. |
| `SESSION_SECRET` | Yes | ≥32 chars, used to HMAC-sign session cookies (`src/server/auth/cookies.ts`). Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. **Rotating this invalidates every existing session** — expected and fine, not a bug. |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Only for `scripts/create-admin.ts` | Never read by the running app itself — CLI-only, per Part M's "no public admin registration." |
| `UI_PREVIEW_ENABLED` | Optional | `/ui-preview` is enabled in local dev automatically; in any built (`NODE_ENV=production`) deployment it 404s unless this is explicitly `"true"`. Leave unset in real production; set it only for an authorized review/staging deployment. |

## Build and run

```bash
npm install
npm run build
npm run start   # serves the production build
```

No custom server — standard Next.js App Router output, deployable to any Node 20+ host or a Next-aware platform (Vercel, etc.). The one infra-relevant constraint: `src/proxy.ts` (the session-cookie-presence check) runs on the Next.js Edge runtime by design — confirmed in Phase 2 that it only imports `node:crypto`-free code for exactly this reason, so it's portable to any host that supports Next's Edge runtime.

## Admin bootstrap

There is no public admin registration (Part M). After the first deploy:

```bash
npx tsx --env-file=.env.local scripts/create-admin.ts --email you@example.com --password "a-real-password"
```

Run this against the **same** `MONGODB_URI` the deployed app uses. Re-running it on an existing email promotes that user to `ADMIN` and resets their password — documented behavior, not a surprise (see `scripts/create-admin.ts`).

## Environment separation

- **Local dev**: `.env`/`.env.local`, `NODE_ENV=development` (implicit via `next dev`). `/ui-preview` always available.
- **Staging/review**: a separate `MONGODB_URI` (different database, never the production one), `UI_PREVIEW_ENABLED=true` if the showroom still needs to be reviewable, its own `SESSION_SECRET`.
- **Production**: its own `MONGODB_URI` and `SESSION_SECRET` (never shared with staging — a shared `SESSION_SECRET` would let a staging-issued cookie authenticate against production), `UI_PREVIEW_ENABLED` unset.

Nothing in the codebase currently distinguishes staging from production beyond environment variables — there's no separate config file per environment, which is intentional (fewer places for drift) but means **environment variables are the entire boundary**. Treat them accordingly.

## Still pending before a real production deploy (OD-012 and friends)

- **Hosting choice** — not made here, this doc is host-agnostic on purpose.
- **Object storage / CDN** for payment screenshots (currently `LocalDiskStorageAdapter`, writes to a local `.local-storage/` folder — **does not work across multiple instances or ephemeral filesystems**, e.g. most serverless platforms. This is the single most important thing to resolve before a real multi-instance or serverless production deploy; a single long-running Node server with a persistent disk works today, a scaled-out or serverless deployment does not until a real adapter replaces it.
- **Email provider** (currently `ConsoleEmailAdapter` — logs, never actually sends).
- **Error tracking provider** (Sentry etc. — `src/app/error.tsx`/`global-error.tsx` exist as the catch boundary, but nothing reports out anywhere yet).
- **Rate limiting at scale** — `src/server/http/rateLimit.ts` is explicitly single-instance in-memory; fine for one Node process, not for a horizontally-scaled deployment (each instance has its own independent bucket, so a distributed attacker-controlled request pattern could exceed the intended limit by a factor of instance count). Swap for a shared store (Redis, etc.) if/when this runs multi-instance.
