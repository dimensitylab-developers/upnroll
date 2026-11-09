# System Architecture Map — Up 'n Roll

> Generated from the **current codebase** (verified imports, routes, models, and call sites).  
> Not an idealized target design. Last audited: 2026-11-09.

## How to read this map

This app is a **single Next.js 16 process**. `frontend/` is the App Router UI; `backend/` is a colocated server library imported as `@/server/*`. There is **no separate HTTP API server** for most product flows.

Primary communication patterns:

| Pattern | Used for | Status |
|---------|----------|--------|
| Server Component → `@/server/services/*` | Page data loads | Fully wired |
| Server Action (`"use server"`) → services | Mutations | Fully wired |
| Route Handler (`route.ts`) | Health, Google OAuth, binary GETs | Fully wired (limited surface) |
| REST `/api/v1/*` JSON CRUD | Documented in `docs/api/api-contract.md` | **Proposal only — not implemented** |

### Integration status legend

| Marker | Meaning |
|--------|---------|
| 🟢 | Fully connected and verified in source |
| 🟡 | Partially connected (env-gated, soft-fail, or incomplete workflow) |
| 🔴 | Broken or disconnected |
| ⚪ | Unused / unreferenced / placeholder page |
| 🔵 | External dependency |
| 🟣 | Mocked / console stand-in |

### Document index

| Document | Contents |
|----------|----------|
| [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) | Pages, routes, components, auth gates |
| [API_ARCHITECTURE.md](./API_ARCHITECTURE.md) | HTTP routes + Server Actions (separated) |
| [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) | Modules, services, dependencies |
| [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) | Models, collections, ER relationships |
| [EXTERNAL_INTEGRATIONS.md](./EXTERNAL_INTEGRATIONS.md) | SMTP, Google, storage, WhatsApp stub |
| [SYSTEM_INTEGRATION_AUDIT.md](./SYSTEM_INTEGRATION_AUDIT.md) | Disconnected / mocked / unused inventory |
| [system-overview.md](./system-overview.md) | Older conceptual overview (partially stale) |
| [route-map.md](./route-map.md) | Older route notes (partially stale) |
| [data-model.md](./data-model.md) | Older data notes (collection names drift) |
| [folder-structure.md](./folder-structure.md) | Older layout notes (stale on `backend/`) |

---

## A. Complete System Mind Map

```mermaid
flowchart TB
  subgraph FE["1–3. FRONTEND / PAGES / UI"]
    Public["Public pages 🟢"]
    AuthPages["Auth pages 🟢"]
    FighterPortal["Fighter portal 🟢"]
    AdminPortal["Admin portal 🟢"]
    Placeholders["Store / Seminars ⚪"]
    Preview["/ui-preview 🟡"]
    UI["Layouts + Features + shadcn 🟢"]
  end

  subgraph COMM["4–5. COMMUNICATION"]
    RSC["RSC service imports 🟢"]
    SA["Server Actions 🟢"]
    HTTP["HTTP Route Handlers 🟢<br/>health · OAuth · binary GET"]
  end

  subgraph BE["6–7. BACKEND MODULES / SERVICES"]
    AuthMod["Auth & Session 🟢"]
    EventMod["Events & Divisions 🟢"]
    RegPay["Registration & Payments 🟢"]
    Tourney["Brackets & Matches 🟢"]
    RankMod["Rankings 🟢"]
    ContentMod["Content & Media & Chatbot 🟢"]
    FileMod["Profile Photo & Storage 🟢"]
    AuditMod["Audit Log 🟢"]
    DashMod["Dashboard compose 🟢"]
    Engines["Pure engines 🟢<br/>bracket · ranking · state machine · FAQ"]
  end

  subgraph DATA["8–9. MODELS / COLLECTIONS"]
    Models["16 Mongoose models 🟢"]
    Mongo[(MongoDB 🔵)]
    GridFS[(GridFS privateFiles 🟡/🟢)]
  end

  subgraph EXT["10–11. EXTERNAL / STORAGE"]
    SMTP["SMTP / Nodemailer 🔵🟡"]
    ConsoleMail["Console email 🟣"]
    Google["Google OAuth 🔵🟡"]
    LocalDisk["Local disk storage 🟢"]
    WA["WhatsApp notify 🟣"]
  end

  subgraph AUTHZ["12. AUTH & AUTHORIZATION"]
    Proxy["proxy.ts cookie gate 🟢"]
    Layouts["Role layouts 🟢"]
    Require["requireSession / requireActor 🟢"]
  end

  subgraph OPS["13–14. JOBS / INFRA"]
    NoJobs["No cron / queues ⚪"]
    Scripts["CLI scripts 🟢"]
    CI["GitHub Actions CI 🟢"]
    NoDocker["No Docker / Vercel config ⚪"]
  end

  Public --> RSC
  AuthPages --> SA
  FighterPortal --> RSC
  FighterPortal --> SA
  AdminPortal --> RSC
  AdminPortal --> SA
  UI --> Public
  UI --> FighterPortal
  UI --> AdminPortal

  SA --> AuthMod
  SA --> EventMod
  SA --> RegPay
  SA --> Tourney
  SA --> RankMod
  SA --> ContentMod
  SA --> FileMod
  RSC --> DashMod
  RSC --> EventMod
  RSC --> RegPay
  RSC --> Tourney
  RSC --> RankMod
  RSC --> ContentMod
  HTTP --> AuthMod
  HTTP --> FileMod

  AuthMod --> Require
  Proxy --> Layouts
  Layouts --> Require

  AuthMod --> Models
  EventMod --> Models
  RegPay --> Models
  Tourney --> Models
  RankMod --> Models
  ContentMod --> Models
  FileMod --> Models
  AuditMod --> Models
  DashMod --> EventMod
  DashMod --> RegPay
  Engines --> Tourney
  Engines --> RankMod

  Models --> Mongo
  FileMod --> LocalDisk
  FileMod --> GridFS
  AuthMod --> SMTP
  AuthMod --> ConsoleMail
  AuthMod --> Google
  RegPay --> SMTP
  Tourney --> SMTP
  Tourney --> WA

  Scripts --> Models
  CI --> FE
```

