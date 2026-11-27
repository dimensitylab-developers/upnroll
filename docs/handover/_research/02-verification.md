# Verification: payments, registrations, and email `/verify`

This note separates three different “verify” concepts in Up 'n Roll. Only the first is an admin ops workflow.

---

## 1. Payment / registration verification (admin desk)

### What it is

Manual review of fighter-submitted payment proofs (UTR + screenshot). Approval confirms a registration for brackets; rejection returns the fighter to a resubmittable state.

### Who can do it

- **Admin only** (`requireActor("ADMIN")` / `assertAdmin`).
- User roles are `ADMIN` | `GRAPPLER` (legacy `FIGHTER` → `GRAPPLER`).
- **There is no VERIFIER role**, no payment-reviewer ACL, and no non-admin staff path to the queue.

### Where

- UI: `/admin/payments` (also pending strip on `/admin` dashboard).
- Actions: `frontend/src/features/admin-payments/actions.ts` → `approvePayment` / `rejectPayment` in `backend/services/paymentService.ts`.
- Screenshot: `/api/v1/admin/payments/[id]/screenshot` (admin session).

### Registration ↔ payment state machine

From `registrationStateMachine.ts` + `paymentService.ts`:

| Stage | Registration status | PaymentSubmission status | Notes |
| --- | --- | --- | --- |
| After register (typical) | `AWAITING_PAYMENT` | often none / awaiting | Fighter may submit payment |
| After submit | `PENDING_VERIFICATION` | `PENDING_REVIEW` | Seat counted as active |
| Admin approve | `CONFIRMED` | `APPROVED` | Bracket-eligible (`listEligibleParticipants` uses CONFIRMED) |
| Admin reject | `REJECTED` | `REJECTED` | Fighter can resubmit (`canSubmitPayment` allows REJECTED) |
| Cancel / admin withdraw | `CANCELLED` | (unchanged) | Seat released |

Active (capacity-holding) statuses: `AWAITING_PAYMENT`, `PENDING_VERIFICATION`, `CONFIRMED`.

### Ops steps

1. Grappler pays offline (UPI/bank) using event QR / coupon tier.
2. Grappler submits UTR + screenshot from grappler portal → `submitPayment` creates `PENDING_REVIEW`, sets registration `PENDING_VERIFICATION`, emails “received, not yet confirmed”.
3. Admin opens `/admin/payments` → filters if needed → **Review**.
4. Admin checks screenshot against bank/UPI and UTR (duplicate UTR shows warning badge only).
5. **Approve** → registration `CONFIRMED`, email tournament confirmed; **or Reject** with required reason → registration `REJECTED`, email to resubmit.

### Validation / guards

- Decide only while submission is `PENDING_REVIEW` (`canDecidePayment`); otherwise conflict “already been reviewed”.
- Reject requires non-empty note.
- Approve note optional.
- Fee amount on submission is server-derived (registration `feeSnapshot` preferred over live event fee).

### Limits

- Queue listing capped at **200** rows.
- Duplicate UTR is **advisory**, not an automatic block.
- Decision commits even if decision email fails (logged, not rolled back).
- Coupons/fees are configured under event **Fees & coupons**, not on the verification page.

---

## 2. What “verification” is *not* (admin)

| Term in UI / code | Meaning |
| --- | --- |
| Payment “Pending review” | Awaiting **admin** approve/reject |
| Registration `PENDING_VERIFICATION` | Same pipeline — waiting on payment decision |
| Dashboard “Entries today / Logins / verify” | Wording on desk cards; presence uses **login audits**, not email-confirm counts |
| Judge credentials | Separate mat-official auth for scoring — not payment verification |

There is no second human role that can approve payments without being `ADMIN`.

---

## 3. Email confirmation at `/verify` (auth — not admin payment review)

### What it is

Account email confirmation after password signup: user enters a one-time code so `User.emailVerified` becomes true.

### Where

- Public auth page: `/verify?email=…&from=…` (`frontend/src/app/(auth)/verify/page.tsx`).
- Actions: `verifyEmailAction` / `resendCodeAction` in `frontend/src/features/auth/actions.ts`.
- Mail/helpers: `backend/services/verificationMail.ts`.

### Permissions

- Unauthenticated / newly registered grappler flow.
- **Not** an admin capability and **not** related to payment UTR review.
- Login blocks unverified password users (`emailVerified === false` redirects toward verify).
- Google OAuth path sets `emailVerified: true` at account link/create.

### Distinction (handover one-liner)

**`/admin/payments` = money/registration confirmation by ADMIN. `/verify` = email ownership confirmation for account login. Do not conflate them.**

---

## 4. Related but separate: request “review”

`/admin/requests` reviews **CANCELLATION** / **TRANSFER** requests (also ADMIN-only). That is a different decision queue from payment verification, though both appear under “Needs attention” on the desk.
