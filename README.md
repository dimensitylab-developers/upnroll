<div align="center">

# ⚡ Up 'n Roll.

**Combat sports tournament management — built for the mat, not the spreadsheet.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)]()

Built by **DimensityLabs** · 6 phases shipped · 19/19 live assertions passed end-to-end

</div>

---

## What is Up 'n Roll?

Up 'n Roll is a full-stack tournament management platform for combat sports organizations. It handles everything from fighter registration and QR-based payments, through automated bracket generation, to live results, rankings, and an admin-reviewed request workflow — all in one place.

> Designed with an anime/manga-inspired visual identity. Fast, clean, and built to run on fight day.

---

## ✨ Feature Highlights

| Area | What's Live |
|---|---|
| 🏠 **Public Site** | Data-driven homepage, event listings, brackets, schedules, results, fighter directory, rankings, FAQ, announcements, policies |
| 🔐 **Authentication** | Session-based auth, role-gated routes (fighter / admin), secure cookie management |
| 🥊 **Fighter Portal** | Dashboard, profile editing, event registration, payment submission, match history, cancellation/transfer requests |
| 🛠 **Admin Portal** | Full tournament control — events, divisions, brackets, matches, payments, rankings, media, content, request review |
| 🏆 **Bracket Engine** | Deterministic single-elimination generation, seeded-random or manual ordering, auto-resolved byes, result correction with audit trail |
| 💳 **Payments** | QR + screenshot/UTR submission, private admin-only viewing, duplicate-UTR detection, manual approve/reject with reason |
| 📊 **Rankings** | Pluggable `RankingStrategy` interface, recalculate-on-demand, public leaderboard |
| 🤖 **Chatbot** | FAQ-bounded support widget — no LLM, deterministic keyword matching against admin-published content |
| 📋 **Requests** | Generic admin-reviewed cancellation/transfer workflow with notes and full status tracking |
| 🔒 **Security** | Rate limiting, audit logging, IP capture, role-enforced middleware |

---

## 🗂 Monorepo Structure

```
upnroll/
├── frontend/          # Next.js 16 App Router app (UI, pages, server actions)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/      # Public-facing pages with shared SiteHeader + SiteFooter
│   │   │   ├── (auth)/        # Login, register
│   │   │   ├── (fighter)/     # Guarded fighter portal
│   │   │   ├── (admin)/       # Guarded admin portal
│   │   │   ├── (preview)/     # /ui-preview design showroom
│   │   │   └── api/           # REST endpoints (v1)
│   │   ├── components/        # Shared UI components (shadcn/ui base)
│   │   └── features/          # Feature-sliced modules (auth, events, brackets, …)
│   └── package.json
│
├── backend/           # Server-side: models, services, auth, db, http utilities
│   ├── models/        # Mongoose models (User, Event, Division, Match, …)
│   ├── services/      # Business logic (bracketEngine, matchService, rankingEngine, …)
│   ├── auth/          # Session, cookies, password hashing
│   ├── http/          # Rate limiting, error handling, response helpers
│   ├── audit/         # Audit log writer
│   └── db/            # MongoDB connection
│
├── scripts/           # CLI utilities (create-admin, seed-demo)
├── docs/              # Architecture, phases, decisions, deployment, legal
└── package.json       # Root scripts — delegates to frontend/
```

> `frontend/` and `backend/` are already wired together via the `@/server/*` alias. You don't need to reconnect them.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/dimensitylab-developers/upnroll.git
cd upnroll
npm install --prefix frontend
```

### 2. Configure Environment

```bash
cp frontend/.env.example frontend/.env.local
# Fill in MONGODB_URI, SESSION_SECRET, and any other required vars
```

### 3. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Seed Demo Data *(optional)*

```bash
npm run seed-demo
```

### 5. Create an Admin User

```bash
npm run create-admin
```

---

## 🧪 Tests

```bash
npm test
```

Tests live alongside their modules (`*.test.ts`). Key coverage:
- `backend/services/matchService.test.ts`
- `backend/services/requestService.test.ts`
- `backend/services/bracketEngine.test.ts`
- `backend/services/rankingEngine.test.ts`
- `backend/auth/session.test.ts`
- `backend/http/rateLimit.test.ts`

---

## 🗺 Route Map (live routes)

### Public `/`
| Route | Status |
|---|---|
| `/` | ✅ Data-driven homepage |
| `/events` | ✅ Published events listing |
| `/events/[slug]` | ✅ Event detail |
| `/events/[slug]/brackets` | ✅ Published brackets |
| `/events/[slug]/schedule` | ✅ Match schedule |
| `/events/[slug]/results` | ✅ Completed results |
| `/fighters` | ✅ Fighter directory |
| `/fighters/[slug]` | ✅ Public profile + match history |
| `/rankings` | ✅ Live leaderboard |
| `/faq`, `/announcements`, `/policies` | ✅ |

### Fighter Portal `/fighter`
| Route | Status |
|---|---|
| `/fighter/dashboard` | ✅ |
| `/fighter/profile` | ✅ |
| `/fighter/registrations` + `/new` | ✅ |
| `/fighter/registrations/[id]/payment` | ✅ |
| `/fighter/matches` | ✅ |
| `/fighter/requests` | ✅ |

### Admin Portal `/admin`
| Route | Status |
|---|---|
| `/admin` | ✅ Dashboard |
| `/admin/payments` | ✅ Review queue |
| `/admin/events` | ✅ Create + list |
| `/admin/events/[id]` | ✅ Manage event |
| `/admin/events/[id]/divisions` | ✅ |
| `/admin/events/[id]/brackets` | ✅ Generate + publish |
| `/admin/events/[id]/matches` | ✅ Record + correct results |
| `/admin/rankings` | ✅ Recalculate + view |
| `/admin/requests` | ✅ Approve / reject |
| `/admin/media` | ✅ |
| `/admin/content` | ✅ FAQ / Announcement / Policy |

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run test suite |
| `npm run lint` | Lint the codebase |
| `npm run create-admin` | Provision an admin user |
| `npm run seed-demo` | Seed demo tournament data |

---

## 📚 Documentation

| Doc | Description |
|---|---|
| [`docs/architecture/`](docs/architecture/) | System overview, folder structure, route map, data model |
| [`docs/phases/`](docs/phases/) | Per-phase implementation reports (Phases 0–6) |
| [`docs/deployment/`](docs/deployment/) | Deployment guide, backup & restore |
| [`docs/product/scope-matrix.md`](docs/product/scope-matrix.md) | Full requirements matrix with approval status |
| [`docs/decisions/open-decisions.md`](docs/decisions/open-decisions.md) | Pending client decisions |
| [`docs/api/api-contract.md`](docs/api/api-contract.md) | API contract |
| [`docs/legal/THIRD_PARTY_NOTICES.md`](docs/legal/THIRD_PARTY_NOTICES.md) | Third-party notices and provenance |

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Database | MongoDB via Mongoose |
| Auth | Custom session-based (no third-party auth) |
| Testing | Vitest |
| Deployment | Node.js server (see `docs/deployment/`) |

---

## ⚖️ Legal

Built by **DimensityLabs**. Originally scaffolded from the VCET NSDC TechBlitz-26 project's shadcn/ui component set (MIT licence). See [`docs/legal/THIRD_PARTY_NOTICES.md`](docs/legal/THIRD_PARTY_NOTICES.md) and [`docs/phases/00-repository-audit.md`](docs/phases/00-repository-audit.md) for the full provenance and audit trail.

---

<div align="center">

Made with ⚡ by DimensityLabs

</div>
