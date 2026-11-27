# Up 'n Roll — Deployment Guide

| Field | Value |
|-------|-------|
| Prepared by | **Dimensity Labs** |
| Document version | **v1.0.0** |
| Date | **2026-11-27** |
| Git commit | **`4ffb794`** |
| Audience | DevOps, developers, technical owners |

**Status legend**

| Tag | Meaning |
|-----|---------|
| **Verified** | Confirmed from repository files at commit `4ffb794` |
| **Requires confirmation** | Ops / owner must confirm; not fully verifiable from the repo alone |

**Security:** This guide lists variable **names** and purposes only. Never paste real secrets into handover docs or tickets. Transfer credentials via a secure channel separately (see [UpnRoll_Handover_Checklist.md](./UpnRoll_Handover_Checklist.md)).

---

## 1. Prerequisites

| Item | Notes | Status |
|------|-------|--------|
| Node.js **20+** | Documented engines / SMTP notes; CI uses **Node 22** | **Verified** |
| MongoDB (local or Atlas) | URI **must include database name** in the path | **Verified** |
| Git clone of monorepo | Single Next.js project; `backend/` has no separate `package.json` | **Verified** |
| Hosting provider | Vercel config exists in-repo; provider choice is an ops decision | **Requires confirmation** |
| Single- vs multi-instance | Affects `STORAGE_DRIVER` and in-memory rate limits | **Requires confirmation** |
| SMTP provider + DNS | Production fails closed without all five `SMTP_*` vars | **Requires confirmation** |
| Backup owner / retention | Documented mechanism; ownership per OD-011 | **Requires confirmation** |
| Atlas continuous backup | Documented recommendation | **Requires confirmation** |

---

## 2. Local install

### 2.1 Clone and install

**Verified** from root `README.md` and `package.json` scripts:

```bash
git clone <repo-url>
cd upnroll
npm install --prefix frontend
```

Root scripts (`dev`, `build`, `start`, `lint`, `test`, `create-admin`, `seed-demo`, …) **delegate** into `frontend/`. Dependencies used by `backend/` must be installed in `frontend/package.json`.

`predev` / `prebuild` run `node ./scripts/ensure-root-modules.mjs` so root-level `node_modules` resolve for `backend/` imports.

### 2.2 Environment (local)

1. Copy `frontend/.env.example` → `frontend/.env.local`.
2. Set at minimum: `MONGODB_URI`, `SESSION_SECRET` (≥32 characters).
3. Leave SMTP unset for console email logging, or set all five `SMTP_*` to send for real locally.
4. Leave `STORAGE_DRIVER` unset in development (defaults to local disk).

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Bootstrap admin and demo data

```bash
# From repo root
npm run create-admin -- --email you@example.com --password "a-real-password"
# or use ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD from .env.local:
npm run create-admin

npm run seed-demo
```

**Verified:** re-running `create-admin` on an existing email promotes the user to `ADMIN` and resets the password (min length 10). Point scripts only at the intended database — **Requires confirmation** before any production URI.

Production-oriented CLI variants use `frontend/.env.service` via `npm run create-admin:prod` / `seed-event:prod` (**Verified** in `frontend/package.json`).

### 2.4 Run locally

| Command | Effect | Status |
|---------|--------|--------|
| `npm run dev` | `next dev --webpack` → http://localhost:3000 | **Verified** |
| `npm run build` | `next build --webpack` | **Verified** |
| `npm run start` | `next start` (after build) | **Verified** |
| `npm run lint` | ESLint | **Verified** |
| `npm test` | Vitest (`vitest run`) | **Verified** |
| `cd frontend && npx tsc --noEmit` | Typecheck (CI equivalent) | **Verified** |

---

## 3. Environment variables

Authoritative template: `frontend/.env.example`. Boot-critical via Zod (`frontend/src/lib/config.ts`): **`MONGODB_URI`**, **`SESSION_SECRET`**. SMTP and `STORAGE_DRIVER` are asserted at production runtime / use, not in that Zod object.

Staging vs production is **env-vars only** (separate `MONGODB_URI` + `SESSION_SECRET`). **Verified** in deployment docs.

### 3.1 Full env table

