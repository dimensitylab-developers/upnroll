# 07 — Deployment research

Agent 7 research notes for handover. **No packages installed; no app code changed.**  
Legend: **[Verified]** = confirmed in repo files this pass · **[Owner-confirm]** = ops/owner must confirm · **[Docs-historical]** = claimed in docs; re-verify before production.

---

## 1. Prerequisites

| Item | Status | Citation |
|------|--------|----------|
| Node.js **20+** (SMTP/nodemailer engines) | **[Verified]** docs + package notes | `README.md`, `docs/deployment/deployment-guide.md`, `docs/PHASE_6_COMPLETION_REPORT.md` |
| CI uses **Node 22** | **[Verified]** | `.github/workflows/ci.yml` (`node-version: 22`) |
| MongoDB (local or Atlas) with **database name in URI path** | **[Verified]** | `frontend/.env.example` (`MONGODB_URI` comments) |
| Git clone of monorepo | **[Verified]** pattern | `README.md` |
| Hosting provider choice | **[Owner-confirm]** | `docs/deployment/deployment-guide.md` (“No provider is assumed”) |
| Single- vs multi-instance | **[Owner-confirm]** | same; local disk vs GridFS implications |
| Backup owner / schedule | **[Owner-confirm]** | `docs/deployment/backup-restore.md`, OD-011 |
| SMTP provider + DNS + delivery test | **[Owner-confirm]** | deployment-guide, `.env.example` |
| Atlas continuous backup enabled | **[Owner-confirm]** | backup-restore.md |

---

## 2. Clone and install

**[Verified]** from `README.md` + root/`frontend` `package.json`:

```bash
git clone <repo-url>
cd upnroll
npm install --prefix frontend
```

Root `package.json` scripts **delegate** into `frontend/` (`dev`, `build`, `start`, `lint`, `test`, `create-admin`, `seed-demo`, etc.). Dependencies for `backend/` must live in `frontend/package.json` (no separate backend install) — `CLAUDE.md`, `frontend/next.config.ts` webpack aliases.

`frontend` scripts `predev` / `prebuild` run `node ./scripts/ensure-root-modules.mjs` so root-level `node_modules` links resolve packages for `backend/` imports.

**Vercel install (when using Vercel):** **[Verified]** `vercel.json`:

```json
"installCommand": "npm ci --prefix frontend && node frontend/scripts/ensure-root-modules.mjs"
```

---

## 3. Environment setup

Authoritative list: **`frontend/.env.example`**. Copy to `frontend/.env.local` for local CLI/dev.

| Variable | Required when | Notes | Status |
|----------|---------------|-------|--------|
| `MONGODB_URI` | Always (runtime) | Must include DB name; CI build uses dummy URI | **[Verified]** |
| `SESSION_SECRET` | Always | ≥32 chars HMAC; rotating invalidates all sessions | **[Verified]** deployment-guide |
| `NEXT_PUBLIC_SITE_URL` | SEO / OG | Example localhost / later domain | **[Verified]** `.env.example` |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | `create-admin` only | Not read by running app | **[Verified]** |
| `UI_PREVIEW_ENABLED` | Staging showroom | Production leave unset/`false`; `"true"` enables `/ui-preview` in built deploys | **[Verified]** |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Production server; optional local | Production fails closed without them (`instrumentation.ts` → `assertProductionEmailConfig`) | **[Verified]** code + Phase 6 report |
| `STORAGE_DRIVER` | **Production required** | `gridfs` or `local`; unset in prod throws | **[Verified]** `backend/storage/factory.ts` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional OAuth | Soft-fail to login/register if missing | **[Verified]** `.env.example` |
| `CRON_SECRET` | Cron endpoint | Bearer for `/api/cron/process-outbox` | **[Verified]** route + `.env.example` |
| `COUPON_RESERVATION_MINUTES` | Optional | Default 15 | **[Verified]** |
| `COUPON_MAX_OPEN_RESERVATIONS` | Optional | Default 3 | **[Verified]** |
| `ASSUMED_MATCH_DURATION_MINUTES` | Optional | Default 10 | **[Verified]** |

