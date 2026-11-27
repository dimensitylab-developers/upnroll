# Up 'n Roll — Testing Report

| Field | Value |
|-------|-------|
| Prepared by | **Dimensity Labs** |
| Document version | **v1.0.0** |
| Date | **2026-11-27** |
| Git commit | **`4ffb794`** |
| Audience | QA, developers, technical owners |

**Evidence rules (handover)**

- **Passed** — only when this pack cites current automated or manual evidence for this commit/pass.  
- **Not Tested** — scenario not re-executed for this handover research pass.  
- Historical Phase 6 / E2E reports are **confidence only**, not current sign-off.  
- Never mark a feature **Passed** without evidence.

---

## 1. Summary

| Category | Finding |
|----------|---------|
| Automated test files in tree | **50** `*.test.ts` files (**Verified** inventory) |
| Runner | Vitest via `npm test` → `frontend` `vitest run` |
| Manual / browser UAT this pass | **Not Tested** (not re-executed) |
| Standing Playwright/Cypress job | **Not present** in-repo |
| Historical E2E / Phase 6 | Documented earlier; treat as historical |

Re-run before go-live:

```bash
npm install --prefix frontend
cd frontend && npx tsc --noEmit --pretty false
npm test
npm run build --prefix frontend
```

---

## 2. Feature-level testing matrix

Statuses below reflect **this handover research pass**. Automated unit/integration coverage exists where noted; browser/manual rows that were **not re-executed** are **Not Tested**. Automated rows are **not** marked Passed here unless a fresh `npm test` run for this pack is recorded (it was not).

| ID / area | Scenario | Automated coverage in repo | Manual / browser (this pass) | Overall for handover |
|-----------|----------|----------------------------|------------------------------|----------------------|
| PUB-01 | Public home / events / FAQ pages load | — | **Not Tested** | **Not Tested** |
| AUTH-01 | Login / register / verify credential flows | Auth schemas + session unit tests | **Not Tested** | **Not Tested** |
| AUTH-02 | Password reset | — (also **not implemented** per QA docs) | **Not Tested** | **Not Tested** / N/A |
| AUTH-03 | Google OAuth | OAuth state unit tests | **Not Tested** (often blocked without creds) | **Not Tested** |
| REG-01 | Grappler registration + coupon UI | Coupon logic / concurrency tests | **Not Tested** | **Not Tested** |
| PAY-01 | Payment submit / admin approve (UTR + screenshot) | Payment queue + security tests | **Not Tested** | **Not Tested** |
| BRK-01 | Bracket generate / publish | Bracket engine tests | **Not Tested** | **Not Tested** |
| JUD-01 | Judge login + score finalize | Judge session + scoring logic tests | **Not Tested** | **Not Tested** |
| RNK-01 | Public rankings board (`/rankings`) | Ranking engine unit tests | **Not Tested** | **Not Tested** |
| REQ-01 | Cancel / transfer request admin review | Request service tests | **Not Tested** | **Not Tested** |
| MAIL-01 | Real SMTP inbox delivery | SMTP unit / config tests | **Not Tested** | **Not Tested** |
| COM-01 | Store / Seminars | ComingSoon stubs only | **Not Tested** | **Not Tested** |
| UX-01 | Responsive 360–1440 | — | **Not Tested** | **Not Tested** |
| PERF-01 | Cold production timings (`next start`) | — | **Not Tested** | **Not Tested** |
| HLTH-01 | `GET /api/health` | Route exists in app | **Not Tested** | **Not Tested** |
| AUTO-01 | Full Vitest suite at this commit | 50 test files in tree | Suite **not re-run** for this pack | **Not Tested** |

Future execution templates: `docs/qa/TEST_MATRIX.md`, `docs/qa/CLIENT_UAT_CHECKLIST.md`.

Prior matrix dated **2026-11-12** (PASS/FAIL/BLOCKED counts) is **historical lab evidence**, not current sign-off.

---

## 3. Automated test areas (50)

Runner aliases (**Verified** `frontend/vitest.config.ts`): `@/server/*` → `backend/`, `@/*` → `frontend/src/*`, `server-only` stubbed.

### 3.1 Auth / session / HTTP (9)

