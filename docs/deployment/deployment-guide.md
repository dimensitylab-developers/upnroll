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
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Production server | Required when `NODE_ENV=production` and the process is serving, not during `next build`. Missing any one of them prevents startup. Development uses the console adapter and does not send. SMTP2GO is the preferred provider candidate. Credentials are not in the repo. Delivery has not been verified. |

## Build and run

```bash
npm install
npm run build
npm run start   # serves the production build
```

No custom server. Standard Next.js App Router output. No hosting provider is selected. Do not assume Vercel, AWS, Railway, Render, DigitalOcean, or any other platform. Node 20 or newer is what the SMTP package requires. CI uses Node 22. Whether the chosen host can run that, and with what disk and instance count, is unresolved.

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

## Deployment decision gate

A multi-instance or serverless production deployment must not proceed while private files depend on local disk.

GridFS on the existing Atlas database is the preferred private-file architecture. It is not implemented. An implementation design must be approved first, then the adapter must be built and verified. Public brand assets, gallery images, and the homepage video stay in the Next.js public directory. Existing `.local-storage` files are not migrated automatically. Do not enable a production boot refusal of local disk until that replacement adapter is implemented and configured.

## Still unresolved

No provider is assumed.

- Hosting provider.
- Single-instance versus multi-instance deployment.
- Whether any host has a persistent disk.
- Deployment platform.
- Runtime and resource limits.
- Who is responsible for backups.
- A shared rate-limit store. `backend/http/rateLimit.ts` is in-memory and covers one process only.
- Monitoring provider. Error boundaries exist. Nothing ships errors to an external monitor.
- SMTP2GO credentials, DNS verification, and a real delivery test. The console adapter is development-only. Production does not fall back to it. Delivery has not been verified.
- Occupancy backfill. It has not been run.

This guide does not mark the platform production-ready.
