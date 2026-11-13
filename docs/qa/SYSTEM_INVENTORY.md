# System Inventory — Up 'n Roll (manual QA pass)

**Date:** 2026-11-12  
**Branch:** `qa/client-demo-readiness-2026-11-12` @ `eb3c5ed`  
**Environment:** local `npm run dev` (Next.js 16.4.5), MongoDB Atlas via `frontend/.env.local` (driver DB path resolves to `test`), GridFS storage, SMTP configured, Google OAuth configured  
**Rule for this pass:** inspection + runtime exercise only; **no application code changes**.

## Stack

| Layer | Implementation |
| --- | --- |
| App | Next.js 16 App Router + React 19 + TypeScript |
| Business logic | `backend/services/*` via `@/server/*` |
| DB | MongoDB / Mongoose |
| Auth (users) | Custom session cookie + hashed tokens; roles `FIGHTER`, `ADMIN` |
| Auth (judges) | Separate judge session cookie; per-match credentials |
| Files | `STORAGE_DRIVER=gridfs` in this env |
| Email | SMTP env present; unpaid/dev paths may still log |
| Tests | Vitest (no Playwright in repo) |

## Route groups observed

| Group | Examples | Guard |
| --- | --- | --- |
| Public | `/`, `/events`, `/events/[slug]`, brackets/schedule/results, `/rankings`, `/fighters`, FAQ/about/policies/announcements, `/store`, `/seminars` | Open |
| Auth | `/login`, `/register`, `/verify` | Open |
| Fighter | `/fighter/dashboard`, registrations, payment, matches, profile, requests, notifications | Session + FIGHTER |
| Admin | `/admin`, events, payments, brackets, matches, coupons/fees UI, content, media, rankings, audit, outbox | Session + ADMIN |
| Judge | `/judge/login`, `/judge` | Judge cookie |
| Preview | `/ui-preview` | Dev / `UI_PREVIEW_ENABLED` |
| API | `/api/health`, Google OAuth, cron outbox, private photo/QR/screenshot routes | Mixed |

## Roles

- **Visitor** — public pages, chatbot FAQ widget  
- **Fighter** — registration, payment evidence, dashboard, requests  
- **Admin** — tournament ops, payment verify, brackets, judge credentials, CMS  
- **Judge** — ephemeral match credentials (not a `User.role`)

## Features confirmed present in code + runtime surface

- Manual QR payment + admin verify/reject (no gateway)  
- Payment options / dual fee+QR model + coupon toggle (“Do you have a coupon code?”)  
- Single-use coupons with reservation window  
- Single-elimination brackets + byes  
- Judge 10-char username/password generation (`crypto.randomBytes`)  
- Live scoring + score events + finalize  
- Rankings with placeholder 3 pts/win (OD-004)  
- FAQ chatbot (keyword, no LLM)  
- Cancel/transfer request workflow (policy still open OD-007/008)

## Explicit gaps / non-features

| Item | Status |
| --- | --- |
| Password reset / forgot password | NOT IMPLEMENTED |
| Store / Seminars commerce | Coming-soon stubs only |
| Payment gateway | Excluded by design |
| Multi-judge score aggregation | NOT IMPLEMENTED (shared scoreboard) |
| Extra bracket formats beyond single-elim | NOT IMPLEMENTED (OD-003) |
| Approved ranking formula | Placeholder only (OD-004) |

## External dependencies (this env)

- Atlas MongoDB (shared `test` DB name — ops risk)  
- SMTP + Google OAuth credentials present (treat as staging/shared; do not assume production isolation)  
- Vercel cron / GitHub Actions outbox tooling documented in `.env.example`
