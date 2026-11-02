# Route Map — Up 'n Roll (updated through Phase 4)

Legend: **[built]** real route, live in the codebase · **[P1 fixture]** exists only as a `/ui-preview` chapter, no real route · **[later]** not built yet.

## Public — plain routes under `src/app/` (not grouped; no shared public layout exists yet, see note below)
```
/                               [P1 fixture] placeholder pointing to /ui-preview — real homepage not built
/about                          [later]
/events                         [built, Phase 4] listing, published statuses only
/events/[slug]                  [built, Phase 4]
/events/[slug]/brackets         [built, Phase 4] published brackets only
/events/[slug]/schedule         [built, Phase 4] published-bracket matches only
/events/[slug]/results          [built, Phase 4] completed/bye matches from published brackets
/fighters                       [later]
/fighters/[slug]                [later]
/rankings                       [later — Phase 5, methodology pending OD-004]
/media                          [later]
/faq                            [later]
/policies                       [later]
```
Note: the plan called for a `(public)` route group with its own layout (per Part G). Phase 4 added the event/bracket/schedule/results pages as plain routes instead, since no shared public layout exists yet (the homepage is still Phase 1's placeholder) — a route group with no distinct layout would be pure ceremony. Revisit this once real homepage/public-layout work begins.

## Auth — `(auth)` route group — **[built, Phase 2]**
```
/login                          [built]
/register                       [built] — FIGHTER role only, no public admin registration (Part M)
/forgot-password                [later]
/reset-password                 [later]
```

## Fighter portal — `(fighter)/fighter` — **[partially built]**
```
/fighter/dashboard              [built, Phase 2]
/fighter/profile                [later]
/fighter/registrations          [built, Phase 3]
/fighter/registrations/new      [built, Phase 3]
/fighter/registrations/[id]/payment  [built, Phase 3] (route is .../payment, not a separate [id]/page.tsx — payment view doubles as the registration detail view)
/fighter/matches                [built, Phase 4]
/fighter/history                [later]
/fighter/rankings                [later]
/fighter/requests               [later — Phase 5]
/fighter/settings               [later]
```

## Admin portal — `(admin)/admin` — **[partially built]**
```
/admin                           [built, Phase 2] overview placeholder
/admin/athletes                  [later]
/admin/athletes/[id]             [later]
/admin/registrations             [later — registration status editing beyond payment review]
/admin/payments                  [built, Phase 3]
/admin/payments/[id]             [not a route — payment review happens via a dialog on /admin/payments, not a dedicated detail page]
/admin/events                    [built, Phase 4] list + create
/admin/events/[id]               [built, Phase 4] overview + status control
/admin/events/[id]/divisions     [built, Phase 4] create/list
/admin/events/[id]/brackets      [built, Phase 4] generate/preview/publish, per division
/admin/events/[id]/matches       [built, Phase 4] record/correct results, flat list across the event
/admin/events/[id]/schedule      [not built separately — scheduling (mat/time) is not yet exposed as its own admin view, only via the data model; add when real event-day operations are prioritized]
/admin/results                   [not needed as a separate route — results live in /admin/events/[id]/matches]
/admin/rankings                  [later — Phase 5]
/admin/requests                  [later — Phase 5]
/admin/media                     [later]
/admin/content                   [later]
/admin/notifications             [later]
/admin/audit-logs                [later — AuditLog model and writer exist since Phase 2, no admin viewer UI yet]
/admin/settings                  [later]
```

## Preview — `(preview)` route group — **[built, Phase 1]**
```
/ui-preview        — 22-chapter design showroom, still live as the design reference
```

## API — `src/app/api/v1/**`
```
GET /api/v1/admin/payments/[id]/screenshot   [built, Phase 3] — the only real REST endpoint so far; everything else is Server Actions (Part K pattern: share services, don't duplicate logic between REST and actions — there's been no need for a second caller yet)
```

## Mapping old → new (unchanged from Phase 0, still accurate)

| Old TechBlitz route | Disposition |
|---|---|
| `/` (marketing, client-rendered) | Still pending — Phase 1 placeholder remains until real homepage work begins |
| `/register`, `/problem-statement/*` | Removed — replaced by the real, payment-aware `(fighter)` registration flow (Phase 3) |
| `/certificates` | Removed — no Phase equivalent |
| `/admin`, `/admin/dashboard` | Replaced by `(admin)/admin/*` with real auth (Phase 2) and real event/payment/bracket management (Phases 3–4) |
| `/judge-portal/*` | Removed entirely — no judging concept in Up 'n Roll's approved scope |
| `/api/register`, `/api/teams`, `/api/team/[teamName]`, `/api/certificate/save` | Removed |
| `/api/admin/*`, `/api/judge-portal/*` | Removed, replaced by versioned `/api/v1/admin/*` (one endpoint built so far) |
