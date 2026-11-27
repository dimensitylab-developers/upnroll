# 05 — Business rules

Each rule: purpose, inputs, logic, outputs, edge cases, source file(s).

---

## 1. Eligibility (gender / belt / profile)

**Purpose:** Gate division registration to matching gender and experience (belt) when taxonomy fields are set.

**Inputs:** Division `{ gender?, experienceLevel? }`; GrapplerProfile `{ gender?, beltRank? }` (form gender `"Male"`/`"Female"` → `MALE`/`FEMALE`).

**Logic (`assertDivisionEligibility`):**
- If division has neither MALE/FEMALE nor BEGINNER/INTERMEDIATE → no-op.
- Else profile required; else ValidationError “Complete your grappler profile…”.
- Gender gate: profile must map to same gender.
- Belt gate: BEGINNER → belt `White` only; INTERMEDIATE → `Blue` or `Purple` only.

**Outputs:** void or ValidationError.

**Edge cases:** Empty division taxonomy → open to all; missing profile gender → “Select Male or Female…”; wrong belt → beginner/intermediate messages.

**Also enforced on:** teammate transfer claim.

**Sources:** `backend/services/registrationEligibility.ts`; callers `registrationService.createRegistration`, `teammateTransfer.claimTeammateTransfer`.

---

## 2. Weight / division taxonomy

**Purpose:** Define Road to Super Fight weight × gender × experience grid and display names; seed event divisions.

**Inputs:** Gender `MALE|FEMALE`; experience `BEGINNER|INTERMEDIATE`; weight bands:
- Women: `-55`, `55-65`, `+65` (kg bounds null/55, 55/65, 65/null)
- Men: `-55`, `55-65`, `65-75`, `75-85`, `+85`

**Logic:** `roadToSuperFightDivisionSeeds()` cartesian product of bands × experiences → division name like `Men 65-75 kg · Intermediate`, discipline `No-Gi`. `EVENT_POINTS_RULES` holds public copy (match format, scoring sheet text). `defaultNoGiScoringRules()` seeds event scoring config.

**Outputs:** TaxonomySeed[]; display helpers; published rules copy.

**Edge cases:** `weightMinKg`/`weightMaxKg` stored on Division but **not validated against athlete body weight at registration** — selection is by choosing the division, not by scale check in code. Capacity/occupancy separate.

**Sources:** `backend/services/divisionTaxonomy.ts`; seeding via `eventService` + `seedRoadToSuperFightDivisionsAction`.

---

## 3. Registration restrictions & duplicates

**Purpose:** Control when a grappler may take a seat; prevent double-booking a division.

**Inputs:** Actor (GRAPPLER), `divisionId`, consents, optional coupon; event clocks; existing registrations; `Division.filledCount`/`capacity`.

**Logic (`createRegistration`):**
1. Both consent + agreement required.
2. Event must be `REGISTRATION_OPEN` and `now` within `[registrationOpensAt, registrationClosesAt]`.
3. Active registration (AWAITING_PAYMENT | PENDING_VERIFICATION | CONFIRMED) for same user+division → ConflictError (also partial unique index).
4. Eligibility assert (above).
5. Fee from default payment option (or client-suggested active option if no coupon); division `feeMinorUnitsOverride` wins if set. Client amount must match or ValidationError.
6. `claimSeat` increments `filledCount` atomically if `< capacity` and counter is a number.
7. Create Registration `AWAITING_PAYMENT` + feeSnapshot + PaymentSubmission `AWAITING_SUBMISSION`.
8. Optional coupon redeem in same transaction.

**Form-layer extras (`createRegistrationAction`):** full grappler schema; Aadhaar image required; if age &lt; 18 parental consent image + checkbox; waiver timestamp.

**Outputs:** `{ registration, paymentSubmission }` or errors.

**Edge cases:** Missing `filledCount` → ValidationError (run occupancy backfill); duplicate key race → ConflictError; rejected registration is not “active” so re-register allowed; admin `withdrawRegistration` cancels active seat.

**Sources:** `registrationService.ts`, `registrationStateMachine.ts`, `divisionOccupancy.ts`, `frontend/src/features/registrations/actions.ts`, `fighters/grappler-schema.ts`.

---

## 4. Occupancy (capacity)

**Purpose:** Keep `filledCount` consistent with active registrations.

**Inputs:** `divisionId`, Mongo session.