| # | File | Area |
|---|------|------|
| 1 | `backend/auth/session.test.ts` | Session auth decision logic |
| 2 | `backend/auth/cookies.test.ts` | Cookie pack/unpack |
| 3 | `backend/auth/password.test.ts` | Password hashing |
| 4 | `backend/auth/actor.test.ts` | Actor helpers |
| 5 | `backend/auth/oauth-state.test.ts` | OAuth state |
| 6 | `backend/auth/judge-session.scope.test.ts` | Judge session scope |
| 7 | `backend/http/rateLimit.test.ts` | Token-bucket limiter |
| 8 | `backend/http/errors.test.ts` | Typed HTTP errors |
| 9 | `backend/services/authorization.security.test.ts` | Service-level authorization |

### 3.2 Registration / payments / coupons (9)

| # | File | Area |
|---|------|------|
| 10 | `backend/services/registrationStateMachine.test.ts` | Registration states |
| 11 | `backend/services/registrationEligibility.test.ts` | Eligibility rules |
| 12 | `backend/services/feeSnapshot.test.ts` | Fee snapshot |
| 13 | `backend/services/paymentQueue.test.ts` | Payment queue / UTR |
| 14 | `backend/services/couponService.logic.test.ts` | Coupon logic |
| 15 | `backend/services/couponConcurrency.test.ts` | Coupon concurrency |
| 16 | `frontend/src/features/payments/schemas.test.ts` | Payment Zod schemas |
| 17 | `frontend/src/features/payments/file-validation.test.ts` | Upload validation |
| 18 | `frontend/src/features/payments/delivery-headers.test.ts` | Delivery headers |

### 3.3 Brackets / matches / scoring / tournament (7)

| # | File | Area |
|---|------|------|
| 19 | `backend/services/bracketEngine.test.ts` | Single-elimination engine |
| 20 | `backend/services/matchService.test.ts` | Match service |
| 21 | `backend/services/matchPrivacy.test.ts` | Match privacy |
| 22 | `backend/services/scoringService.logic.test.ts` | Scoring logic |
| 23 | `backend/services/tournamentRules.test.ts` | Tournament rules |
| 24 | `backend/services/publicSchedule.test.ts` | Public schedule |
| 25 | `backend/services/import-boundary.test.ts` | No match↔registration import cycle |

### 3.4 Rankings / requests / dashboard / chatbot / outbox (8)

| # | File | Area |
|---|------|------|
| 26 | `backend/services/rankingEngine.test.ts` | `wins * 3` strategy (placeholder vs OD-004 noted in describe) |
| 27 | `backend/services/requestService.test.ts` | Cancel / transfer requests |
| 28 | `backend/services/teammateTransfer.test.ts` | Teammate transfer |
| 29 | `backend/services/dashboardService.parsePastRecord.test.ts` | Past-record parse |
| 30 | `backend/services/chatbotEngine.test.ts` | FAQ keyword chatbot |
| 31 | `backend/services/outboxRecovery.test.ts` | Outbox recovery |
| 32 | `backend/services/profilePhoto.test.ts` | Profile photo rules |
| 33 | `backend/services/eventPaymentQr-storage.test.ts` | Event payment QR storage |

### 3.5 Storage / email / DB / validation (11)

| # | File | Area |
|---|------|------|
| 34 | `backend/storage/factory.test.ts` | `STORAGE_DRIVER` selection |
| 35 | `backend/storage/gridfs.test.ts` | GridFS adapter |
| 36 | `backend/storage/local-disk.test.ts` | Local disk adapter |
| 37 | `backend/storage/keys.test.ts` | Storage key safety |
| 38 | `backend/email/smtp.test.ts` | SMTP adapter |
| 39 | `backend/email/smtp-config.test.ts` | SMTP config / production guard |
| 40 | `backend/email/templates/tournament-confirmed.test.ts` | Email template |
| 41 | `backend/db/transactions.integration.test.ts` | Real-transaction integration (isolated DB) |
| 42 | `backend/validation/objectId.test.ts` | ObjectId validation |
| 43 | `backend/content/starterFaqs.test.ts` | Starter FAQs |
| 44 | `frontend/src/lib/mongo-uri.test.ts` | Mongo URI helper |

### 3.6 Frontend feature / UI data (6)

