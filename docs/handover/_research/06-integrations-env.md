# 06 — Integrations & environment

Research for Up 'n Roll handover. Sources: `frontend/.env.example`, `frontend/src/lib/config.ts`, `frontend/next.config.ts`, `backend/**` call sites, and `docs/architecture/EXTERNAL_INTEGRATIONS.md` (**verified vs code** — discrepancies called out below).

**Security:** This document lists **variable names and purposes only**. Never paste real secrets into handover docs.

---

## 1. Third-party / external integrations

| Integration | Status | Module(s) | Env | Notes |
|-------------|--------|-----------|-----|-------|
| MongoDB | Wired | `backend/db/connect.ts`; all models | `MONGODB_URI` | Required at boot via `getConfig()` |
| Session crypto (HMAC) | Wired | `backend/auth/cookies.ts`, `oauth-state.ts`, sessions | `SESSION_SECRET` (≥32 chars) | Not a vendor; crypto secret |
| SMTP / Nodemailer | Wired (config-dependent) | `backend/email/smtp.ts`, `console.ts`, `smtp-config.ts`; `instrumentation.ts` | `SMTP_*` | Vendor-agnostic; prod requires all five |
| Console email | Dev mock | `backend/email/console.ts` | — | Used when SMTP incomplete outside prod |
| Google OAuth | Wired (optional) | `frontend/src/app/api/auth/google/**` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Soft-fail if unset |
| Local disk storage | Wired | `backend/storage/local-disk.ts` | `STORAGE_DRIVER=local` or unset in non-prod | Path: repo `.local-storage/` |
| MongoDB GridFS | Wired | `backend/storage/gridfs.ts` bucket `privateFiles` | `STORAGE_DRIVER=gridfs` | Recommended on Vercel/Atlas |
| WhatsApp Business API | Mock only | `backend/notifications/whatsapp.ts` | — | `console.log`; not delivered |
| FAQ chatbot | Local only | `backend/services/chatbotEngine.ts` | — | Keyword FAQ; **no** OpenAI/Anthropic |
| Manual payments (UTR + screenshot) | Wired | `paymentService` | — | No Stripe/Razorpay/PayPal |
| Cron outbox worker | Wired | `/api/cron/process-outbox`; `.github/workflows/process-outbox.yml` | `CRON_SECRET` (+ GitHub `CRON_OUTBOX_URL`) | Bearer auth |
| Vercel platform URLs | Optional fallback | `backend/email/templates/site.ts`, `frontend/src/lib/site-url.ts` | `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL` | Platform-injected; not in `.env.example` |
| Stripe / Razorpay / PayPal | Absent | — | — | Out of scope |
| Resend / SendGrid SDKs | Absent | — | — | SMTP used instead |
| AWS S3 / Cloudinary | Absent | — | — | GridFS / local disk |
| Redis / Upstash | Absent | — | — | In-memory rate limit only |
| Sentry / OTel / PostHog | Absent | — | — | — |
| Docker / compose | Absent | — | — | — |

### Verification vs `EXTERNAL_INTEGRATIONS.md`

