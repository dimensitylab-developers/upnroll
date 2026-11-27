# 07 — Testing research

Agent 7 inventory. **50** `*.test.ts` files found in the tree this pass. Manual matrix rows that this agent did **not** re-execute are marked **Not Tested**.

---

## 1. Automated test inventory (50 files)

Runner: Vitest via `npm test` → `frontend` `vitest run` (`frontend/vitest.config.ts` aliases `@/server/*` → `backend/`, stubs `server-only`).

### Auth / session / HTTP (9)

| File | Area |
|------|------|
| `backend/auth/session.test.ts` | Session auth decision logic |
| `backend/auth/cookies.test.ts` | Cookie pack/unpack |
| `backend/auth/password.test.ts` | Password hashing |
| `backend/auth/actor.test.ts` | Actor helpers |
| `backend/auth/oauth-state.test.ts` | OAuth state |
| `backend/auth/judge-session.scope.test.ts` | Judge session scope |
| `backend/http/rateLimit.test.ts` | Token-bucket limiter |
| `backend/http/errors.test.ts` | Typed HTTP errors |
| `backend/services/authorization.security.test.ts` | Service-level authz |

### Registration / payments / coupons (9)

| File | Area |
|------|------|
| `backend/services/registrationStateMachine.test.ts` | Registration states |
| `backend/services/registrationEligibility.test.ts` | Eligibility rules |
| `backend/services/feeSnapshot.test.ts` | Fee snapshot |
| `backend/services/paymentQueue.test.ts` | Payment queue / UTR |
| `backend/services/couponService.logic.test.ts` | Coupon logic |
| `backend/services/couponConcurrency.test.ts` | Coupon concurrency |
| `frontend/src/features/payments/schemas.test.ts` | Payment Zod schemas |
| `frontend/src/features/payments/file-validation.test.ts` | Upload validation |
| `frontend/src/features/payments/delivery-headers.test.ts` | Delivery headers |

### Brackets / matches / scoring / tournament (7)

| File | Area |
|------|------|
| `backend/services/bracketEngine.test.ts` | Single-elim engine |
| `backend/services/matchService.test.ts` | Match service |
| `backend/services/matchPrivacy.test.ts` | Match privacy |
| `backend/services/scoringService.logic.test.ts` | Scoring logic |
| `backend/services/tournamentRules.test.ts` | Tournament rules |
| `backend/services/publicSchedule.test.ts` | Public schedule |
| `backend/services/import-boundary.test.ts` | No match↔registration import cycle |

### Rankings / requests / dashboard / chatbot / outbox (8)

| File | Area |
|------|------|
| `backend/services/rankingEngine.test.ts` | `wins * 3` strategy (labeled placeholder vs OD-004 in describe) |
| `backend/services/requestService.test.ts` | Cancel/transfer requests |
| `backend/services/teammateTransfer.test.ts` | Teammate transfer |
| `backend/services/dashboardService.parsePastRecord.test.ts` | Past-record parse |
| `backend/services/chatbotEngine.test.ts` | FAQ keyword chatbot |
| `backend/services/outboxRecovery.test.ts` | Outbox recovery |
| `backend/services/profilePhoto.test.ts` | Profile photo rules |
| `backend/services/eventPaymentQr-storage.test.ts` | Event payment QR storage |

### Storage / email / DB / validation (11)

| File | Area |
|------|------|
| `backend/storage/factory.test.ts` | `STORAGE_DRIVER` selection |
| `backend/storage/gridfs.test.ts` | GridFS adapter |
| `backend/storage/local-disk.test.ts` | Local disk adapter |
| `backend/storage/keys.test.ts` | Storage key safety |
| `backend/email/smtp.test.ts` | SMTP adapter |
| `backend/email/smtp-config.test.ts` | SMTP config / prod guard |
| `backend/email/templates/tournament-confirmed.test.ts` | Email template |
| `backend/db/transactions.integration.test.ts` | Real-txn integration (isolated DB) |
| `backend/validation/objectId.test.ts` | ObjectId validation |
| `backend/content/starterFaqs.test.ts` | Starter FAQs |
| `frontend/src/lib/mongo-uri.test.ts` | Mongo URI helper |

### Frontend feature / UI data (6)

| File | Area |
|------|------|
| `frontend/src/features/auth/schemas.test.ts` | Auth schemas |
| `frontend/src/features/fighters/weight-bands.test.ts` | Weight bands |
| `frontend/src/features/fighters/grappler-schema.past-record.test.ts` | Past-record schema |
| `frontend/src/features/rankings/seeding.test.ts` | Rankings seeding helpers |
| `frontend/src/components/home/home-faq-data.test.ts` | Homepage FAQ strip |
| `frontend/src/lib/safe-app-path.test.ts` | Safe path helper |