---

## B. Frontend Pages & Component Map

See full page inventory in [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md).

```mermaid
flowchart TB
  subgraph PublicGroup["(public) — no auth"]
    Home["/  Home"]
    Events["/events"]
    EventSlug["/events/[slug]"]
    EvBrackets["/events/[slug]/brackets"]
    EvSchedule["/events/[slug]/schedule"]
    EvResults["/events/[slug]/results"]
    Held["/events/held/[slug]"]
    FightersRedirect["/fighters → /rankings ⚪"]
    FighterSlug["/fighters/[slug]"]
    Rankings["/rankings"]
    RankDemo["/rankings/demo"]
    Brackets["/brackets"]
    FAQ["/faq"]
    About["/about"]
    Ann["/announcements"]
    Pol["/policies"]
    Store["/store ComingSoon ⚪"]
    Sem["/seminars ComingSoon ⚪"]
  end

  subgraph AuthGroup["(auth)"]
    Login["/login"]
    Register["/register"]
    Verify["/verify"]
  end

  subgraph FighterGroup["(fighter) — FIGHTER role"]
    FDash["/fighter/dashboard"]
    FProf["/fighter/profile"]
    FRegs["/fighter/registrations"]
    FNew["/fighter/registrations/new"]
    FPay["/fighter/registrations/[id]/payment"]
    FMatch["/fighter/matches"]
    FReq["/fighter/requests"]
    FXfer["/fighter/transfer/[token]"]
  end

  subgraph AdminGroup["(admin) — ADMIN role"]
    AHome["/admin"]
    AEvents["/admin/events"]
    AEvent["/admin/events/[id]"]
    ADiv["/admin/events/[id]/divisions"]
    ABr["/admin/events/[id]/brackets"]
    AMatch["/admin/events/[id]/matches"]
    AFight["/admin/fighters"]
    APay["/admin/payments"]
    AReq["/admin/requests"]
    ARank["/admin/rankings"]
    AContent["/admin/content"]
    AMedia["/admin/media"]
  end

  SiteHeader["SiteHeader / SiteFooter / ChatbotWidget"] --> PublicGroup
  LoginForm["LoginForm"] --> Login
  RegisterForm["RegisterForm"] --> Register
  FighterNav["FighterNav"] --> FighterGroup
  AdminNav["AdminNav"] --> AdminGroup
```

---

## C. Frontend → API / Action Connection Map

Most pages do **not** call HTTP APIs. They call services or Server Actions.