**Logic:**
- `claimSeat`: `findOneAndUpdate` where `filledCount` is number and `$lt capacity`, `$inc: 1`. Else load division → if counter missing throw; else “at capacity”.
- `releaseSeat`: `$inc: -1` where `filledCount > 0`; else error if counter invalid/zero.

**Outputs:** Updated Division or Conflict/ValidationError.

**Called on:** registration create; payment reject/approve transitions that change active-ness; cancellation approve; transfer approve; admin withdraw; payment resubmit from inactive.

**Source:** `backend/services/divisionOccupancy.ts`.

---

## 5. Payment transitions

**Purpose:** Manual UTR/screenshot review driving registration status.

**State machine (`registrationStateMachine.ts`):**
| Guard | Rule |
|---|---|
| `canSubmitPayment` | Registration ∈ `{ AWAITING_PAYMENT, REJECTED }` |
| `canDecidePayment` | Submission status `PENDING_REVIEW` |
| New submission | Registration → `PENDING_VERIFICATION` |
| Approve | Registration → `CONFIRMED` |
| Reject | Registration → `REJECTED` (note required) |

**Submit (`submitPayment`):**
- Owner-only; validate screenshot mime/size; amount from feeSnapshot (fallback division/event).
- Store screenshot; create new PaymentSubmission PENDING_REVIEW; if prior status not active, reclaim seat.
- Email “received, not yet confirmed”.

**Decide:** Conditional update PENDING_REVIEW → APPROVED/REJECTED; adjust seats; email confirm/reject.

**Duplicate UTRs:** `flagDuplicateUtrs` marks queue rows when same non-empty UTR appears &gt;1 time — **flag only, never auto-block**.

**Outputs:** PaymentSubmission docs; registration statusHistory entries.

**Edge cases:** Double-decide → ConflictError; storage put then TX fail → delete screenshot; later fee edits do not change snapshot amount.

**Sources:** `paymentService.ts`, `registrationStateMachine.ts`, `paymentQueue.ts`.

---

## 6. Coupons

**Purpose:** Bind a registration to an alternate payment option via single-use codes with short hold.

**Inputs:** Admin create: eventId, paymentOptionId, optional code/expires/intendedUser. Fighter: code + reservationIntentId (8–64 chars). Env: `COUPON_RESERVATION_MINUTES` (default 15, max 120), `COUPON_MAX_OPEN_RESERVATIONS` (default 3, max 20).

**Logic:**
1. **Create** AVAILABLE; unique (code, eventId).
2. **Reserve:** Cap open RESERVED holds per user; release expired hold; reject EXPIRED/DISABLED/REDEEMED/wrong intendedUser; AVAILABLE→RESERVED or extend same intent; conflict if held by another.
3. **Redeem (in registration TX):** Must still be RESERVED for same user+intent; → REDEEMED linked to registrationId; feeSnapshot rewritten to coupon’s payment option (division override still applies).
4. **Disable:** Not if REDEEMED.
5. **Release redeemed:** Admin reason required → DISABLED + audit (not back to AVAILABLE).

**Outputs:** CouponPreview `{ couponId, code, paymentOption, reservedUntil, reservationIntentId }` or redeemed coupon.

**Edge cases:** Expired reservation → must re-apply; intendedUser mismatch → generic “not available for your account”; redeemed cannot disable without release path.

**Sources:** `couponService.ts`, `tournamentRules.ts` (reservation knobs), `registrationService.ts`.

---

## 7. Matchmaking / schedule conflicts

**Purpose:** Detect overlapping fighter or mat usage when scheduling; assign mats on bracket generate.

**Inputs:** Proposed `scheduledAt`, `mat`, competitor registration ids; event matches; `ASSUMED_MATCH_DURATION_MINUTES` (default 10).

**Logic (`detectScheduleConflicts`):** Window = start → start+duration. Among PENDING/SCHEDULED/LIVE/DELAYED with scheduledAt: same mat + overlap → MAT_OVERLAP; shared competitor + overlap → FIGHTER_OVERLAP. Admin may pass `allowConflicts` on update.

**Mat assignment:** `matNumberForOrder(order, matCount)` → `(order % matCount) + 1` at bracket generate.

**Warm-up UX:** `warmUpMinutes` returns minutes when match is within 15 minutes of start.

**Outputs:** `ScheduleConflict[]`.

**Edge cases:** No stored end times — assumed duration only; empty mat skips mat conflict; both competitors required before schedule set.

**Sources:** `matchConflict.ts`, `tournamentRules.ts`, `matchService.updateMatchSchedule`, `bracketService.generateBracket`.

