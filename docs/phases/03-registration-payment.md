# Phase 3 — Registration and Manual Payment

Date: 2026-11-01. Scope: event/division registration, the full Part E manual QR-payment flow (submission → admin review → approve/reject → resubmission), private screenshot storage with authorized admin viewing, duplicate-UTR flagging, audit logging, and acknowledgement/decision emails via the Phase 2 dev email adapter.

## Phase summary

A fighter can now browse open divisions, register, see the (placeholder) QR payment screen with the real fee pulled from the database, submit a UTR + screenshot, and track their registration status. An admin can see every payment submission in one queue, spot duplicate UTRs, view the actual uploaded screenshot (through an authorized-only route, never a public URL), and approve or reject with an idempotent, audited decision. Rejection requires a reason and lets the fighter resubmit. This is the first phase where real business data flows end to end through the system built in Phase 2.

Scope boundary held per the approved plan: no admin event-creation UI (Phase 4), no bracket/match work (Phase 4), no cancellation/transfer requests (Phase 5), no real object storage or email provider (OD-012 still open).

## Actual files changed

**Models**: `src/server/models/{Event,Division,Registration,PaymentSubmission}.ts`
**Pure logic**: `src/server/services/registrationStateMachine.ts`, `src/server/services/paymentQueue.ts`, `src/features/payments/file-validation.ts`
**Services**: `src/server/services/{registrationService,paymentService}.ts`
**Storage**: `src/server/storage/{types,local-disk}.ts` (extended with `get()` to actually serve bytes back)
**Validation**: `src/features/registrations/schemas.ts`, `src/features/payments/schemas.ts`
**Actions**: `src/features/registrations/actions.ts`, `src/features/payments/actions.ts`, `src/features/admin-payments/actions.ts`
**Forms**: `src/features/registrations/new-registration-form.tsx`, `src/features/payments/payment-form.tsx`, `src/features/admin-payments/payment-review-dialog.tsx`
**Routes**: `src/app/(fighter)/fighter/registrations/{page,new/page}.tsx`, `src/app/(fighter)/fighter/registrations/[id]/payment/page.tsx`, `src/app/(admin)/admin/payments/page.tsx`, `src/app/api/v1/admin/payments/[id]/screenshot/route.ts`
**Scripts**: `scripts/seed-demo.ts`
**Tests**: `src/server/services/registrationStateMachine.test.ts`, `src/server/services/paymentQueue.test.ts`, `src/features/payments/{file-validation,schemas}.test.ts`
**Docs**: `docs/architecture/system-overview.md` (state diagram corrected to match the real implementation), `docs/product/scope-matrix.md`, `docs/decisions/open-decisions.md` (new OD-005a)

## Architectural decisions

- **Append-only `PaymentSubmission` per registration** rather than mutating one record — each submit/resubmit creates a new document, giving full revision history for free (Part E requirement) without a separate history array.
- **Registration.status is denormalized from the latest PaymentSubmission**, kept in sync by the service layer in the same call (not by the DB) — matches Part E's "keep payment status separate... but consistent" and the data-model doc's existing design.
- **Idempotent approve/reject**: `findOneAndUpdate` filtered on `status: 'PENDING_REVIEW'` — a second approval attempt (double-click, or a race between two admins) matches zero documents and returns `ConflictError`, never double-applies.
- **Never trust client-supplied amounts**: `expectedAmountMinorUnits` is always read server-side from `Division`/`Event`, never accepted as form input.
- **Duplicate-UTR flagging is a pure function** (`flagDuplicateUtrs`) applied over the full submission set — flags, never auto-blocks, per Part E.
- **One real Route Handler** (`GET /api/v1/admin/payments/[id]/screenshot`) — the one case in this phase where a Server Action doesn't fit (binary image response to a browser `<img>` tag). `requireRole("ADMIN")` re-checked inside the handler itself, not assumed from the admin layout alone.
- **State diagram correction**: the Phase 0-era diagram modeled resubmission as two arrows (`Rejected → AwaitingPayment → PendingVerification`); the real one-step resubmit action collapses that to `Rejected → PendingVerification` directly. Updated `docs/architecture/system-overview.md` to match the actual code rather than leave the docs stale.

## Functional verification

- `npm run lint` — clean.
- `npm run test` — **50/50 passing** (30 new this phase: registration/payment state-machine guards including idempotency and duplicate-prevention logic, duplicate-UTR flagging, screenshot file-type/size validation, UTR format validation — all previous Phase 2 tests still pass unchanged).
- `npm run build` — passes. New routes confirmed in the route table: `/admin/payments`, `/api/v1/admin/payments/[id]/screenshot`, `/fighter/registrations`, `/fighter/registrations/new`, `/fighter/registrations/[id]/payment` all compile and are correctly dynamic (session/DB-dependent); `/`, `/login`, `/register`, `/ui-preview` remain static.
- `scripts/seed-demo.ts` smoke-tested identically to Phase 2's `create-admin.ts`: fails fast with the exact missing-env-var error with no config, reaches `mongoose.connect()` and times out with valid config but no reachable database — proves the code path, not live data.

## Known limitations (stated plainly)

- **No live database was available in this environment** (same constraint as Phase 2 — Docker installed, daemon not running). I also attempted `mongodb-memory-server` for a real in-memory integration test; its postinstall script (which downloads a real `mongod` binary) was blocked by the harness's untrusted-postinstall-script policy, and I did not attempt to work around that — it's a reasonable boundary. The full register → pay → admin-approve flow is therefore verified at the service/unit-test level (state transitions, idempotency guards, duplicate detection, file validation) but **not as a running end-to-end test against a real MongoDB**. This remains the top item to verify live once a database is reachable.
- The admin payment queue has no pagination or status filter UI yet (service function `listPaymentQueue` accepts a status filter, just not wired to a UI control) — acceptable for the current data volume, worth revisiting once real registrations exist.
- Capacity checking in `registrationService.createRegistration` uses a read-then-write count check, not a DB-level atomic guard — fine for now (expected concurrency is low at this stage) but should become a proper atomic/transactional check before real traffic; noted here rather than silently left as a hidden gap.
- UTR format validation (OD-005a, new this phase) is a conservative placeholder pending the client's actual bank/UPI reference format.

## Requirement status

REG-001, REG-002, PAY-001, PAY-002, PAY-003 move from "foundation" to "built" in `docs/product/scope-matrix.md` (see updated rows). NOT-001 now has a real (dev-logged) delivery path.

## Next phase dependencies

- A reachable MongoDB to run the full flow live — same ask carried from Phase 2, now more urgent since there's an actual business flow to validate.
- OD-012 (storage/email providers) before payment screenshots and notifications can move off dev adapters.
- OD-001/002/003 (disciplines, weight classes, bracket format) before Phase 4's bracket/match work can begin — Phase 3's `Division` model intentionally stayed generic (`discipline: string`, no weight-class taxonomy) to avoid encoding an unapproved assumption.