| # | File | Area |
|---|------|------|
| 45 | `frontend/src/features/auth/schemas.test.ts` | Auth schemas |
| 46 | `frontend/src/features/fighters/weight-bands.test.ts` | Weight bands |
| 47 | `frontend/src/features/fighters/grappler-schema.past-record.test.ts` | Past-record schema |
| 48 | `frontend/src/features/rankings/seeding.test.ts` | Rankings seeding helpers |
| 49 | `frontend/src/components/home/home-faq-data.test.ts` | Homepage FAQ strip |
| 50 | `frontend/src/lib/safe-app-path.test.ts` | Safe path helper |

**Total: 50 test areas / files.**

Historical doc counts (e.g. “43 files / 218 tests”) are **snapshots** — re-run `npm test` for current pass/fail totals. Transaction integration tests expect an isolated DB (e.g. `upnrol_txn_test`); do not point them at production.

---

## 4. Build and verification commands

```bash
# Install (once)
npm install --prefix frontend

# Typecheck (CI equivalent)
cd frontend && npx tsc --noEmit --pretty false

# Unit + integration tests
npm test
# or: cd frontend && npx vitest run
# Single file: cd frontend && npx vitest run ../backend/services/bracketEngine.test.ts
# By name:    cd frontend && npx vitest run -t "some test name"

# Production build (CI sets dummy Mongo/session)
cd frontend
# Windows PowerShell example for local build:
$env:MONGODB_URI="mongodb://127.0.0.1:27017/upnroll"
$env:SESSION_SECRET="ci-session-secret-must-be-32-characters"
npm run build

# Serve production build
npm run start   # from root or frontend

# Lint
npm run lint
```

CI reference: `.github/workflows/ci.yml` (Node 22, `npm ci`, ensure-root-modules, tsc, test, build).

Health smoke (when server is up): `GET /api/health` → `{ ok: true|false }` — **Not Tested** this pass.

---

## 5. Historical evidence (not current sign-off)

| Source | Claim | Caveat |
|--------|-------|--------|
| `docs/phases/06-production-hardening.md` | Live service flow 19/19; browser UI 20/20; axe 0 after fixes | Temporary scripts deleted; DB cleaned; **not re-run** for this pack |
| `docs/qa/END_TO_END_TEST_EXECUTION_REPORT.md` (2026-11-09) | Visitor → fighter → payment → admin tournament → public results on local Atlas | Branch/env of that date; GridFS/SMTP/OAuth still open |
| `docs/qa/TEST_MATRIX.md` E2E-01 | Vitest suite PASS (43/218 at time) | Count drifted; re-run |
| Same E2E-02 | Client coupon→score lifecycle test **removed** | BLOCKED / not retained |

Treat Phase 6 / E2E docs as **historical confidence**, not a substitute for a fresh `npm test` + staging smoke before go-live.

---

## 6. Known QA gaps

| Gap | Notes | Status |
|-----|-------|--------|
| No standing Playwright/Cypress E2E job | Phase 6 browser work was ad hoc / deleted | **Verified** (absence) |
| Coupon apply rate-limit (BUG-QA-2026-03) | Code-inspection finding in TEST_MATRIX | **Not Tested** adversarially |
| Missing-event HTTP status (BUG-QA-2026-01) | Historical FAIL | **Not Tested** re-check |
| Password reset | Not implemented | N/A until built |
| Real SMTP delivery | Unit coverage only | **Not Tested** |
| Public rankings vs manual rankings wiring | Product/code mismatch called out in limitations research | **Not Tested** as UAT |

---

## 7. Recommended go-live verification (owner)

1. Run `npm test` and record pass counts + commit SHA.  
2. Staging smoke: register → pay (UTR) → admin approve → bracket → score → public results.  
3. Confirm SMTP inbox delivery with production-like credentials.  
4. Confirm storage (`gridfs` or `local`) upload/download round-trip.  
5. Execute client UAT checklist (`docs/qa/CLIENT_UAT_CHECKLIST.md`).  
6. Sign off in [UpnRoll_Handover_Checklist.md](./UpnRoll_Handover_Checklist.md).

---

*End of Testing Report — Dimensity Labs · v1.0.0 · 2026-11-27 · `4ffb794`*
