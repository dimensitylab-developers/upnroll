# Directory tree (source-verified)

| Field | Value |
|-------|--------|
| Repo | `d:\upnrol` |
| Git | `main` @ `4ffb794` |
| Date | 2026-11-27 |
| Scope | Top 3 levels from repo root; plus focused trees for `frontend/src` and `backend/` |
| Excluded | `node_modules/`, `.next/`, `.git/` |
| Also omitted from root tree | `.local-qa/`, `.local-storage/` (local runtime artefacts; present on disk) |

---

## Repo root (depth ≤ 3)

```
upnrol/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── process-outbox.yml
├── backend/
│   ├── audit/
│   ├── auth/
│   ├── content/
│   ├── db/
│   ├── email/
│   ├── http/
│   ├── models/
│   ├── notifications/
│   ├── observability/
│   ├── services/
│   ├── storage/
│   ├── validation/
│   └── README.md
├── backups/
│   └── 2026-11-15T19-10-59-683Z/
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── decisions/
│   ├── deployment/
│   ├── engineering/
│   ├── handover/
│   │   ├── _research/
│   │   ├── diagrams/
│   │   ├── exports/
│   │   ├── screenshots/
│   │   └── README.md
│   ├── legal/
│   ├── Meeting/
│   ├── phases/
│   ├── product/
│   ├── qa/
│   ├── research/
│   └── security/
├── frontend/
│   ├── public/
│   │   ├── banners/
│   │   ├── emojis/
│   │   ├── Fighting/
│   │   ├── gallery/
│   │   ├── happy/
│   │   ├── headlines/
│   │   ├── manga/
│   │   ├── seo/
│   │   ├── sponsors/
│   │   └── Videos/
│   ├── scripts/
│   │   └── ensure-root-modules.mjs
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── data/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── test/
│   ├── AGENTS.md
│   ├── components.json
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── vitest.config.ts
├── scripts/
│   ├── backfill-division-occupancy.ts
│   ├── backfill-gridfs-keys.ts
│   ├── create-admin.ts
│   ├── e2e-lifecycle-audit.ts
│   ├── migrate-fighter-to-grappler.ts
│   ├── optimize-home-media.mjs
│   ├── seed-demo.ts
│   └── seed-event.ts
├── CLAUDE.md
├── package.json
├── README.md
├── tsconfig.json
└── vercel.json
```

Root also contains phase/report markdown (`PHASE_*`, `PROJECT_RESCUE_REPORT.md`) and `next-env.d.ts` / `tsconfig.tsbuildinfo`.

---

## `frontend/src/` (depth ≤ 3)

```
frontend/src/
├── app/
│   ├── (admin)/
│   ├── (auth)/
│   ├── (grappler)/
│   ├── (judge)/
│   ├── (preview)/
│   ├── (public)/
│   ├── api/
│   ├── sitemap.xml/
│   ├── error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   └── not-found.tsx
├── components/
│   ├── content/
│   ├── events/
│   ├── fighter/
│   ├── home/
│   ├── layout/
│   ├── preview/
│   └── ui/                  # 58 shadcn-style primitives
├── data/
├── features/
│   ├── admin/
│   ├── admin-payments/
│   ├── auth/
│   ├── brackets/
│   ├── chatbot/
│   ├── content/
│   ├── events/
│   ├── fighter/             # portal UI (legacy folder name)
│   ├── fighters/            # public cards / forms (legacy folder name)
│   ├── judge/
│   ├── matches/
│   ├── media/
│   ├── notifications/
│   ├── payments/
│   ├── profile/
│   ├── rankings/
│   ├── registrations/
│   ├── requests/
│   ├── scoring/
│   └── settings/
├── hooks/
├── lib/
├── test/
├── instrumentation.ts
└── proxy.ts
```

### App Router groups → URL prefixes

| Route group | URL prefix | Auth gate (layout) |
|-------------|------------|--------------------|
| `(public)/` | `/`, `/events`, `/rankings`, … | None (`frontend/src/app/(public)/layout.tsx`) |
| `(auth)/` | `/login`, `/register`, `/verify` | Public auth chrome |
| `(grappler)/grappler/` | `/grappler/*` | Session + role `GRAPPLER` → else `/login` or `/admin` |
| `(admin)/admin/` | `/admin/*` | Session + role `ADMIN` → else `/login` or `/grappler/dashboard` |
| `(judge)/judge/` | `/judge`, `/judge/login` | Separate judge cookie (`getJudgeSession`); page-level redirect |
| `(preview)/` | `/ui-preview` | Env gate (`UI_PREVIEW_ENABLED` / non-production) |

### Legacy empty directories (no `page.tsx`)

These folders exist under App Router paths but contain **no** `page.tsx` (URLs are served by `next.config.ts` redirects instead):

- `frontend/src/app/(grappler)/grappler/fighter/**` (empty shells)
- `frontend/src/app/(public)/grapplers/fighters/[slug]/`
- `frontend/src/app/(admin)/admin/grapplers/fighters/[userId]/`

Redirects (source: `frontend/next.config.ts`):

