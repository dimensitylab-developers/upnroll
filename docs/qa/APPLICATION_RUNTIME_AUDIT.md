# Application Runtime Audit — Up 'n Roll

Date: 2026-11-09  
Branch: `suraj`  
Method: Live `npm run dev` (Next.js 16.1.6 webpack) on `http://localhost:3000` + Cursor browser automation + HTTP probes.  
Classification: **PARTIALLY VERIFIED**

## Startup status

| Check | Result |
|-------|--------|
| Dev server starts | PASS — Ready in ~5–9s |
| Env loaded | PASS — `.env.local` present (`MONGODB_URI`, `SESSION_SECRET`, SMTP_*). No `GOOGLE_CLIENT_*`, no `ADMIN_SEED_*` |
| MongoDB | PASS — pages that query Atlas rendered event/fighter data |
| Module resolution | PASS after fix |
| Initial home compile | FAIL then PASS — see bugs |
| Hydration | Intermittent Next.js issue badge on auth pages during automation fills; clean on fresh register load |
| Secrets in reports | Not printed |

## Critical startup defect (fixed)

Public pages threw compile/runtime 500:

`Route segment config "dynamic" is not compatible with nextConfig.cacheComponents`

**Fix:** removed `export const dynamic = "force-dynamic"` from 9 public pages.  
Commit: `902a3a1`

## Secondary runtime defect (fixed)

`SiteHeader` triggered `next-prerender-current-time` when formatting event dates under `cacheComponents`.

**Fix:** `await connection()` before session/date work.  
Commit: `5d9e3e4`

## Observed performance (dev only)

| Route | Note |
|-------|------|
| First `/` after fix | Compiles successfully |
| `POST /register` | ~10s (includes mail adapter) |
| `POST /verify` → dashboard | ~21s (cold compile of `/fighter/dashboard`) |
| First `/admin` as fighter | Slow compile + layout redirect |

Cold compile times dominate; not treated as production SLA failures.

## External / config blockers

| Item | Status |
|------|--------|
| Google OAuth | `/api/auth/google` → `307` `/login?google=unavailable` |
| Admin account | No seed credentials in env — admin UI/workflows **BLOCKED** |
| Real SMTP | Dev console adapter only |
| WhatsApp | Explicitly mock (dashboard copy confirms) |
