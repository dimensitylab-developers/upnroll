# End-to-End Test Execution Report — Up 'n Roll

**Date:** 2026-11-09  
**Branch:** `suraj`  
**Environment:** local `npm run dev` (Next.js 16.1.6 + MongoDB Atlas via `.env.local`)  
**Evidence pack:** `docs/qa/e2e-evidence-1794233971816.json`  
**Lifecycle driver:** `scripts/e2e-lifecycle-audit.ts` (models + engines; isolated records)  
**Browser:** Cursor IDE browser against `http://localhost:3000`

---

## Executive verdict

The **core visitor → fighter account → registration/payment states → admin tournament → public results/rankings** lifecycle is **implemented and proven with database + UI evidence** for an isolated E2E event.

It is **not** fully production-ready: several product paths remain **NOT IMPLEMENTED** or **BLOCKED**, payment/photo upload was proven on the service/storage path (not full browser file-dialog automation), and Google OAuth / password reset / live SMTP were not available.

---

## Test identities (no secrets)

| Actor | Identifier |
|-------|------------|
| Admin | `admin@upnroll.in` (pre-existing) |
| Fighter A | `e2e.a.1794233342848@test.local` — created via UI register+verify |
| Fighter B | `e2e.b.1794233971816@test.local` — created by lifecycle script |
| Event | `e2e-flow-arena-1794233971816` / id `6af1d67408b79ed0c9b9bd2c` |
| Division | `E2E Lightweight` / id `6af1d67408b79ed0c9b9bd2d` |
| Winner registration | `6af1d67408b79ed0c9b9bd2e` (Fighter A) |
| Final match | `6af1d67508b79ed0c9b9bd4b` COMPLETED SUBMISSION |

---

## Workflow results

### A. Visitor journey — FULLY VERIFIED

| Step | Expected | Actual |
|------|----------|--------|
| Open `/` unauthenticated | Login/Sign up CTAs | PASS — no Dashboard |
| `/events` | Open cards listed | PASS — Phase 3 + Underground + later E2E |
| Event detail | Venue/date/divisions | PASS for E2E event |
| `/fighter/dashboard` no session | Redirect login | PASS → `/login` |
| Public nav / FAQ / rankings routes | Load without 500 | PASS (spot) |

### B. Account creation & authentication — VERIFIED WITH ISSUES

| Step | Result | Notes |
|------|--------|-------|
| Register Fighter A | PASS | UI form → `/verify` |
| Verification code from console email | PASS | Code `135746` in dev server log |
| Login before verify | PASS | Message: confirm email before sign in |
| Verify → session → dashboard | PASS | Welcome, E2E Fighter Alpha |
| Logout / login again | PARTIAL | Logout exercised earlier in admin pass; Fighter A stayed signed in for cross-checks |
| Duplicate email | NOT RETESTED this pass | Covered by unique User.email in model |
| Invalid password rules | PARTIAL | Schema/UI copy verified; not exhaustively UI-submitted |
| Protected routes | PASS | proxy + layouts |
| Wrong-role `/admin` as fighter | PASS | Redirected to `/fighter/dashboard` |
| Password reset | **NOT IMPLEMENTED** | No routes/actions |
| Google OAuth | **BLOCKED** | Missing client credentials → unavailable |
| Session expiry (30d) | **NOT TESTED** | Would need clock/cookie manipulation |
| Hydration Issues badge on register fills | KNOWN | Automation artifact / prior BUG-QA-005/007 |

### C. Fighter onboarding & profile — PARTIALLY VERIFIED

| Step | Result | Notes |
|------|--------|-------|
| Dashboard sections | PASS | Empty then populated after lifecycle |
| Profile completeness via UI form | PARTIAL | Full grappler+photo path driven in script (`ensureFighter`) + prior QA; browser file input not CDP-automated this pass |
| Persistence after refresh | PASS | Registrations/matches survive navigation |
| Private photo authz | PARTIAL | Routes exist; photo keys written to `.local-storage`; admin/fighter GET not re-hit this pass |
| Unauthorized profile edit | CODE-VERIFIED | `updateFighterProfile` asserts FIGHTER + own userId |

### D. Event discovery & registration — FULLY VERIFIED (lifecycle path)

| Step | Result | Notes |
|------|--------|-------|
| Isolated event + division | PASS | Script + public UI listing |
| Two fighters register | PASS | Capacity claim + active unique index |
| Duplicate active registration | CODE-VERIFIED | Partial unique index + ConflictError |
| Closed/DRAFT public hide | CODE-VERIFIED | `PUBLIC_EVENT_STATUSES` excludes DRAFT |
| Appears for fighter | PASS | UI: CONFIRMED on `/fighter/registrations` |
| Appears for admin | PASS | Prior admin portal audit + event exists in DB |

### E. Payment lifecycle — FULLY VERIFIED (DB path) / PARTIAL (UI dialog)

| Step | Result | Notes |
|------|--------|-------|
| Stub `AWAITING_SUBMISSION` + real `PENDING_REVIEW` | PASS | Script |
| Reject then resubmit (Fighter B) | PASS | Seat release + reclaim |
| Approve both | PASS | → `CONFIRMED` |
| Duplicate approve blocked | PASS | Evidence `duplicateApproveBlocked: PASS` |
| Admin screenshot route | CODE-VERIFIED | Admin-only |
| Browser PaymentReviewDialog click | PARTIAL | No PENDING_REVIEW left after script; prior admin queue UI PASS empty/decided rows |
| Real money / bank rails | N/A | Manual UTR+QR model only |

