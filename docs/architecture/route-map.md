# Route Map — Up 'n Roll (Target, Phase 1 build scope marked)

Legend: **[P1]** built in Phase 1 as part of `/ui-preview` only (no real route yet) · **[later]** real route, not built until its phase.

## Public — `(public)` route group — [later, all of it]
```
/                               homepage
/about
/events
/events/[slug]
/events/[slug]/brackets
/events/[slug]/schedule
/events/[slug]/results
/fighters
/fighters/[slug]
/rankings
/media
/faq
/policies
```

## Auth — `(auth)` route group — [later]
```
/login
/register
/forgot-password
/reset-password
```

## Fighter portal — `(fighter)/fighter` — [later]
```
/fighter/dashboard
/fighter/profile
/fighter/registrations
/fighter/registrations/new
/fighter/registrations/[id]
/fighter/registrations/[id]/payment
/fighter/matches
/fighter/history
/fighter/rankings
/fighter/requests
/fighter/settings
```

## Admin portal — `(admin)/admin` — [later]
```
/admin
/admin/athletes
/admin/athletes/[id]
/admin/registrations
/admin/payments
/admin/payments/[id]
/admin/events
/admin/events/new
/admin/events/[id]
/admin/events/[id]/divisions
/admin/events/[id]/brackets
/admin/events/[id]/matches
/admin/events/[id]/schedule
/admin/results
/admin/rankings
/admin/requests
/admin/media
/admin/content
/admin/notifications
/admin/audit-logs
/admin/settings
```

## Preview — `(preview)` route group — **[P1 — THIS PHASE]**
```
/ui-preview        — 22-chapter design showroom (see Part P), the only route Phase 1 actually ships
```

## API — `src/app/api/v1/**` — [later, none built in Phase 1]

Public, authenticated-fighter, admin, and content/chatbot groups as enumerated in Part K of the directive. No handler exists yet; `docs/api/api-contract.md` documents the proposed contract for Phase 2+ implementation.

## Mapping old → new (what existing routes are replaced by what)

| Old TechBlitz route | Disposition |
|---|---|
| `/` (marketing, client-rendered) | Rebuilt as `(public)/page.tsx`, converted to Server Component where possible, new content |
| `/register`, `/problem-statement/*` | Removed — hackathon-specific, no combat-sports equivalent reuses this flow directly (fighter registration is a new, payment-aware flow, not a port) |
| `/certificates` | Removed — no Phase 1 equivalent |
| `/admin`, `/admin/dashboard` | Replaced by `(admin)/admin/*` with real auth (Phase 2) |
| `/judge-portal/*` | Removed entirely — no judging concept in Up 'n Roll's approved scope |
| `/api/register`, `/api/teams`, `/api/team/[teamName]`, `/api/certificate/save` | Removed |
| `/api/admin/*`, `/api/judge-portal/*` | Removed, replaced by versioned `/api/v1/admin/*` in Phase 2+ |