| Name | Purpose | Required? | Format / notes | Local | Production | Status |
|------|---------|-----------|----------------|-------|------------|--------|
| `NEXT_PUBLIC_SITE_URL` | Public origin (OG, sitemap, email links) | Strongly recommended | Absolute URL; no trailing slash preferred | `http://localhost:3000` | Canonical HTTPS origin | **Verified** |
| `MONGODB_URI` | Mongo connection | **Always** | Must include DB name in path | `mongodb://127.0.0.1:27017/upnroll` | Atlas URI with named DB | **Verified** |
| `SESSION_SECRET` | HMAC for session / OAuth cookies | **Always** (≥32 chars) | Random hex/string | Generate locally | Host secrets store | **Verified** |
| `ADMIN_SEED_EMAIL` | CLI admin bootstrap only | Optional (CLI) | Email | For seed scripts | Avoid on public runtime env | **Verified** |
| `ADMIN_SEED_PASSWORD` | CLI admin bootstrap only | Optional (CLI) | Password | For seed scripts | Avoid on public runtime env | **Verified** |
| `UI_PREVIEW_ENABLED` | Enable `/ui-preview` outside local | Optional | `"true"` to enable | `false` / unset | Never `true` on real prod | **Verified** |
| `SMTP_HOST` | SMTP server | Required in **prod runtime** | Hostname | Optional (console fallback) | Required | **Verified** |
| `SMTP_PORT` | SMTP port | Required in prod | 1–65535; 465 → TLS | Optional | Required | **Verified** |
| `SMTP_USER` | SMTP auth user | Required in prod | String | Optional | Required | **Verified** |
| `SMTP_PASS` | SMTP auth password | Required in prod | Spaces stripped | Optional | Required | **Verified** |
| `SMTP_FROM` | From address | Required in prod | Email / RFC From | Optional | Required | **Verified** |
| `STORAGE_DRIVER` | Private file adapter | Required in **production** | `gridfs` \| `local` | Unset → local disk | Must set explicitly | **Verified** |
| `GOOGLE_CLIENT_ID` | Google OAuth client | Optional pair | OAuth client id | Optional | Optional | **Verified** |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional pair | Secret | Optional | Optional | **Verified** |
| `CRON_SECRET` | Bearer for outbox cron | Required for cron | Opaque secret | Set if testing cron | Set; match GH secret if used | **Verified** |
| `COUPON_RESERVATION_MINUTES` | Coupon hold duration | Optional (default **15**) | Positive minutes | Default OK | Tune per ops | **Verified** |
| `COUPON_MAX_OPEN_RESERVATIONS` | Max open holds per fighter | Optional (default **3**) | Positive integer | Default OK | Tune | **Verified** |
| `ASSUMED_MATCH_DURATION_MINUTES` | Schedule overlap assumption | Optional (default **10**) | Positive minutes | Default OK | Tune | **Verified** |
| `NODE_ENV` | Runtime mode | Set by host / Next | `development` \| `production` \| `test` | development | production | **Verified** |
| `CI` | Prerender short-circuit | Optional | Truthy in CI | — | Set by CI | **Verified** |
| `NEXT_PHASE` | Build vs serve | Set by Next | Avoids SMTP assert during build | — | Internal | **Verified** |
| `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` | Fallback public URL | Platform-injected | Hostname without scheme | — | Auto on Vercel | **Verified** |

### 3.2 Sanitized env example

Safe to share (empty secrets). Copy to `frontend/.env.local` and fill values privately:

```bash
# Copy to .env.local for local development. Never commit real values.

# Public site origin for SEO (Open Graph, sitemap, canonical).
# Production example: https://upnroll.vercel.app  (later your custom domain)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# MongoDB connection string
# MUST include a database name in the path. A URI with no path opens the driver
# default database named "test" (easy to miss in Atlas/Compass).
MONGODB_URI=mongodb://127.0.0.1:27017/upnroll

# Secret used to sign session cookies (HMAC-SHA256). Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=

# Used only by scripts/create-admin.ts (local CLI bootstrap, never a public endpoint)
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=

# /ui-preview is restricted outside of local dev. Set to "true" only for an
# authorized review/staging deployment — never set in real production.
UI_PREVIEW_ENABLED=false

# SMTP for verification codes and fight notices.
# When all five are set, mail is sent for real (including local `npm run dev`).
# If any are missing in development, codes are printed to the server console instead.
# Required when NODE_ENV=production.
# For Gmail, use an App Password; spaces in the copied password are stripped.
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Private file storage (fighter photos, payment screenshots).
# Development defaults to local disk when unset.
# Production MUST set this or profile photo uploads fail:
#   STORAGE_DRIVER=gridfs   (recommended on Vercel / Atlas)
#   STORAGE_DRIVER=local    (single-server disk only)
STORAGE_DRIVER=

# Google OAuth (optional). Both must be set or /api/auth/google soft-fails to
# the entry page (/login or /register) with ?google=unavailable.
# Redirect URI: {origin}/api/auth/google/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Bearer token for /api/cron/process-outbox (Authorization: Bearer …).
# Vercel Hobby: one daily cron at 00:00 UTC with ?force=1 (stuck-job sweep).
# Fight-day reminders: enable .github/workflows/process-outbox.yml and set
# GitHub secrets:
#   CRON_OUTBOX_URL = https://YOUR_DOMAIN/api/cron/process-outbox
#   CRON_SECRET     = same value as below
CRON_SECRET=

# Coupon holds while a fighter completes registration (minutes)
COUPON_RESERVATION_MINUTES=15

# Max concurrent open coupon reservations per fighter account
COUPON_MAX_OPEN_RESERVATIONS=3

# Assumed match length for schedule overlap checks when only start times exist (minutes)
ASSUMED_MATCH_DURATION_MINUTES=10
```