```mermaid
flowchart LR
  subgraph Pages
    LoginP["/login"]
    RegP["/register"]
    PayP["Fighter payment"]
    AdminPay["Admin payments"]
    AdminBr["Admin brackets"]
    HomeP["Home / Events"]
    PhotoUI["Admin fighters / Profile"]
  end

  subgraph Actions["Server Actions"]
    LoginA["loginAction"]
    RegA["registerAction"]
    SubmitPay["submitPaymentAction"]
    ApprovePay["approvePaymentAction"]
    GenBr["generateBracketAction"]
  end

  subgraph HTTP["HTTP only"]
    GoogleStart["GET /api/auth/google"]
    PhotoGet["GET /api/v1/.../photo"]
    ShotGet["GET /api/v1/admin/payments/[id]/screenshot"]
  end

  subgraph Services
    AuthSess["createSession / User"]
    PaySvc["paymentService"]
    BrSvc["bracketService"]
    EventSvc["eventService"]
    FightSvc["fighterService"]
  end

  LoginP --> LoginA --> AuthSess
  LoginP -.->|optional| GoogleStart
  RegP --> RegA --> AuthSess
  PayP --> SubmitPay --> PaySvc
  AdminPay --> ApprovePay --> PaySvc
  AdminPay --> ShotGet --> PaySvc
  AdminBr --> GenBr --> BrSvc
  HomeP --> EventSvc
  PhotoUI --> PhotoGet --> FightSvc
```

Full tables: [API_ARCHITECTURE.md](./API_ARCHITECTURE.md), [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md).

---

## D. API → Backend Module Map

```mermaid
flowchart TB
  subgraph HTTPHandlers["Route Handlers"]
    H1["/api/health"]
    H2["/api/auth/google*"]
    H3["/api/v1/fighter/photo"]
    H4["/api/v1/admin/fighters/[userId]/photo"]
    H5["/api/v1/admin/payments/[id]/screenshot"]
  end

  subgraph ActionDomains["Server Action domains"]
    AAuth["auth/actions"]
    AReg["registrations/actions"]
    APay["payments + admin-payments"]
    AEv["events/actions"]
    ABr["brackets/actions"]
    AMatch["matches/actions"]
    AReq["requests/actions"]
    AProf["profile/actions"]
    ARank["rankings/actions"]
    ACont["content/actions"]
    AMedia["media/actions"]
    AChat["askChatbotAction"]
  end

  subgraph Modules["backend/"]
    MAuth["auth/* + verificationMail"]
    MFight["fighterService + profilePhoto"]
    MEvent["eventService + divisionOccupancy"]
    MReg["registrationService + stateMachine"]
    MPay["paymentService + paymentQueue helper"]
    MBr["bracketService + bracketEngine"]
    MMatch["matchService"]
    MReq["requestService + teammateTransfer"]
    MRank["rankingService + rankingEngine"]
    MCont["contentService + mediaService + chatbotEngine"]
    MStor["storage/*"]
  end

  H1 --> MAuth
  H2 --> MAuth
  H3 --> MFight --> MStor
  H4 --> MFight --> MStor
  H5 --> MPay --> MStor

  AAuth --> MAuth
  AReg --> MReg
  AReg --> MFight
  APay --> MPay
  AEv --> MEvent
  ABr --> MBr
  AMatch --> MMatch
  AReq --> MReq
  AProf --> MFight
  ARank --> MRank
  ACont --> MCont
  AMedia --> MCont
  AChat --> MCont
```

---

## E. Backend Service Dependency Map

```mermaid
flowchart LR
  dashboardService --> eventService
  dashboardService --> paymentService
  dashboardService --> requestService
  dashboardService --> registrationService
  dashboardService --> fighterService
  dashboardService --> matchService
  dashboardService --> tournamentRules

  registrationService --> divisionOccupancy
  registrationService --> registrationStateMachine
  registrationService --> matchService
  paymentService --> registrationStateMachine
  paymentService --> divisionOccupancy
  paymentService --> paymentQueue
  paymentService --> storage
  bracketService --> bracketEngine
  bracketService --> tournamentRules
  matchService --> bracketEngine
  rankingService --> rankingEngine
  fighterService --> matchService
  requestService --> tournamentRules
  requestService --> divisionOccupancy
  profilePhoto --> storage
  verificationMail --> email
```

