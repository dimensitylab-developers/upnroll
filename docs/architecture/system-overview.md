# System Architecture Overview — Up 'n Roll

Single Next.js 16 App Router application. No microservices, no separate backend, no monorepo (per Part A rules 6–9).

## Conceptual layers

```mermaid
flowchart TB
    subgraph Presentation["Presentation Layer"]
        Pub["Public pages\n(home, events, fighters, rankings)"]
        Fighter["Fighter portal\n(dashboard, registrations, payment)"]
        Admin["Admin portal\n(verification, brackets, content)"]
        Preview["/ui-preview showroom"]
    end

    subgraph Application["Application Layer"]
        RegSvc["Registration service"]
        PaySvc["Payment review service"]
        TourneySvc["Tournament/bracket service"]
        RankSvc["Ranking service"]
        NotifSvc["Notification service"]
        ContentSvc["Content service"]
    end

    subgraph Domain["Domain Layer"]
        Entities["Entities: Fighter, Event, Division,\nRegistration, PaymentSubmission,\nBracket, Match, RankingRecord"]
        Policies["Policies: status transitions,\neligibility, bracket rules"]
    end

    subgraph Infra["Infrastructure Layer"]
        Mongo[(MongoDB via Mongoose)]
        Auth["Auth provider"]
        Storage["Private object storage\n(payment screenshots)"]
        Email["Email provider"]
    end

    Presentation --> Application
    Application --> Domain
    Application --> Infra
    Domain -.->|pure functions, no I/O| Application
```

Server Components and Route Handlers call application services; application services enforce domain rules and call repositories; repositories are the only layer that touches Mongoose models directly. Client Components never import `src/server/**`.

## Request/mutation data flow

```mermaid
flowchart LR
    Browser --> NextRoute["Next.js page or Route Handler"]
    NextRoute --> Validate["Zod validation"]
    Validate --> AuthZ["Session + role check"]
    AuthZ --> AppSvc["Application service"]
    AppSvc --> DomainRules["Domain rules"]
    DomainRules --> Repo["Repository"]
    Repo --> DB[(MongoDB)]
    DB --> Audit["Audit log entry\n(for sensitive mutations)"]
    Audit --> Cache["Cache invalidation /\nrevalidation"]
    Cache --> UI["UI state update"]
```

## Primary user journeys (navigation)

```mermaid
flowchart TD
    Guest[Guest] --> Home[/Homepage/]
    Home --> Events[/Events list/]
    Home --> Fighters[/Fighter directory/]
    Home --> Rankings[/Rankings/]
    Events --> EventDetail[/Event detail/]
    EventDetail --> Brackets[/Brackets/]
    EventDetail --> Schedule[/Schedule/]
    EventDetail --> Results[/Results/]
    Guest -->|Register/Login| Auth[/Auth pages/]
    Auth --> FighterDash[Fighter dashboard]
    FighterDash --> NewReg[New registration]
    NewReg --> Payment[QR payment submission]
    Payment -->|PENDING_REVIEW| AdminQueue[Admin payment queue]
    AdminQueue -->|approve| Confirmed[Registration CONFIRMED]
    AdminQueue -->|reject| Resubmit[Resubmission flow]
    Confirmed --> MatchAssign[Admin assigns match /\nbracket placement]
    MatchAssign --> FighterMatches[Fighter: assigned matches]
    MatchAssign --> PublicSchedule[Public schedule/results]
```

## Registration + payment state machine (proposed, pending final client sign-off on exact enum — see open-decisions.md)

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> AwaitingPayment: registration validated
    AwaitingPayment --> PendingVerification: screenshot + UTR submitted
    PendingVerification --> Confirmed: admin approves payment
    PendingVerification --> Rejected: admin rejects payment
    Rejected --> AwaitingPayment: fighter resubmits
    Confirmed --> TransferRequested: fighter requests transfer
    Confirmed --> Cancelled: fighter/admin cancels
    TransferRequested --> Transferred: admin approves
    TransferRequested --> Confirmed: admin denies
    Cancelled --> [*]
    Transferred --> [*]
```

Payment submission sub-state (independent field, per Part E):

```mermaid
stateDiagram-v2
    [*] --> AWAITING_SUBMISSION
    AWAITING_SUBMISSION --> PENDING_REVIEW: fighter submits UTR + screenshot
    PENDING_REVIEW --> APPROVED: admin approves
    PENDING_REVIEW --> REJECTED: admin rejects
    REJECTED --> PENDING_REVIEW: fighter resubmits
    APPROVED --> [*]
```

## Server vs. client responsibility boundary

Enforced at the module level: anything under `src/server/**` is server-only (Mongoose models, repositories, storage/email adapters, audit writer) and is never imported by a file containing `"use client"`. Route Handlers and Server Actions are the only callers of `src/server/services/*`.

## Phase 0 scope note

This document describes target architecture for the full Phase 1–7 build. Only Phase 1 (`/ui-preview`, no backend) is authorized to begin after this checkpoint.