---

## 8. Brackets (single elimination)

**Purpose:** Deterministic bracket construction, bye auto-resolution, publish gate, winner advance.

**Inputs:** Ordered CONFIRMED registration ids (≥2); mode `manual` or `random`+seed; division must not have PUBLISHED bracket (DRAFT may regenerate).

**Logic (`bracketEngine` + `bracketService`):**
1. Pad to next power of two with byes; classic `standardSeedOrder`.
2. Random mode: `shuffleDeterministic` (mulberry32) then seed order.
3. Bye matches created as status `BYE` with sole competitor as winner, cascaded into later rounds until contested.
4. Persist Bracket DRAFT + Match rows; mat from order.
5. **Publish:** DRAFT→PUBLISHED only; schedules reminder outbox jobs. Unpublish unsupported.
6. **Advance:** `nextSlot(round,order)` fills A/B of next match; PENDING→SCHEDULED when both set.

**Correction guard:** `canCorrectResult` false if next match COMPLETED or BYE.

**Outputs:** Bracket doc + matches; published bracket triggers reminders.

**Edge cases:** &lt;2 participants error; ineligible/non-CONFIRMED ids rejected; published regenerate blocked; consecutive byes cascade (e.g. 3-person).

**Sources:** `bracketEngine.ts`, `bracketService.ts`.

---

## 9. Scoring (live + finalize)

**Purpose:** Event-configured points/penalties/outcomes for judges/admins; official results drive bracket + rankings jobs.

**Inputs:** Event.scoringRules; match scores; scorer = ADMIN or JUDGE_SESSION scoped to match; idempotencyKey + expectedVersion.

**Readiness (`isScoringRulesReady`):** `configured` + ≥1 outcome; if `winByHighestScore` then ≥1 point rule.

**Apply POINT/PENALTY:** Match status in open set; version match; lookup rule codes; update scores/penalties; SCHEDULED/DELAYED→LIVE; set provisional winner via `provisionalWinnerFromScores` (only when winByHighestScore; ties need allowTies or explicit outcome).

**Finalize:** Outcome code required; POINTS path uses provisional rules; other outcomes with `requiresExplicitWinner` need winner id; set COMPLETED + resultKind OFFICIAL; advance winner; append FINALIZE score event; enqueue RANKINGS_RECALC + MATCH_RESULT_NOTIFY once (`effectsAppliedKey`).

**Admin path:** `recordMatchResult` (legacy SCHEDULED→COMPLETED without live scoring); `adminCorrectOfficialResult` / `correctMatchResult` with downstream guard.

**Outputs:** Updated Match + MatchScoreEvent; outbox jobs.

**Edge cases:** Unconfigured rules block scoring/finalize; version mismatch → refresh; idempotent replay; ties without allowTies cannot POINTS-finalize; judge session limited to credential matchId + generation.

**Sources:** `scoringService.ts`, `tournamentRules.ts`, `matchService.ts`, `judgeCredentialService.ts`.

---

## 10. Rankings

**Purpose:** Derive public standings from decided matches; optional admin manual board.

**Computed (`rankingEngine` + `rankingService`):**
- Inputs: Matches status COMPLETED|BYE; map registration→user.
- `computeRecord`: per fighter wins/losses among matches they competed in with a winner.
- Points: **placeholder** `wins * 3` (`winLossPointsStrategy`) — pending OD-004; not an approved methodology.
- Transaction bumps `calculationVersion`; conflict if concurrent bump detected.
- Public list sorts points desc, wins desc.
- `listRankingBoardEntries`: one row per CONFIRMED registration in taxonomy divisions, overlaying RankingRecord stats (zeros until results).

**Manual (`manualRankingService`):** Admin upsert/delete published rows with display rank; public UI may prefer manual board when published entries exist (model comment).

**Outputs:** RankingRecord upserts; board DTOs.

**Edge cases:** BYE counts as decided; fighters with no matches absent from recalc set; placeholder formula documented on model.

**Sources:** `rankingEngine.ts`, `rankingService.ts`, `manualRankingService.ts`, `ManualRankingEntry` model.

---

## 11. Judge credentials

**Purpose:** Issue ephemeral per-match judge logins for published brackets.

**Inputs:** Admin actor, matchId.

**Logic:**
- Bracket must be PUBLISHED; both competitors set; match not completed/cancelled (PENDING allowed for generate).
- One ACTIVE credential at a time; username unique 10-char; password returned **once**.
- Regenerate: revoke ACTIVE + revoke open JudgeSessions; new generation.
- Sessions must match credential.generation; TTL on JudgeSession.