Details: [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

---

## F. Backend → Database Connection Map

```mermaid
flowchart LR
  session["auth/session"] --> sessions
  session --> users
  verificationMail --> emailverifications
  verificationMail --> users
  fighterService --> fighterprofiles
  fighterService --> users
  eventService --> events
  eventService --> divisions
  registrationService --> registrations
  registrationService --> paymentsubmissions
  paymentService --> paymentsubmissions
  paymentService --> registrations
  bracketService --> brackets
  bracketService --> matches
  matchService --> matches
  rankingService --> rankingrecords
  rankingService --> matches
  requestService --> registrationrequests
  teammateTransfer --> transferinvites
  contentService --> contententries
  mediaService --> mediaassets
  audit["audit/log"] --> auditlogs
  storage_gridfs["storage/gridfs"] --> privateFiles["privateFiles.files/chunks"]
```

---

## G. Database Entity Relationship Map

```mermaid
erDiagram
  User ||--o| FighterProfile : "1:1 userId"
  User ||--o{ Session : "1:N"
  User ||--o{ EmailVerification : "1:N"
  User ||--o{ Registration : "1:N"
  User ||--o{ RankingRecord : "1:1 userId"
  Event ||--o{ Division : "1:N"
  Event ||--o{ Registration : "1:N"
  Event ||--o{ Bracket : "1:N"
  Event ||--o{ Match : "1:N"
  Event ||--o{ MediaAsset : "0:N"
  Division ||--o{ Registration : "1:N"
  Division ||--o| Bracket : "1:1 divisionId"
  Registration ||--o{ PaymentSubmission : "1:N"
  Registration ||--o{ RegistrationRequest : "1:N"
  Registration ||--o{ TransferInvite : "1:N"
  Registration ||--o{ Match : "competitor/winner refs"
  Bracket ||--o{ Match : "1:N"
  User ||--o{ ContentEntry : "createdBy"
  User ||--o{ AuditLog : "actorId optional"
```

Full field/index detail: [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md).

---

## H. External Services Integration Map

```mermaid
flowchart TB
  subgraph App["Up n Roll Next.js process"]
    AuthActions["Auth actions / OAuth routes"]
    PaySvc2["paymentService"]
    MatchSvc2["matchService"]
    ReqSvc2["requestService"]
    StorFactory["storage/factory"]
  end

  MongoExt[(MongoDB Atlas or local 🔵🟢)]
  SMTPExt["SMTP provider via Nodemailer 🔵🟡"]
  ConsoleExt["console email adapter 🟣"]
  GoogleExt["accounts.google.com 🔵🟡"]
  DiskExt[".local-storage/ 🟢"]
  GridExt[(GridFS bucket privateFiles 🔵🟢)]
  WAExt["WhatsApp API — NOT connected 🟣"]

  AuthActions --> MongoExt
  AuthActions --> SMTPExt
  AuthActions --> ConsoleExt
  AuthActions --> GoogleExt
  PaySvc2 --> SMTPExt
  PaySvc2 --> StorFactory
  MatchSvc2 --> SMTPExt
  MatchSvc2 --> WAExt
  ReqSvc2 --> SMTPExt
  StorFactory --> DiskExt
  StorFactory --> GridExt
  App --> MongoExt
```

Details: [EXTERNAL_INTEGRATIONS.md](./EXTERNAL_INTEGRATIONS.md).

---

## I. Authentication & Authorization Flow

```mermaid
sequenceDiagram
  participant B as Browser
  participant P as proxy.ts
  participant L as Fighter/Admin layout
  participant A as Server Action / Route
  participant S as auth/session
  participant DB as sessions + users

  B->>P: GET /fighter/* or /admin/*
  alt missing upnroll_session cookie
    P-->>B: redirect /login
  else cookie present
    P->>L: continue
    L->>S: getSession()
    S->>DB: tokenHash lookup + ACTIVE user
    alt no session or wrong role
      L-->>B: redirect /login
    else authorized
      L-->>B: render shell
      B->>A: mutation or binary GET
      A->>S: requireSession / requireActor
      S->>DB: re-verify
      A-->>B: result
    end
  end
```

Roles in code: `FIGHTER` | `ADMIN` only (no `GUEST` role model).

Login paths:

1. 🟢 Email/password → `loginAction` → `createSession` → cookie
2. 🟢 Register → email code → `verifyEmailAction` → session
3. 🟡 Google OAuth → `/api/auth/google*` (requires `GOOGLE_CLIENT_ID/SECRET`; else soft redirect)

---

## J. Complete End-to-End Data Flows

### J1. Registration → Payment → Confirmation

```mermaid
flowchart TD
  NewReg["/fighter/registrations/new"] --> CreateA["createRegistrationAction"]
  CreateA --> RegSvc["registrationService.createRegistration"]
  RegSvc --> Occ["divisionOccupancy.claim"]
  RegSvc --> RegCol[(registrations)]
  RegSvc --> PayStub[(paymentsubmissions stub)]
  RegSvc --> PayPage["/fighter/registrations/[id]/payment"]
  PayPage --> SubmitA["submitPaymentAction"]
  SubmitA --> PaySvc["paymentService.submitPayment"]
  PaySvc --> Stor["storage.put screenshot"]
  PaySvc --> PayCol[(paymentsubmissions)]
  PaySvc --> RegCol
  AdminQ["/admin/payments"] --> ApproveA["approvePaymentAction"]
  ApproveA --> PaySvc2["paymentService.approvePayment"]
  PaySvc2 --> RegCol
  PaySvc2 --> Audit[(auditlogs)]
  PaySvc2 --> Mail["email adapter 🟢/🟣"]
```

### J2. Bracket → Match result → Rankings

```mermaid
flowchart TD
  AdminBr["/admin/events/[id]/brackets"] --> Gen["generateBracketAction"]
  Gen --> BrSvc["bracketService + bracketEngine"]
  BrSvc --> BrCol[(brackets)]
  BrSvc --> MatchCol[(matches)]
  Pub["publishBracketAction"] --> BrSvc
  AdminM["/admin/events/[id]/matches"] --> Res["recordResultAction"]
  Res --> MatchSvc["matchService"]
  MatchSvc --> MatchCol
  MatchSvc --> Mail["email 🟢/🟣"]
  MatchSvc --> WA["notifyWhatsApp 🟣"]
  AdminR["/admin/rankings"] --> Recalc["recalculateRankingsAction"]
  Recalc --> RankSvc["rankingService + rankingEngine"]
  RankSvc --> MatchCol
  RankSvc --> RankCol[(rankingrecords)]
  PublicR["/rankings"] --> RankSvc
```

### J3. Public content / FAQ chatbot

```mermaid
flowchart TD
  FAQ["/faq"] --> Content["contentService.listPublished"]
  Content --> CE[(contententries)]
  Chat["ChatbotWidget"] --> Ask["askChatbotAction"]
  Ask --> Cache["cachedPublishedContent FAQ"]
  Ask --> Engine["chatbotEngine.matchFaq — local keywords, no LLM"]
```

---

## Traceability cheat sheet

Pick any page and follow:

**Forward:** Page → Feature component → Server Action or RSC service import → `backend/services/*` → model → Mongo collection → external adapter (if any)

**Reverse:** Collection → model file in `backend/models/` → greppable service writers → Server Action / page importer in `frontend/src/`

| Example page | Action / loader | Service | Collections |
|--------------|-----------------|---------|-------------|
| `/login` | `loginAction` | `auth/session` + User | `users`, `sessions` |
| `/fighter/registrations/new` | `createRegistrationAction` | `registrationService` | `registrations`, `divisions`, `paymentsubmissions` |
| `/admin/payments` | `approvePaymentAction` + screenshot GET | `paymentService` | `paymentsubmissions`, `registrations`, storage |
| `/events/[slug]/brackets` | `cachedPublishedBracket` | `bracketService` reads | `brackets`, `divisions`, `events` |
| `/rankings` | `listPublicRankings` | `rankingService` | `rankingrecords`, `fighterprofiles` |

---

## Architecture facts (non-negotiable)

1. **One deployable:** Next.js app under `frontend/`; `backend/` is not a standalone server.
2. **Mutations are Server Actions**, not REST POST/PUT/PATCH/DELETE handlers.
3. **Only 6 product HTTP routes** (+ sitemap): health, Google OAuth ×2, 3 binary GETs.
4. **16 Mongoose models**, all referenced; no orphan schemas.
5. **No background job runner**; `paymentQueue.ts` is a duplicate-UTR helper, not a queue.
6. **Payments are manual UTR + screenshot** — no Stripe/Razorpay.
7. **WhatsApp is a console mock**; SMTP is real in production, console in development.
8. Older docs that assume a full `/api/v1` REST surface or missing GridFS are **stale** relative to this map.