### 3.3 Production env checklist

1. Set `MONGODB_URI` (named DB) and `SESSION_SECRET` (≥32).  
2. Set all five `SMTP_*`.  
3. Set `STORAGE_DRIVER=gridfs` (typical multi-instance / Vercel) or `local` (single disk host).  
4. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin.  
5. Optionally configure Google OAuth redirect URI and both `GOOGLE_*`.  
6. Set `CRON_SECRET`; wire Vercel cron and/or GitHub Actions.  
7. Leave `UI_PREVIEW_ENABLED` unset/`false`; never commit `.env.local`.  
8. Keep `ADMIN_SEED_*` off production runtime env unless intentionally running seed scripts.

---

## 4. Integrations overview

| Integration | Status in code | Env | Notes |
|-------------|----------------|-----|-------|
| MongoDB | Wired | `MONGODB_URI` | Required at boot |
| Session crypto (HMAC) | Wired | `SESSION_SECRET` | Not a vendor; rotating invalidates all sessions |
| SMTP / Nodemailer | Wired (config-dependent) | `SMTP_*` | Vendor-agnostic; prod requires all five |
| Console email | Dev mock | — | When SMTP incomplete outside prod |
| Google OAuth | Optional | `GOOGLE_*` | Soft-fail if unset |
| Local disk storage | Wired | `STORAGE_DRIVER=local` or unset non-prod | Path: repo `.local-storage/` |
| MongoDB GridFS | Wired | `STORAGE_DRIVER=gridfs` | Bucket `privateFiles`; recommended on Vercel/Atlas |
| Cron outbox worker | Wired | `CRON_SECRET` (+ GH `CRON_OUTBOX_URL`) | Bearer auth |
| WhatsApp Business API | Mock only | — | `console.log`; not delivered |
| FAQ chatbot | Local only | — | Keyword FAQ; **no** LLM vendor |
| Manual payments | Wired | — | UTR + screenshot; no Stripe/Razorpay/PayPal |
| Redis / Sentry / S3 / Docker | Absent | — | In-memory rate limit only; no compose |

**Requires confirmation:** SMTP inbox delivery has not been proven as a standing guarantee in-repo. GridFS adapter exists and is tested; confirm production readiness / key persistence before go-live (older deployment text saying “GridFS is not implemented” is **stale**).

---

## 5. Storage driver

**Verified** `backend/storage/factory.ts`:

| `NODE_ENV` | Unset driver | `gridfs` | `local` |
|------------|--------------|----------|---------|
| non-production | Local disk | GridFS | Local disk |
| production | **Throws** | GridFS | Local disk |

Private files include fighter photos and payment screenshots. Multi-instance or ephemeral filesystem → prefer **`gridfs`**. Flipping drivers without migrating keys/files can break photo/screenshot GETs — **Requires confirmation** before changing in production.

---

## 6. SMTP behaviour

| Condition | Behaviour | Status |
|-----------|-----------|--------|
| All five `SMTP_*` set | Real send (including local `npm run dev`) | **Verified** |
| Incomplete SMTP, non-production | Console adapter logs `[dev email not sent]` | **Verified** |
| Production serve without SMTP | Startup assertion fails (`instrumentation.ts`) | **Verified** |
| `next build` | Does **not** require SMTP (`NEXT_PHASE=phase-production-build`) | **Verified** |
| Inbox delivery proven end-to-end | — | **Requires confirmation** |