Prod create-admin uses `frontend/.env.service` via `npm run create-admin:prod` — **[Verified]** `frontend/package.json`.

**Environment boundary:** staging vs production is env-vars only (separate `MONGODB_URI` + `SESSION_SECRET`). **[Verified]** `docs/deployment/deployment-guide.md`.

---

## 4. MongoDB

- Connect via `MONGODB_URI`; app validates / fails fast (deployment-guide cites config validation).
- Atlas is documented system of record for backups — **[Docs-historical]** / **[Owner-confirm]** whether Atlas continuous backup is on.
- Transaction integration tests use an isolated DB name pattern (e.g. `upnrol_txn_test`) — see `backend/db/transactions.integration.test.ts` / Phase reports; do not point those at production.

---

## 5. SMTP

- Adapter: `backend/email/smtp.ts`; selection `backend/email/console.ts` `getEmailAdapter()`.
- If all five `SMTP_*` set → real send (including local `npm run dev`).
- Else in non-production → console adapter logs `[dev email  not sent]`.
- Production serving runtime without SMTP → startup assertion fails (`frontend/src/instrumentation.ts`).
- `next build` sets `NEXT_PHASE=phase-production-build` so build does not require SMTP — **[Verified]** Phase 6 completion report.
- **Delivery not proven in-repo as a standing guarantee** — **[Owner-confirm]** / **[Docs-historical]** “Delivery has not been verified.”

---

## 6. `STORAGE_DRIVER`

**[Verified]** `backend/storage/factory.ts`:

| `NODE_ENV` | Unset driver | `gridfs` | `local` |
|------------|--------------|----------|---------|
| non-production | Local disk | GridFS | Local disk |
| production | **Throws** | GridFS | Local disk |

Private files: fighter photos, payment screenshots, etc.  
**[Owner-confirm]** production choice. Multi-instance / ephemeral FS → prefer `gridfs` (`.env.example` recommends for Vercel/Atlas).  
GridFS adapter exists in code (`backend/storage/gridfs.ts` + tests); older deployment-guide text saying “GridFS is not implemented” is **stale relative to current tree** — treat guide as partially outdated; confirm adapter readiness with owners before go-live (**[Owner-confirm]** E2E report also flags GridFS key persistence concerns).

---

## 7. Bootstrap admin and demo data

```bash
# From repo root (delegates to frontend tsx + .env.local)
npm run create-admin -- --email you@example.com --password "a-real-password"
# or
npm run create-admin   # uses ADMIN_SEED_* from .env.local

npm run seed-demo
npm run seed-event      # also seed-event:prod with .env.service
```

**[Verified]** `scripts/create-admin.ts`: re-run on existing email promotes to `ADMIN` and resets password. Password min length 10.  
Same `MONGODB_URI` as the target app — **[Owner-confirm]** before pointing at production.

Optional ops scripts (frontend package): `backfill-occupancy`, `backfill-gridfs-keys` — **[Docs-historical]** occupancy backfill “has not been run” (STATUS_UPDATE / Phase 6).

---

## 8. Run commands (root)

| Command | Effect | Status |
|---------|--------|--------|
| `npm run dev` | `next dev --webpack` via frontend | **[Verified]** |
| `npm run build` | `next build --webpack` | **[Verified]** |
| `npm run start` | `next start` (production build) | **[Verified]** |
| `npm run lint` | eslint | **[Verified]** |
| `npm test` | `vitest run` | **[Verified]** |
| `cd frontend && npx tsc --noEmit` | CI typecheck | **[Verified]** `.github/workflows/ci.yml` |

App URL local: `http://localhost:3000`.