**Total files:** 50 (glob `**/*.test.ts` under `d:\upnrol`).

Historical counts in docs (e.g. “43 files / 218 tests”, “27 files / 156 tests”) are **snapshots** — re-run `npm test` for current totals.

---

## 2. Feature testing matrix (manual / UAT)

Statuses for **this handover research pass**: automated rows that rely on Vitest stay as documented; **browser/manual rows not re-executed here → Not Tested**.

| ID / area | Scenario | Automated evidence | Manual / browser (this pass) |
|-----------|----------|--------------------|------------------------------|
| PUB home/events/FAQ | Public pages load | — | **Not Tested** |
| AUTH login/register/verify | Credential flows | schemas + session tests | **Not Tested** |
| AUTH password reset | Reset flow | — | **Not Tested** (also **NOT IMPLEMENTED** per QA docs) |
| AUTH Google OAuth | OAuth | oauth-state unit | **Not Tested** / typically BLOCKED without creds |
| Grappler registration + coupon UI | Register + coupon | coupon logic/concurrency tests | **Not Tested** |
| Payments submit / admin approve | Manual verify | paymentQueue + security | **Not Tested** |
| Brackets generate/publish | Admin tournament | bracketEngine tests | **Not Tested** |
| Judge login + score finalize | Judge console | judge-session + scoring logic | **Not Tested** |
| Rankings public board | `/rankings` | rankingEngine unit | **Not Tested** |
| Requests cancel/transfer | Admin review | requestService tests | **Not Tested** |
| Email real SMTP delivery | Inbox delivery | smtp unit/config | **Not Tested** |
| Store / Seminars | Commerce | ComingSoon pages | **Not Tested** (stubs only) |
| Responsive 360–1440 | Layout | — | **Not Tested** |
| Perf cold prod timings | `next start` | — | **Not Tested** |

Source templates for future execution: `docs/qa/TEST_MATRIX.md`, `docs/qa/CLIENT_UAT_CHECKLIST.md`.

Prior matrix (2026-11-12) reported PASS/FAIL/BLOCKED counts — treat as **historical lab evidence**, not current sign-off.

---

## 3. Phase 6 / E2E claims (historical evidence — caveat)

| Source | Claim | Caveat |
|--------|-------|--------|
| `docs/phases/06-production-hardening.md` | Live service flow **19/19** assertions; browser UI pass **20/20**; axe 0 violations after fixes | Temporary verify scripts deleted; DB cleaned; **not re-run by Agent 7** |
| `docs/qa/END_TO_END_TEST_EXECUTION_REPORT.md` (2026-11-09) | Visitor → fighter → payment states → admin tournament → public results lifecycle proven on local Atlas | Branch/env of that date; GridFS/SMTP/OAuth still open; evidence JSON may age |
| `docs/qa/TEST_MATRIX.md` E2E-01 | Vitest suite PASS (43/218 at time) | Count drifted; re-run |
| Same E2E-02 | Client coupon→score lifecycle test **removed** | BLOCKED / not retained |

**Caveat for handover:** treat Phase 6 / E2E docs as **historical confidence**, not a substitute for a fresh `npm test` + staging smoke before go-live.

---

## 4. Build / verification commands

From repo root (or as noted):

```bash
# Install (once)
npm install --prefix frontend

# Typecheck (CI equivalent)
cd frontend && npx tsc --noEmit --pretty false

# Unit + integration tests (Atlas needed for transactions.integration.test)
npm test
# or: cd frontend && npx vitest run
# Single file: cd frontend && npx vitest run ../backend/services/bracketEngine.test.ts
# By name:    cd frontend && npx vitest run -t "some test name"

# Production build (CI sets dummy Mongo/session)
cd frontend
# optional for local build without CI short-circuit quirks:
set MONGODB_URI=mongodb://127.0.0.1:27017/upnroll
set SESSION_SECRET=ci-session-secret-must-be-32-characters
npm run build

# Serve production build
npm run start   # from root or frontend

# Lint
npm run lint
```

CI reference: `.github/workflows/ci.yml` (Node 22, `npm ci`, ensure-root-modules, tsc, test, build).

Health smoke (when server up): `GET /api/health` → `{ ok: true|false }` — **Not Tested** this pass.

---

## 5. Gaps relative to product QA

- No Playwright/Cypress suite retained in-repo as a standing E2E job (Phase 6 browser work was ad hoc / deleted scripts).
- Coupon apply rate-limit gap flagged in TEST_MATRIX (BUG-QA-2026-03) — code-inspection finding; **Not Tested** adversarially here.
- Missing-event HTTP status (BUG-QA-2026-01) — historical FAIL; **Not Tested** re-check.
