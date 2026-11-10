# System Integration Audit — Up 'n Roll

Audit date: **2026-11-09**  
Method: Full-repo route/action/service/model/import verification (not filename-only).  
Central map: [SYSTEM_ARCHITECTURE_MAP.md](./SYSTEM_ARCHITECTURE_MAP.md)

## Verdict

The product core (auth → registration → UTR payment review → brackets/matches → rankings → content) is **wired end-to-end inside one Next.js process**. Gaps are concentrated in: env-gated Google OAuth, mocked WhatsApp, placeholder public pages, aspirational REST docs, and missing hosting/Docker assets — not in orphaned Mongoose models.

---

## Legend

| Marker | Meaning |
|--------|---------|
| 🟢 | Fully connected and verified |
| 🟡 | Partially connected / env-gated / incomplete workflow |
| 🔴 | Broken or falsely documented as working |
| ⚪ | Unused / unreferenced / placeholder |
| 🔵 | External dependency |
| 🟣 | Mocked / console stand-in |

---

## Disconnected / incomplete / mocked / unused inventory

### 🔴 Broken or misleading (docs vs code)

| Item | Finding |
|------|---------|
| Full REST `/api/v1` product API | Documented in `docs/api/api-contract.md` as proposal; **zero** matching CRUD route handlers in code. Do not treat as live API. |
| Older claim “GridFS not implemented” | **False vs current code** — `backend/storage/gridfs.ts` + factory + tests exist. |
| Older claim “no `backend/` directory / logic in `src/server`” | **Stale** — logic lives in repo-root `backend/` aliased `@/server/*`. |
| `docs/architecture/data-model.md` collection names | Snake_case names do not match Mongoose defaults (`fighterprofiles`, etc.). |

### 🟡 Partially connected

| Item | Evidence | Impact |
|------|----------|--------|
| Google OAuth | Routes + login link exist; missing `GOOGLE_CLIENT_*` → soft fail `google=unavailable`; env keys absent from `.env.example` | Login path optional / often unavailable |
| SMTP in non-prod | Console adapter logs only until production SMTP env set | Emails not delivered in local/dev |
| `STORAGE_DRIVER` in production | Must be explicit `gridfs` or `local` | Misconfig fails boot |
| `/events/held/[slug]` | Static archive; only `no-gi-12-july-2026` verified | Other held slugs 404 |
| `/ui-preview` | 404 in production unless `UI_PREVIEW_ENABLED=true` | Review-only |
| `Event.paymentInstructions.qrImageKey` | Field exists; create path always sets `""`; no upload UI/API | QR image storage unused |
| In-memory rate limit | `backend/http/rateLimit.ts` — not Redis | Multi-instance rate limits not shared |
| Sitemap lists `/fighters` | Page only redirects to `/rankings` | Harmless but odd SEO node |

### 🟣 Mocked / placeholder integrations

| Item | Module | Behavior |
|------|--------|----------|
| WhatsApp | `backend/notifications/whatsapp.ts` | Called from `matchService`; console log only — **not sent** |
| Console email | `backend/email/console.ts` | Dev/test stand-in for SMTP |
| FAQ chatbot “AI” | `chatbotEngine.ts` | Local keyword matcher — **no LLM provider** |

### ⚪ Unused / unreferenced / placeholder product surfaces

| Item | Notes |
|------|-------|
| `/store` | `ComingSoon` — no commerce backend |
| `/seminars` | `ComingSoon` — no seminar domain |
| `/fighters` page | Redirect-only; not a directory |
| `/rankings/demo` | Fixture UI, noindex |
| `components/home/home-live.tsx` | Not imported by current home |
| `components/home/home-glimpse.tsx` | Not imported by current home |
| `setDivisionCapacity` | Service helper without Server Action / page |
| Background job runners | No cron/queue workers in repo |
| Docker / Vercel / Fly configs | Absent |
| Stripe / Razorpay / Redis / Sentry / S3 SDK / Resend | Absent from deps and call sites |

### 🟢 Fully connected core (smoke checklist)

| Flow | Trace |
|------|-------|
| Email/password auth | Login/Register/Verify actions → User/Session/EmailVerification |
| Fighter registration | New registration page → `createRegistrationAction` → occupancy + Registration + PaymentSubmission stub |
| Payment review | Payment page → `submitPayment` → storage → admin approve/reject → registration status + email |
| Brackets/matches | Admin generate/publish/result actions → Bracket/Match → public bracket/schedule/results |
| Rankings | Admin recalculate → RankingRecord → `/rankings` |
| Content CMS | Admin content/media → public FAQ/announcements/policies + chatbot FAQ source |
| Binary private files | Photo + screenshot route handlers → storage adapter |
| Health | `GET /api/health` → Mongo ping |
| CI | `.github/workflows/ci.yml` builds with dummy secrets |

---

## Orphan analysis

| Category | Result |
|----------|--------|
| Mongoose models | **0 orphans** — all 16 used |
| HTTP route handlers | All 7 have call sites or operational purpose |
| Server Action modules | All 13 wired to forms/pages |
| External SDKs claimed but missing | REST contract & some deploy wording — treat as documentation debt |

---

## Incomplete workflows (product)

1. **Store / Seminars** — nav exists; no domain modules.
2. **WhatsApp fight notices** — call site exists; delivery stubbed.
3. **Google social login** — implementation present; ops config incomplete.
4. **Event QR image** — schema field without write path.
5. **Proposed REST API** — not started in App Router handlers.
6. **Hosting packaging** — no container/IaC in repo; deploy guide partially stale.

---

## Recommended reading order for engineers

1. This audit (gaps)
2. [SYSTEM_ARCHITECTURE_MAP.md](./SYSTEM_ARCHITECTURE_MAP.md) diagrams A–J
3. [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) for page → action traces
4. [API_ARCHITECTURE.md](./API_ARCHITECTURE.md) to avoid REST confusion
5. [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) + [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md)
6. [EXTERNAL_INTEGRATIONS.md](./EXTERNAL_INTEGRATIONS.md) for env/provider status

---

## Validation notes

- Page list matched `frontend/src/app/**/page.tsx` on disk (42 pages).
- Route handlers matched `**/route.ts` under `frontend/src/app`.
- Models matched `backend/models/*.ts` (16).
- WhatsApp mock, storage factory, and Google soft-fail verified by source read.
- Mermaid diagrams use `flowchart` / `erDiagram` / `sequenceDiagram` only; split across docs to stay renderable on GitHub.