**Outputs:** `{ username, password, generation, ... }` once; meta without password thereafter.

**Edge cases:** Generate when ACTIVE exists → ConflictError; regenerate blocked after COMPLETED/BYE/CANCELLED.

**Source:** `judgeCredentialService.ts`.

---

## 12. Cancel / transfer (admin-reviewed requests)

**Purpose:** Grappler-initiated cancellation or same-event division move with admin decision.

**Create (`createRequest`):**
- Active registration only; no other PENDING request.
- TRANSFER: target same event, different division, has occupancy counter, not full; store `requestedDivisionId`.
- Reason required.

**Decide approve:**
- CANCELLATION: release seat; registration CANCELLED; `refundPercent` = 50 if ≥30 days before `event.startDate`, else 0 (`refundPercentForCancellation`).
- TRANSFER: claim target seat, release source if active, set `registration.divisionId`.
- REJECTED: note only; no seat change.
- Email fighter.

**Outputs:** RegistrationRequest with status; optional refundPercent.

**Edge cases:** Double decide → ConflictError (+ failure audit); target division deleted on approve → NotFoundError; refund is informational % — no payment gateway refund.

**Sources:** `requestService.ts`, `tournamentRules.ts`.

---

## 13. Teammate transfer (credentials / seat handoff)

**Purpose:** Pass an active registration to another grappler via one-time hashed invite link (not admin TRANSFER request).

**Create:** Owner of active registration; rotate tokenHash if unclaimed invite exists; raw token returned once.

**Peek:** Public; event/division names + eligibility hints; no owner PII.

**Claim:**
- Claimant ≠ owner; invite unclaimed; registration still active and owned by fromUser.
- Claimant must not already hold active seat in that division.
- Eligibility (gender/belt); must have Aadhaar image + waiverAcceptedAt.
- Atomic claim; reassign `registration.userId`; rewrite PaymentSubmission.userId for that registration.

**Outputs:** Updated Registration; invite claimedAt.

**Edge cases:** Invalid/short token; already claimed; closed registration; self-claim ValidationError.

**Source:** `teammateTransfer.ts`.

---

## 14. Duplicates (summary)

| Domain | Behavior | Source |
|---|---|---|
| Active registration per user+division | Partial unique index + ConflictError | Registration model, registrationService |
| Coupon code per event | Unique index | Coupon model, couponService |
| Payment UTR | Flag in admin queue only | paymentQueue.flagDuplicateUtrs |
| Outbox jobs | Unique idempotencyKey; supersede siblings | OutboxJob |
| Notifications | Unique dedupeKey | Notification |
| Score events | Unique (matchId, idempotencyKey) and (matchId, sequence) | MatchScoreEvent |
| Bracket per division | Unique divisionId | Bracket |
| Judge username | Unique | MatchJudgeCredential |

---

## 15. Credentials & verification (account)

**Purpose:** Account email verification and session security (distinct from judge credentials).

**Logic:** Register sets `emailVerified: false` + EmailVerification code; login blocked while false; verify/resend rate-limited; Google OAuth creates/verifies email and may create GrapplerProfile. Sessions store tokenHash + TTL. DISABLED users cannot login/OAuth.

**Sources:** `features/auth/actions.ts`, `verificationMail`, `Session` model, Google OAuth routes.

---

## Quick rule → file index

| Topic | Primary files |
|---|---|
| Eligibility | `registrationEligibility.ts` |
| Weight/division grid | `divisionTaxonomy.ts` |
| Registration / withdraw | `registrationService.ts`, `registrationStateMachine.ts` |
| Capacity | `divisionOccupancy.ts` |
| Payments | `paymentService.ts`, `paymentQueue.ts` |
| Coupons | `couponService.ts`, `tournamentRules.ts` |
| Schedule conflicts | `matchConflict.ts` |
| Brackets | `bracketEngine.ts`, `bracketService.ts` |
| Scoring | `scoringService.ts`, `tournamentRules.ts` |
| Rankings | `rankingEngine.ts`, `rankingService.ts`, `manualRankingService.ts` |
| Judge creds | `judgeCredentialService.ts` |
| Cancel/transfer requests | `requestService.ts` |
| Teammate handoff | `teammateTransfer.ts` |
| Refund % | `tournamentRules.refundPercentForCancellation` |
