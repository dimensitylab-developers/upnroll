# API Contract Proposal — Up 'n Roll

Status: **proposal, no handlers implemented.** Phase 1 ships zero API routes — `/ui-preview` uses local fixtures only. This document is the agreed shape for Phase 2+ implementation, replacing the old TechBlitz `/api/*` surface (unversioned, no shared envelope, passcode-only auth — see repository audit §5).

## Conventions

- Prefix: `/api/v1`
- REST-style resource naming, correct HTTP verbs.
- Every mutation validated with Zod before touching application services.
- Every private-data endpoint re-checks session + role server-side, scoped to the authenticated account unless the caller is an authorized admin action.
- Standard response envelope:

```json
{ "success": true, "data": {}, "meta": { "requestId": "..." } }
```

```json
{ "success": false, "error": { "code": "PAYMENT_ALREADY_REVIEWED", "message": "..." } }
```

- List endpoints are paginated; filters are explicit query params, not free-form.
- High-risk mutations (`approve`/`reject`/`generate`/`publish`) are idempotent — repeating the same request must not double-apply the effect.

## Endpoint groups (full list from Part K, carried here for implementation reference)

### Public
```
GET /api/v1/events
GET /api/v1/events/[eventId]
GET /api/v1/events/[eventId]/divisions
GET /api/v1/events/[eventId]/brackets
GET /api/v1/events/[eventId]/schedule
GET /api/v1/events/[eventId]/results
GET /api/v1/fighters
GET /api/v1/fighters/[fighterId]
GET /api/v1/rankings
GET /api/v1/content/faqs
GET /api/v1/content/announcements
```

### Authenticated fighter (`/api/v1/me/*`)
```
GET   /api/v1/me
PATCH /api/v1/me
GET   /api/v1/me/registrations
POST  /api/v1/me/registrations
GET   /api/v1/me/registrations/[id]
POST  /api/v1/me/registrations/[id]/payment-submissions
GET   /api/v1/me/registrations/[id]/payment-submissions
GET   /api/v1/me/matches
GET   /api/v1/me/history
GET   /api/v1/me/rankings
GET   /api/v1/me/requests
POST  /api/v1/me/requests
```

### Admin (`/api/v1/admin/*`)
```
GET   /api/v1/admin/overview
GET   /api/v1/admin/athletes
GET   /api/v1/admin/athletes/[id]
PATCH /api/v1/admin/athletes/[id]
GET   /api/v1/admin/registrations
GET   /api/v1/admin/registrations/[id]
PATCH /api/v1/admin/registrations/[id]
GET   /api/v1/admin/payments
GET   /api/v1/admin/payments/[id]
POST  /api/v1/admin/payments/[id]/approve
POST  /api/v1/admin/payments/[id]/reject
GET   /api/v1/admin/events
POST  /api/v1/admin/events
GET   /api/v1/admin/events/[id]
PATCH /api/v1/admin/events/[id]
POST  /api/v1/admin/events/[id]/divisions
POST  /api/v1/admin/events/[id]/brackets/generate
POST  /api/v1/admin/events/[id]/brackets/publish
PATCH /api/v1/admin/matches/[id]
POST  /api/v1/admin/matches/[id]/result
POST  /api/v1/admin/matches/[id]/correct-result
GET   /api/v1/admin/requests
POST  /api/v1/admin/requests/[id]/approve
POST  /api/v1/admin/requests/[id]/reject
GET   /api/v1/admin/audit-logs
```

### Content/chatbot
Defined in detail only when their implementation phase begins (Phase 5), per Part K.

## Example documented endpoint (template to repeat for every real handler in Phase 2+)

**`POST /api/v1/admin/payments/[id]/approve`**
- Purpose: record an admin's approval decision on a payment submission, triggering registration confirmation.
- Auth: session required, role `ADMIN`.
- Path params: `id` (payment submission id).
- Request body: `{ reviewNote?: string }`
- Response: `{ success: true, data: { paymentSubmission, registration } }`
- Errors: `404 NOT_FOUND`, `409 PAYMENT_ALREADY_REVIEWED`, `403 FORBIDDEN`.
- Domain validation: submission must be in `PENDING_REVIEW`; approval is idempotent (second call on an already-`APPROVED` submission returns `409`, not a duplicate success).
- DB effect: payment submission → `APPROVED`; registration → `Confirmed`.
- Audit: writes an `audit_logs` entry with actor, before/after status.
- Notification: triggers registration-confirmed email (Phase 5 wiring).

Every real endpoint built in Phase 2+ must be documented to this level before or alongside implementation.

## Explicit non-duplication rule

Where both a Server Action and a REST handler could perform the same mutation (e.g., payment approval from an admin page vs. a potential external integration), both must call the same `src/server/services/*` function — no duplicated business logic between the two call paths.