| Claim in EXTERNAL_INTEGRATIONS.md | Code / `.env.example` today |
|-----------------------------------|-------------------------------|
| `.env.example` **omits** `GOOGLE_*` | **Stale** — `.env.example` now documents `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |
| “No `NEXT_PUBLIC_*` variables found” | **Stale** — `NEXT_PUBLIC_SITE_URL` is present and used for SEO/mail absolute URLs |
| Env matrix omits `CRON_SECRET`, coupon/match duration knobs | **Incomplete** — see full table §2 |
| GridFS “fully wired” | **Accurate** |
| WhatsApp mocked | **Accurate** |
| Chatbot not external AI | **Accurate** |

---

## 2. Complete env var table (from `.env.example` + related code)

| Name | Purpose | Required? | Module / consumers | Format / notes | Local | Prod |
|------|---------|-----------|--------------------|----------------|-------|------|
| `NEXT_PUBLIC_SITE_URL` | Public origin for OG, sitemap, canonical, email CTA links | Strongly recommended (SEO/mail) | `frontend/src/lib/site-url.ts`, `backend/email/templates/site.ts` | Absolute URL, no trailing slash preferred | `http://localhost:3000` | e.g. `https://upnroll.vercel.app` or custom domain |
| `MONGODB_URI` | Mongo connection | **Required** | `getConfig()`, `connectDB` | Must include DB name in path; bare URI historically maps to `test` | `mongodb://127.0.0.1:27017/upnroll` | Atlas URI with named DB |
| `SESSION_SECRET` | HMAC for session/OAuth cookies | **Required** (≥32 chars) | `cookies.ts`, `oauth-state.ts` | Hex/random string ≥32 | Generate locally | Generate & store in host secrets |
| `ADMIN_SEED_EMAIL` | CLI admin bootstrap only | Optional (CLI) | `scripts/create-admin.ts` | Email | Set for seed | Avoid on public hosts; CLI-only |
| `ADMIN_SEED_PASSWORD` | CLI admin bootstrap only | Optional (CLI) | same | Password | Set for seed | same |
| `UI_PREVIEW_ENABLED` | Allow `/ui-preview` outside local | Optional | `(preview)/ui-preview/page.tsx` | `"true"` to enable | `false` / unset | Never `true` on real prod |
| `SMTP_HOST` | SMTP server host | Required in **production runtime** | `smtp-config.ts` | Hostname | Optional (console fallback) | Required |
| `SMTP_PORT` | SMTP port | Required in prod | same | Integer 1–65535; 465 → TLS | Optional | Required |
| `SMTP_USER` | SMTP auth user | Required in prod | same | String | Optional | Required |
| `SMTP_PASS` | SMTP auth password | Required in prod | same | Spaces stripped | Optional | Required (e.g. Gmail app password) |
| `SMTP_FROM` | From address | Required in prod | same | Email / RFC From | Optional | Required |
| `STORAGE_DRIVER` | Private file adapter | Required in **production** | `storage/factory.ts` | `gridfs` \| `local` | Unset → local disk | Must set explicitly |
| `GOOGLE_CLIENT_ID` | Google OAuth client | Optional pair | `/api/auth/google` | OAuth client id | Optional | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional pair | same | Secret | Optional | Optional |
| `CRON_SECRET` | Bearer for outbox cron | Required for cron to run | `/api/cron/process-outbox` | Opaque secret; Authorization Bearer | Set if testing cron | Set; match GitHub secret if using Actions |
| `COUPON_RESERVATION_MINUTES` | Coupon hold while registering | Optional (default 15) | `tournamentRules.ts` | Positive number (minutes) | Default OK | Tune per ops |
| `COUPON_MAX_OPEN_RESERVATIONS` | Max open coupon holds per fighter | Optional (default 3) | same | Positive integer | Default OK | Tune |
| `ASSUMED_MATCH_DURATION_MINUTES` | Schedule overlap assumption | Optional (default 10) | same | Positive number (minutes) | Default OK | Tune |
| `NODE_ENV` | Runtime mode | Set by Next/host | Many | `development` \| `production` \| `test` | development | production |
| `CI` | Prerender short-circuit (CI builds) | Optional | build/CI | truthy in CI | — | Set by CI |
| `NEXT_PHASE` | Distinguishes build vs serve | Set by Next | `isProductionRuntime` | Avoids SMTP assert during `phase-production-build` | — | Internal |
| `VERCEL_URL` / `VERCEL_PROJECT_PRODUCTION_URL` | Fallback public URL | Platform | site URL helpers | Hostname without scheme | — | Auto on Vercel |

Boot-critical via Zod (`frontend/src/lib/config.ts`): **`MONGODB_URI`**, **`SESSION_SECRET`**. SMTP and `STORAGE_DRIVER` are asserted at runtime/use in production, not in that Zod object.

---

## 3. Sanitized `.env.example` content (handover)

Copy of `frontend/.env.example` with **empty values only** (names + comments). Safe to share:

```bash
# Copy to .env.local for local development. Never commit real values.

# Public site origin for SEO (Open Graph, sitemap, canonical).
# Production example: https://upnroll.vercel.app  (later your custom domain)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# MongoDB connection string (Phase 2 foundation  see docs/architecture/data-model.md)
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
# authorized review/staging deployment  never set in real production.
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
# That workflow polls every 5 minutes but the API skips when it is not event day
# (no matches scheduled in the same-day window and no due jobs). Disable the
# workflow between tournaments to save Actions minutes.
CRON_SECRET=

# Coupon holds while a fighter completes registration (minutes)
COUPON_RESERVATION_MINUTES=15

# Max concurrent open coupon reservations per fighter account
COUPON_MAX_OPEN_RESERVATIONS=3

# Assumed match length for schedule overlap checks when only start times exist (minutes)
ASSUMED_MATCH_DURATION_MINUTES=10
```

---

## 4. Ops checklist (prod)

1. Set `MONGODB_URI` (named DB), `SESSION_SECRET` (≥32).  
2. Set all five `SMTP_*`.  
3. Set `STORAGE_DRIVER=gridfs` (typical) or `local`.  
4. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin.  
5. Optionally configure Google OAuth redirect URI and both `GOOGLE_*`.  
6. Set `CRON_SECRET`; wire Vercel cron and/or GitHub Actions.  
7. Leave `UI_PREVIEW_ENABLED` unset/`false`; never commit `.env.local`.  
8. Keep `ADMIN_SEED_*` off production runtime env if not running seed scripts.  