CI also sets dummy `MONGODB_URI` + `SESSION_SECRET` for build; cached public reads short-circuit when `CI=true` (`frontend/src/lib/public-reads.ts`).

---

## 9. `vercel.json` facts

**[Verified]** file at repo root `vercel.json`:

| Key | Value |
|-----|--------|
| `installCommand` | `npm ci --prefix frontend && node frontend/scripts/ensure-root-modules.mjs` |
| `buildCommand` | `npm run build --prefix frontend` |
| `outputDirectory` | `frontend/.next` |
| `crons` | One cron: path `/api/cron/process-outbox`, schedule `0 0 * * *` (daily 00:00 UTC) |

Hosting on Vercel is **configured in-repo** but provider selection remains an **[Owner-confirm]** product/ops decision (deployment-guide still says “do not assume Vercel” as a business default).

---

## 10. Cron / outbox

**Endpoint:** `frontend/src/app/api/cron/process-outbox/route.ts`  
- Requires `Authorization: Bearer ${CRON_SECRET}`.
- Missing secret → 503; bad auth → 401.
- Recovers stale processing jobs + processes up to 25 due outbox jobs.
- Skip gate: non-forced callers skip when not event day (`getOutboxRunGate`).
- Force when `?force=1` **or** Vercel cron UA / `x-vercel-cron-schedule` header.

**Vercel:** daily cron (Hobby-friendly) — stuck-job sweep with force semantics — **[Verified]** `.env.example` comments + route.

**GitHub Actions:** `.github/workflows/process-outbox.yml`  
- Schedule `*/5 * * * *` + `workflow_dispatch`.
- Secrets: `CRON_OUTBOX_URL`, `CRON_SECRET`.
- POSTs with Bearer; disable between tournaments to save minutes — **[Verified]** workflow comments.

---

## 11. Backup / restore (from docs)

Source: `docs/deployment/backup-restore.md`.

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
| Mechanism documented | **[Docs-historical]** |
| Who owns backups / retention window | **[Owner-confirm]** OD-011 |
| Private files on local disk **not** in mongodump | **[Verified]** doc + storage design |
| Never restore into prod without confirming target | **[Owner-confirm]** operational rule |
| Treat backups as sensitive (hashes, PII-adjacent keys) | **[Owner-confirm]** |

---

## 12. Rollback notes

| Approach | Notes | Status |
|----------|-------|--------|
| Redeploy previous git SHA / Vercel deployment | Standard Next.js immutable deploy rollback | **[Owner-confirm]** platform procedure |
| DB schema / data | No formal migration runner documented; model changes are app-coupled — rollback may need data care | **[Owner-confirm]** |
| `SESSION_SECRET` rotation | Invalidates all sessions (expected) | **[Verified]** deployment-guide |
| Storage driver flip | Local ↔ GridFS without migrating keys/files can break photo/screenshot GETs | **[Owner-confirm]** |
| Outbox cron | Disable GH workflow / cron if bad jobs; inspect `OutboxJob` collection | **[Verified]** models/services exist |
| Feature flags | Essentially env vars only (`UI_PREVIEW_ENABLED`, SMTP presence, `STORAGE_DRIVER`) | **[Verified]** |

---

## 13. Related CI

`.github/workflows/ci.yml` — on push/PR: `npm ci`, ensure-root-modules, `tsc --noEmit`, `npm test`, `npm run build` under `frontend/` with Node 22. **[Verified]**

---

## 14. Still open before calling production “ready”

Summarized from deployment-guide + STATUS/Phase docs (mark **[Owner-confirm]**):

- Hosting sign-off and instance topology  
- Shared rate-limit store (in-memory only today — `backend/http/rateLimit.ts`)  
- External monitoring  
- SMTP delivery proof  
- Occupancy backfill if any division lacks `filledCount`  
- Backup ownership + OD-011 retention  
- Confirm GridFS production path if not single-disk host  