### F. Admin review & management — VERIFIED WITH ISSUES

Prior live admin session (`admin@upnroll.in`) + this lifecycle:

| Area | Result |
|------|--------|
| Dashboard stats / nav | PASS (prior) |
| Fighters list | PASS (prior) |
| Payments queue UI | PASS (prior); approve dialog not re-clicked this run |
| Requests empty | PASS |
| Rankings recalculate | PASS (prior + script v1) |
| Content/media | PASS (prior media create) |
| Event/division/bracket via admin UI forms | PARTIAL — lifecycle used script for isolation speed; admin Events UI verified earlier |

### G. Tournament creation & bracket lifecycle — FULLY VERIFIED (isolated run)

| Step | Result |
|------|--------|
| Create event + division + open registration | PASS |
| Confirm 2 participants | PASS |
| Reject generate with &lt;2 | PASS |
| Generate DRAFT + publish | PASS |
| Record final COMPLETED | PASS |
| Public brackets page | PASS — Final for E2E Lightweight |
| Public results | PASS — Alpha vs Bravo, winner Alpha, SUBMISSION |
| Fighter matches | PASS — COMPLETED Round 1, Mat 1, winner Alpha |
| Rankings board | PASS — Alpha & Bravo links present |
| Regenerate published / unpublish | CODE — blocked by design |
| Concurrent bracket gen | Covered by prior integration tests / hardening commit |
| Multi-round bye ladder | NOT EXERCISED (2-player final only) |

### H. Fighter post-registration — FULLY VERIFIED

Confirmed registration status, completed match with winner method, no unpublished private admin fields on public pages.

### I. Public tournament — FULLY VERIFIED

Event detail, brackets, results, rankings updated after admin/script mutations. DRAFT exclusion verified in code.

### J. Account lifecycle extras

| Item | Classification |
|------|----------------|
| Login/logout/session cookie | VERIFIED WITH ISSUES |
| Role redirects | FULLY VERIFIED |
| Private file routes | CODE-VERIFIED / PARTIAL live |
| Password recovery | NOT IMPLEMENTED |
| Disabled user | Model-only; no admin UI |

---

## Database verification (run `1794233971816`)

| Check | Result |
|-------|--------|
| Event `REGISTRATION_OPEN`, public-visible | PASS |
| 2× `CONFIRMED` registrations in division | PASS |
| Payment decide idempotency | PASS |
| Bracket `PUBLISHED`, 1 match `COMPLETED` | PASS |
| RankingRecord wins/points for winner | PASS (v1, 3 pts) |
| Roles FIGHTER/ADMIN intact | PASS |

---

## Console / network

- Dev email adapter logged verification + welcome for Fighter A.
- ForbiddenError noise when wrong-role Suspense races (known; mitigated by layout redirects).
- Fast Refresh full reloads during long admin walks (dev-only).
- No production secret leakage observed in UI error copy during this pass.

---

## Responsive

Prior QA spot-checked mobile fighter chrome. This E2E pass prioritized lifecycle correctness over a full viewport matrix. Remaining: formal pass at 375/390/768/1366/1920 — **PARTIAL**.

---

## Defects

| ID | Finding | Severity | Disposition |
|----|---------|----------|-------------|
| BUG-QA-007 | AdminNav hydration | Medium | Fixed earlier `29c62e2` |
| BUG-QA-008 | Soft-click admin event cards | Low | Open |
| BUG-QA-004 | Home Shuffle hit target | Medium | Open |
| E2E-GRIDFS | Profile/payment code stores path labels; GridFS `open()` needs `gridfs:` return key | High (prod GridFS) | Open — local disk OK |
| E2E-RANK-AUTO | Rankings not auto-updated on match result | Product gap | Documented (manual recalc) |
| E2E-ORPHAN | Failed first script run left extra CONFIRMED reg on `e2e-flow-arena-1794233938974` | Low | Isolated test data |

No new critical UI-blocker fixed in this commit beyond documentation + lifecycle harness.

---

## Classification summary

| Classification | Workflows |
|----------------|-----------|
| FULLY VERIFIED | Visitor public browse; register+verify; login-before-verify block; wrong-role redirect; isolated tournament lifecycle DB→public results/brackets/rankings; fighter CONFIRMED + match result |
| VERIFIED WITH ISSUES | Auth session longevity/logout completeness; admin UI mutations mixed with script |
| PARTIALLY VERIFIED | Profile/photo UI upload; payment review dialog click; responsive matrix; private file GETs |
| BLOCKED | Google OAuth; live SMTP; real bank/QR imaging (OD-006) |
| NOT IMPLEMENTED | Password reset; event status FSM; auto rankings; champion entity; WhatsApp send; REST CRUD API |

---

## Commits related to this audit stream

| Hash | Note |
|------|------|
| `902a3a1` … `f951b63` | Prior runtime fixes |
| `29c62e2` | Admin/Fighter nav hydrate fix |
| _(this commit)_ | E2E flow map, execution report, evidence, lifecycle script |

---

## Remaining production blockers (honest)

1. Configure and verify Google OAuth + production SMTP if required.
2. Fix GridFS key persistence before `STORAGE_DRIVER=gridfs` in production.
3. Complete browser-driven payment Approve/Reject on a live PENDING_REVIEW row.
4. Resolve Shuffle / soft-nav UX defects.
5. Run `next build && next start` smoke; formal responsive matrix.
6. Confirm OD-004 rankings formula before treating points as official.
