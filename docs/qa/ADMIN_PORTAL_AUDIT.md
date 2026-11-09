# Admin Portal Audit

Signed in as `admin@upnroll.in` on 2026-11-09. Live browser pass over all admin routes and key actions.

## Route results

| Route | Status | Notes |
|-------|--------|-------|
| `/admin` | PASS | Stats (16 fighters / 4 events / 0 pending payments / 0 pending requests), upcoming events, recent registrations, activity feed |
| `/admin/events` | PASS | Create-event form + 4 listed events with status badges |
| `/admin/events/[id]` | PASS | Status update, mat assign, divisions summary, registrations with Withdraw |
| `/admin/events/[id]/divisions` | PASS | Create-division form loads |
| `/admin/events/[id]/brackets` | PASS | Seed list + generate/randomize; validation: needs ≥2 confirmed |
| `/admin/events/[id]/matches` | PASS | Upcoming/Completed tabs; empty state OK |
| `/admin/fighters` | PASS | Full fighter records (photo/PII/medical fields); QA accounts mostly incomplete (`—`) |
| `/admin/payments` | PASS | Queue table; APPROVED + AWAITING_SUBMISSION rows; no PENDING_REVIEW to exercise Approve/Reject |
| `/admin/requests` | PASS | Empty queue (“No requests yet.”) |
| `/admin/rankings` | PASS | Recalculate → “Recalculated (v1) for 0 fighters.” |
| `/admin/content` | PASS | Create form + Unpublish on published FAQ/content items |
| `/admin/media` | PASS | Create media succeeded (`QA admin audit media`) |

## Interactions exercised

- Recalculate rankings — success message + activity feed entry
- Add media — persisted and listed
- Generate bracket (1 confirmed Lightweight fighter) — correct error: “At least two confirmed participants…”
- Soft nav from Events list → event detail intermittently stalled; hard navigation always worked

## Defects found / fixed

| ID | Issue | Severity | Disposition |
|----|-------|----------|-------------|
| BUG-QA-007 | Hydration mismatch on `AdminNav` active `className` (Next Issues 2/2, stack through AdminShell) | Medium | Fixed — defer active styles until after hydrate (`useSyncExternalStore`); same pattern on `FighterNav` |
| BUG-QA-008 | Soft-click on event cards sometimes stays on `/admin/events` | Low | Open — hard URL nav always OK; investigate Link/overlay intercept |
| — | No `PENDING_REVIEW` payments / pending requests / multi-fighter confirmed bracket | Coverage gap | Needs seeded reviewable data to exercise Approve/Reject/Decide |

## Authz smoke

- Admin session retained across all `/admin/*` routes
- Sign-out control present in admin shell
- Non-admin redirect to fighter dashboard already covered by BUG-QA-003