| Source | Destination |
|--------|-------------|
| `/fighter`, `/fighter/:path*` | `/grappler/dashboard`, `/grappler/:path*` |
| `/fighters`, `/fighters/:path*` | `/grapplers`, `/grapplers/:path*` |
| `/admin/fighters`, `/admin/fighters/:path*` | `/admin/grapplers`, `/admin/grapplers/:path*` |
| `/api/v1/fighter/:path*` | `/api/v1/grappler/:path*` |
| `/api/v1/public/fighters/:path*` | `/api/v1/public/grapplers/:path*` |
| `/api/v1/admin/fighters/:path*` | `/api/v1/admin/grapplers/:path*` |

Note: `frontend/src/app/api/v1/fighter/**/route.ts` still exists as live handlers alongside grappler routes (redirect + dual path).

---

## `backend/` (depth ≤ 2 folders + key files)

```
backend/
├── audit/log.ts
├── auth/                    # session, judge-session, password, cookies, OAuth state
├── content/                 # starter FAQs, submissions, community copy
├── db/                      # connect, transactions, occupancy backfill
├── email/                   # SMTP + templates/
├── http/                    # errors, rateLimit, response, image serve
├── models/                  # 24 Mongoose schemas (see list below)
├── notifications/whatsapp.ts
├── observability/logger.ts
├── services/                # 34 non-test service modules
├── storage/                 # local-disk | GridFS via factory
├── validation/objectId.ts
└── README.md
```

### `backend/models/` (24)

`AuditLog`, `Bracket`, `ContentEntry`, `Coupon`, `Division`, `EmailVerification`, `Event`, `FighterProfile` (legacy model name; product term = Grappler), `JudgeSession`, `ManualRankingEntry`, `Match`, `MatchJudgeCredential`, `MatchScoreEvent`, `MediaAsset`, `Notification`, `OutboxJob`, `PaymentSubmission`, `RankingRecord`, `Registration`, `RegistrationRequest`, `Session`, `SiteSettings`, `TransferInvite`, `User`.

### `backend/services/` (34 non-test)

`announcementService`, `bracketEngine`, `bracketService`, `chatbotEngine`, `contentService`, `couponService`, `dashboardService`, `divisionOccupancy`, `divisionTaxonomy`, `eventService`, `fighterService`, `judgeCredentialService`, `manualRankingService`, `matchConflict`, `matchService`, `mediaService`, `notificationService`, `outboxService`, `paymentOptionService`, `paymentQueue`, `paymentService`, `profilePhoto`, `rankingEngine`, `rankingService`, `registrationEligibility`, `registrationService`, `registrationStateMachine`, `reminderService`, `requestService`, `scoringService`, `siteSettingsService`, `teammateTransfer`, `tournamentRules`, `verificationMail`.

---

## `frontend/src/app/` page inventory paths (51 × `page.tsx`)

Canonical App Router files (route-group folders do not appear in the URL):

```
(public)/page.tsx
(public)/about/page.tsx
(public)/announcements/page.tsx
(public)/brackets/page.tsx
(public)/events/page.tsx
(public)/events/[slug]/page.tsx
(public)/events/[slug]/brackets/page.tsx
(public)/events/[slug]/results/page.tsx
(public)/events/[slug]/schedule/page.tsx
(public)/events/held/[slug]/page.tsx
(public)/faq/page.tsx
(public)/grapplers/page.tsx
(public)/grapplers/[slug]/page.tsx
(public)/policies/page.tsx
(public)/rankings/page.tsx
(public)/rankings/demo/page.tsx
(public)/seminars/page.tsx
(public)/store/page.tsx
(auth)/login/page.tsx
(auth)/register/page.tsx
(auth)/verify/page.tsx
(grappler)/grappler/dashboard/page.tsx
(grappler)/grappler/profile/page.tsx
(grappler)/grappler/registrations/page.tsx
(grappler)/grappler/registrations/new/page.tsx
(grappler)/grappler/registrations/[id]/payment/page.tsx
(grappler)/grappler/matches/page.tsx
(grappler)/grappler/requests/page.tsx
(grappler)/grappler/notifications/page.tsx
(grappler)/grappler/transfer/[token]/page.tsx
(admin)/admin/page.tsx
(admin)/admin/payments/page.tsx
(admin)/admin/grapplers/page.tsx
(admin)/admin/grapplers/[userId]/page.tsx
(admin)/admin/events/page.tsx
(admin)/admin/events/[id]/page.tsx
(admin)/admin/events/[id]/divisions/page.tsx
(admin)/admin/events/[id]/brackets/page.tsx
(admin)/admin/events/[id]/matches/page.tsx
(admin)/admin/events/[id]/payments/page.tsx
(admin)/admin/events/[id]/scoring-rules/page.tsx
(admin)/admin/requests/page.tsx
(admin)/admin/rankings/page.tsx
(admin)/admin/content/page.tsx
(admin)/admin/media/page.tsx
(admin)/admin/settings/page.tsx
(admin)/admin/notifications/page.tsx
(admin)/admin/audit/page.tsx
(judge)/judge/page.tsx
(judge)/judge/login/page.tsx
(preview)/ui-preview/page.tsx
```

Count verified: **51** (`Get-ChildItem … -Filter page.tsx` under `frontend/src/app`).

---

## Alias note

Webpack / TypeScript map `@/server/*` → `../backend/*` (`frontend/tsconfig.json`, `frontend/next.config.ts`). Business logic lives under `backend/`; Next.js owns `frontend/`.