---

## 7. Production / Vercel notes

### 7.1 `vercel.json` (**Verified**)

| Key | Value |
|-----|--------|
| `installCommand` | `npm ci --prefix frontend && node frontend/scripts/ensure-root-modules.mjs` |
| `buildCommand` | `npm run build --prefix frontend` |
| `outputDirectory` | `frontend/.next` |
| `crons` | `/api/cron/process-outbox` at `0 0 * * *` (daily 00:00 UTC) |

Hosting on Vercel is **configured in-repo**. Whether Vercel is the chosen production host remains **Requires confirmation**.

### 7.2 CI (**Verified**)

`.github/workflows/ci.yml` on push/PR (Node 22): `npm ci`, ensure-root-modules, `tsc --noEmit`, `npm test`, `npm run build` under `frontend/`, with dummy `MONGODB_URI` + `SESSION_SECRET` for build. Cached public reads short-circuit when `CI=true`.

### 7.3 Open before calling production “ready”

Mark **Requires confirmation**:

- Hosting sign-off and instance topology  
- Shared rate-limit store (in-memory only today)  
- External monitoring  
- SMTP delivery proof  
- Occupancy backfill if any division lacks `filledCount`  
- Backup ownership + retention (OD-011)  
- GridFS production path if not a single-disk host  

---

## 8. Cron / outbox

**Endpoint:** `POST /api/cron/process-outbox`  
**Auth:** `Authorization: Bearer ${CRON_SECRET}`

| Condition | Result | Status |
|-----------|--------|--------|
| Missing `CRON_SECRET` | 503 | **Verified** |
| Bad auth | 401 | **Verified** |
| Success path | Recovers stale jobs; processes up to 25 due outbox jobs | **Verified** |
| Non-forced callers | Skip when not event day (`getOutboxRunGate`) | **Verified** |
| Force | `?force=1` **or** Vercel cron UA / `x-vercel-cron-schedule` | **Verified** |

**Vercel:** daily cron (Hobby-friendly) — stuck-job sweep with force semantics. **Verified**.

**GitHub Actions:** `.github/workflows/process-outbox.yml`  
- Schedule `*/5 * * * *` + `workflow_dispatch`  
- Secrets: `CRON_OUTBOX_URL`, `CRON_SECRET`  
- Disable between tournaments to save Actions minutes — **Verified** (workflow comments)

---

## 9. Backups and restore

Source of procedure: `docs/deployment/backup-restore.md`.

**Backup**

```bash
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d-%H%M%S)
```

**Restore**

```bash
mongorestore --uri="$MONGODB_URI" ./backups/<timestamp>
```

| Item | Status |
|------|--------|
| Mechanism documented | **Verified** (docs in repo) |
| Who owns backups / retention window | **Requires confirmation** (OD-011) |
| Private files on **local disk** are **not** in `mongodump` | **Verified** |
| GridFS private files **are** in the Mongo dump | **Verified** (design) |
| Never restore into prod without confirming target URI | **Requires confirmation** |
| Treat backups as sensitive (hashes, PII-adjacent keys) | **Requires confirmation** |
| Atlas continuous backup enabled | **Requires confirmation** |

---

## 10. Rollback notes

| Approach | Notes | Status |
|----------|-------|--------|
| Redeploy previous git SHA / Vercel deployment | Standard immutable deploy rollback | **Requires confirmation** (platform procedure) |
| DB schema / data | No formal migration runner; model changes are app-coupled | **Requires confirmation** |
| `SESSION_SECRET` rotation | Invalidates all sessions (expected) | **Verified** |
| Storage driver flip | Can break media GETs without file/key migration | **Requires confirmation** |
| Outbox cron | Disable GH workflow / cron; inspect `OutboxJob` | **Verified** |
| Feature gates | Env only (`UI_PREVIEW_ENABLED`, SMTP presence, `STORAGE_DRIVER`) | **Verified** |

---

## 11. Related documents

- [UpnRoll_Handover_Checklist.md](./UpnRoll_Handover_Checklist.md)  
- [UpnRoll_Testing_Report.md](./UpnRoll_Testing_Report.md)  
- Repo: `docs/deployment/deployment-guide.md`, `docs/deployment/backup-restore.md`, `frontend/.env.example`

---

*End of Deployment Guide — Dimensity Labs · v1.0.0 · 2026-11-27 · `4ffb794`*
