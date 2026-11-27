# 07 — Limitations research

Prioritized from `docs/decisions/open-decisions.md` plus **verified code gaps**. Nothing here is an approved production default.

Priority: **P0** blocks honest “production ready” claims · **P1** product/ops gaps · **P2** deferred / polish.

---

## P0 — Production / integrity blockers

| Item | Evidence | Notes |
|------|----------|-------|
| Hosting / infra / third-party approvals (OD-012) | `open-decisions.md`, `docs/deployment/deployment-guide.md` | Object storage, email provider, auth provider, hosting still owner decisions |
| SMTP delivery unproven | deployment-guide; Phase 6 report | Prod requires SMTP vars but inbox delivery not verified in standing docs |
| Backup ownership + retention (OD-011) | `backup-restore.md`, OD-011 | Payment screenshots PII-adjacent; no client retention window |
| Multi-instance + private files | `STORAGE_DRIVER` + local disk semantics; rate limit in-memory (`backend/http/rateLimit.ts`) | Single-process limiter; local disk fails across instances/ephemeral FS |
| GridFS production readiness | Adapter **exists** (`backend/storage/gridfs.ts`); E2E report flagged key persistence (`E2E-GRIDFS`) | **Owner-confirm** before relying on `STORAGE_DRIVER=gridfs` |
| Occupancy backfill not run | STATUS_UPDATE / Phase 6 | Divisions missing `filledCount` can reject registration mutations |

---

## P1 — Product gaps (open decisions + code)

### From `docs/decisions/open-decisions.md`

| ID | Topic | Status snapshot |
|----|-------|-----------------|
| OD-001 | Combat discipline taxonomy | Open — do not assume MMA-only |
| OD-002 | Weight/age categories | **Resolved** (16 divisions) — keep as reference |
| OD-003 | Formats beyond single-elim | Open for RR / points; Phase 4 shipped single-elim only; client n=3 RR still blocked |
| OD-004 | Ranking methodology | Hybrid decision logged (manual numbering preferred when published); computed `wins * 3` reference-only |
| OD-005 / 005a | Fees + UTR format | Fee amounts open; UTR validator is generic placeholder (`frontend/src/features/payments/schemas.ts`) |
| OD-006 | Real payment QR artwork | Client asset still required |
| OD-007 / OD-008 | Cancel/transfer + refund policy | Admin-reviewed workflow exists; policy windows/fees/refund detail open |
| OD-009 | Email copy | Templates exist; client-approved copy open |
| OD-010 | Content approval process | FAQ/policies workflow process open |
| OD-011 | Data retention | Open |
| OD-012 | Hosting/integrations | Open (see P0) |
| OD-013 | `middleware.ts` → `proxy.ts` | Technical; repo uses `frontend/src/proxy.ts` (cookie presence) — layout auth remains source of truth |
| OD-014 | Brand asset set | Logo/photography approvals |

### Client deferred list (2026-11-14 in open-decisions)

1. Round robin / format picker  
2. Season locks (no Season model; transfer after decided match still allowed)  
3. Made vs Make in India footer mark  
4. Past-record format confirmation (`careerWins` derived from leading number)  
5. Unwanted woman-frame asset mapping before delete  
6. AI rankings placeholders — photo/initials until approved art  

### Verified code gaps

| Gap | Evidence | Priority |
|-----|----------|----------|
| **Ranking strategy still `wins * 3` placeholder in engine tests** | `backend/services/rankingEngine.ts` `winLossPointsStrategy`; test describe cites OD-004 | P1 |
| **Manual rankings not wired to public `/rankings`** | `listPublishedManualRankings()` only in `manualRankingService.ts`; public page uses `cachedRankingBoardEntries()` (`listRankingBoardEntries` from confirmed regs); admin copy claims public prefers manual numbers (`admin/rankings/page.tsx`) | P1 — docs/UI vs code mismatch |
| **Home rankings vs board source split** | `home-live.tsx` → `cachedPublicRankings()` (RankingRecord); `/rankings` → board entries | P1 |
| **No dedicated bracket unpublish** | `bracketService` publish DRAFT→PUBLISHED; regenerate constraints when already PUBLISHED; no `unpublishBracket` API | P1 |
| **Media has no unpublish/update publication API** | `mediaService.ts` create always `PUBLISHED`; list helpers only — no setDraft | P1 |
| **Content can return to DRAFT** | `setContentPublicationState` — contrast with media/brackets | Note: content *has* soft-unpublish |
| **Store / Seminars stubs** | `frontend/src/app/(public)/store/page.tsx`, `seminars/page.tsx` → `<ComingSoon />` | P1 (verified stubs) |
| **Password reset NOT IMPLEMENTED** | E2E report + TEST_MATRIX AUTH-05 | P1 |
| **Google OAuth optional / soft-fail** | `.env.example`; unavailable without credentials | P1 if required |
| **Rankings not auto on every match result** | E2E-RANK-AUTO; admin recalc / outbox | P1 product expectation |
| **Coupon apply lacking rate limit** | BUG-QA-2026-03 / TEST_MATRIX SEC-02 | P1 security polish |
| **Missing public resource may return HTTP 200 with not-found UI** | BUG-QA-2026-01 | P1 SEO |
| **No external error monitoring** | deployment-guide | P1 ops |
| **CSP Report-Only only** | `frontend/next.config.ts` | P1 until nonce/hash strategy |

---

## P2 — Deferred polish / scope exclusions

| Item | Notes |
|------|-------|
| Audit log admin viewer | Index review deferred indexes until UI exists |
| WhatsApp real send | Console helper only (Phase 6 report) |
| REST CRUD product API | E2E “NOT IMPLEMENTED”; App Router + Server Actions primary |
| Event status FSM completeness | Called out in E2E classification |
| Champion entity | Not a separate model; presentation only |
| Live pen-test / adversarial multi-user | Phase 6 known limitation |
| Lighthouse / CWV field program | Not run as standing gate |
| `/ui-preview` in production | Gated; leave disabled |
| Bundle analyzer | Not installed (performance-pass suggestion) |

---

## Ranking / public board — concise truth

1. **Computed:** `recalculateRankings` writes `RankingRecord` using `wins * 3`.  
2. **Manual:** Admin CRUD via `manualRankingService` + admin UI.  
3. **Public `/rankings`:** Confirmed-registration board + record points — **does not call** `listPublishedManualRankings`.  
4. Until wiring + OD-004 client sign-off, treat public points/order as **provisional**.

---

## How to close items

Per open-decisions: explicit client sign-off with date → update this log and `docs/product/scope-matrix.md`. Engineering must not close OD rows by assumption.
