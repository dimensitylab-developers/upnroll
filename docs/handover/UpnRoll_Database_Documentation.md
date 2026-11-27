# Up 'n Roll — Database Documentation

| Field | Value |
|-------|--------|
| **Project** | Up 'n Roll |
| **Prepared by** | Dimensity Labs |
| **Document version** | 1.0.0 |
| **Date** | 2026-11-27 |
| **Git commit** | `4ffb794` |

---

## 1. Overview

Source of truth: `backend/models/*.ts`. Collection names are Mongoose defaults (lowercased plural) unless noted. Every schema uses `timestamps: true` except **AuditLog** (`createdAt` only).

This document covers all **24** Mongoose models used by Up 'n Roll at commit `4ffb794`.

---

## 2. Entity-relationship diagram

```mermaid
erDiagram
  User ||--o| GrapplerProfile : "userId"
  User ||--o{ Session : "userId"
  User ||--o{ EmailVerification : "userId"
  User ||--o{ Registration : "userId"
  User ||--o{ RankingRecord : "userId"
  User ||--o{ Notification : "userId"
  User ||--o{ AuditLog : "actorId"
  User ||--o{ ManualRankingEntry : "userId optional"

  Event ||--o{ Division : "eventId"
  Event ||--o{ Bracket : "eventId"
  Event ||--o{ Match : "eventId"
  Event ||--o{ Registration : "eventId"
  Event ||--o{ PaymentSubmission : "eventId"
  Event ||--o{ Coupon : "eventId"
  Event ||--o{ MediaAsset : "eventId optional"
  Event ||--o{ MatchJudgeCredential : "eventId"
  Event ||--o{ MatchScoreEvent : "eventId"
  Event ||--o{ Notification : "eventId optional"

  Division ||--o| Bracket : "divisionId unique"
  Division ||--o{ Match : "divisionId"
  Division ||--o{ Registration : "divisionId"

  Bracket ||--o{ Match : "bracketId"

  Registration ||--o{ PaymentSubmission : "registrationId"
  Registration ||--o{ RegistrationRequest : "registrationId"
  Registration ||--o{ TransferInvite : "registrationId"
  Registration }o--o| Coupon : "couponId / redeemedBy"

  Match ||--o{ MatchScoreEvent : "matchId"
  Match ||--o{ MatchJudgeCredential : "matchId"
  MatchJudgeCredential ||--o{ JudgeSession : "credentialId"

  Coupon }o--|| Event : "eventId"
  ContentEntry }o--|| User : "createdBy"
  MediaAsset }o--|| User : "createdBy"
  SiteSettings ||--|| SiteSettings : "singleton key=default"
  OutboxJob ||--o| OutboxJob : "supersededBy"
```

---

## 3. Model catalogue (24)

| # | Model | Collection | Purpose |
|---|-------|------------|---------|
| 1 | User | `users` | Auth identity; roles GRAPPLER / ADMIN |
| 2 | GrapplerProfile (alias FighterProfile) | `fighterprofiles` | Grappler public + private profile |
| 3 | Session | `sessions` | App cookie session (hashed token) |
| 4 | EmailVerification | `emailverifications` | Hashed email verification codes |
| 5 | Event | `events` | Tournament root: windows, fees, scoring, mats |
| 6 | Division | `divisions` | Weight / experience class + capacity |
| 7 | Registration | `registrations` | Seat in a division + fee snapshot |
| 8 | PaymentSubmission | `paymentsubmissions` | UTR + screenshot review queue |
| 9 | Coupon | `coupons` | Per-event single-use codes |
| 10 | Bracket | `brackets` | One single-elim bracket per division |
| 11 | Match | `matches` | Bracket slot / bout |
| 12 | MatchScoreEvent | `matchscoreevents` | Append-only live scoring trail |
| 13 | MatchJudgeCredential | `matchjudgecredentials` | Per-match judge login |
| 14 | JudgeSession | `judgesessions` | Judge cookie session |
| 15 | RankingRecord | `rankingrecords` | Computed global W/L/points |
| 16 | ManualRankingEntry | `manualrankingentries` | Admin-curated board rows |
| 17 | RegistrationRequest | `registrationrequests` | Cancel / transfer review |
| 18 | TransferInvite | `transferinvites` | Teammate seat handoff |
| 19 | Notification | `notifications` | In-app grappler inbox |
| 20 | OutboxJob | `outboxjobs` | Durable async jobs |
| 21 | ContentEntry | `contententries` | FAQ / announcement / policy CMS |
| 22 | MediaAsset | `mediaassets` | Gallery links (external URL) |
| 23 | SiteSettings | `sitesettings` | Singleton public contact card |
| 24 | AuditLog | `auditlogs` | Append-only action trail |

---

## 4. Models in detail

### 4.1 User — `users`

| Purpose | Auth identity; roles GRAPPLER / ADMIN (legacy FIGHTER still readable). |

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| email | String | yes | — | unique, lowercase, trim |
| displayName | String | no | `""` | house greeting name |
| passwordHash | String | yes | — | scrypt `{saltHex}:{derivedKeyHex}` |
| role | String enum | yes | `"GRAPPLER"` | `GRAPPLER` \| `ADMIN` \| `FIGHTER` |
| status | String enum | yes | `"ACTIVE"` | `ACTIVE` \| `DISABLED` |
| emailVerified | Boolean | no | — | `false` = awaiting code; missing = legacy allow-login |
| emailVerifiedAt | Date | no | — | |
| createdAt / updatedAt | Date | auto | — | |

**Indexes / unique:** `email` unique.

**Relationships:** 1→1 GrapplerProfile; 1→N Session, Registration, Notification, AuditLog (as actor).

**Lifecycle:** Created by register / Google OAuth / `scripts/create-admin`. Soft-disabled via `status=DISABLED`.

---

### 4.2 GrapplerProfile (alias FighterProfile) — `fighterprofiles`

| Purpose | Grappler public + private profile. Model name `GrapplerProfile`; collection remains `fighterprofiles` until migration. |

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| userId | ObjectId→User | yes | — | **unique** |
| displayName | String | yes | — | |
| slug | String | yes | — | **unique**, lowercase |
| gym, discipline | String | no | `""` | |
| dateOfBirth | String | no | `""` | |
| age | Number | no | `0` | |
| gender, mobile, nationality | String | no | `""` | |
| aadhaar | String | no | `""` | legacy text; keep private |
| aadhaarImageKey | String | no | `""` | private storage key |
| parentalConsentImageKey | String | no | `""` | minors under 18 |
| cityState, emergencyContactName, emergencyRelationship, bloodGroup | String | no | `""` | |
| instagramHandle | String | no | `""` | without `@` |
| photoKey | String | no | `""` | |
| academy, headCoach, beltRank | String | no | `""` | |
| yearsTraining | Number | no | `0` | |
| pastRecord | String | no | `""` | free-text |
| careerWins | Number | no | `0` | min 0; seeding hint |
| weightDivision, heardAbout | String | no | `""` | |
| hasMedicalCondition, hasAllergies, takingMedication, medicallyFit | Boolean | no | `false` | |
| medicalConditionDetail, allergiesDetail | String | no | `""` | |
| waiverAcceptedAt | Date | no | — | |
| createdAt / updatedAt | Date | auto | — | |

**Indexes / unique:** `userId` unique; `slug` unique; `{ createdAt: -1 }`; `{ displayName: 1 }`.

**Relationships:** User 1:1. Referenced by rankings / brackets via userId.

**Lifecycle:** Created at register (minimal) or Google OAuth; enriched on profile / registration forms. Private keys never exposed on public pages.

---

### 4.3 Session — `sessions`

| Purpose | Cookie session: hashed token ↔ user. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| userId | ObjectId→User | yes | — |
| tokenHash | String | yes | — unique |
| expiresAt | Date | yes | — |
| userAgent | String | no | — |
| createdAt / updatedAt | Date | auto | — |

**Indexes:** `userId`; `tokenHash` unique; TTL on `expiresAt` (`expireAfterSeconds: 0`).

---

### 4.4 EmailVerification — `emailverifications`

| Purpose | Hashed email verification codes for new accounts. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| userId | ObjectId→User | yes | — indexed |
| codeHash | String | yes | — |
| expiresAt | Date | yes | — |
| createdAt / updatedAt | Date | auto | — |

---

### 4.5 Event — `events`

| Purpose | Tournament / event root: schedule windows, fees, scoring rules, mats. |

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| name | String | yes | — | |
| slug | String | yes | — | **unique**, lowercase |
| description, venue | String | no | `""` | |
| startDate | Date | yes | — | |
| registrationOpensAt / registrationClosesAt | Date | yes | — | |
| status | enum | yes | `"DRAFT"` | `DRAFT` \| `REGISTRATION_OPEN` \| `REGISTRATION_CLOSED` \| `COMPLETED` |
| matCount | Number | yes | `1` | min 1 |
| timezone | String | yes | `"Asia/Kolkata"` | IANA |
| paymentInstructions.feeMinorUnits | Number | yes | — | legacy single-fee mirror |
| paymentInstructions.currency | String | yes | `"INR"` | |
| paymentInstructions.qrImageKey | String | no | `""` | |
| paymentOptions[] | subdocs | no | `[]` | authoritative multi-option list |
| paymentOptions._id | ObjectId | auto | — | |
| paymentOptions.label | String | yes | — | |
| paymentOptions.amountMinorUnits | Number | yes | — | min 0 |
| paymentOptions.currency | String | yes | `"INR"` | |
| paymentOptions.qrImageKey | String | no | `""` | |
| paymentOptions.active | Boolean | yes | `true` | |
| paymentOptions.isDefault | Boolean | yes | `false` | |
| scoringRules | subdoc | no | `{ configured: false }` | see below |
| scheduleExternalUrl | String | no | `""` | |
| createdAt / updatedAt | Date | auto | — | |

**scoringRules:** `configured`, `winByHighestScore`, `allowTies` (bools); `points[]` `{code,label,points}`; `penalties[]` `{code,label,pointsAgainst}`; `outcomes[]` `{code,label,requiresExplicitWinner}`.

**Indexes / unique:** `slug` unique.

**Lifecycle:** DRAFT → REGISTRATION_OPEN → REGISTRATION_CLOSED → COMPLETED (admin status transitions).

---

### 4.6 Division — `divisions`

| Purpose | Weight / experience class within an event; capacity + occupancy. |

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| eventId | ObjectId→Event | yes | — | indexed |
| name | String | yes | — | |
| discipline | String | yes | — | e.g. No-Gi |
| capacity | Number | yes | — | min 1 |
| filledCount | Number | no | — | missing ≠ 0; set by create / backfill |
| feeMinorUnitsOverride | Number | no | `null` | null → use event fee |
| gender | enum | no | `""` | `""` \| `MALE` \| `FEMALE` |
| experienceLevel | enum | no | `""` | `""` \| `BEGINNER` \| `INTERMEDIATE` |
| weightBand | String | no | `""` | taxonomy id e.g. `55-65` |
| weightMinKg / weightMaxKg | Number | no | `null` | taxonomy bounds (not enforced at register) |
| createdAt / updatedAt | Date | auto | — | |

**Relationships:** N per Event; 0..1 Bracket (unique on divisionId); N Registrations / Matches.

---

### 4.7 Registration — `registrations`

| Purpose | Grappler seat in a division + fee snapshot + status machine. |

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| userId | ObjectId→User | yes | — | indexed |
| eventId | ObjectId→Event | yes | — | indexed |
| divisionId | ObjectId→Division | yes | — | indexed |
| status | enum | yes | `"AWAITING_PAYMENT"` | see statuses |
| consentAcceptedAt / agreementAcceptedAt | Date | no | `null` | |
| feeSnapshot | subdoc \| null | no | `null` | frozen fee/QR/coupon at create |
| feeSnapshot.amountMinorUnits | Number | yes* | — | *when snapshot present |
| feeSnapshot.currency | String | yes* | `"INR"` | |
| feeSnapshot.paymentOptionId | ObjectId | no | `null` | |
| feeSnapshot.paymentOptionLabel / qrImageKey / couponCode | String | no | `""` | |
| feeSnapshot.couponId | ObjectId→Coupon | no | `null` | |
| feeSnapshot.snapshottedAt | Date | yes* | `Date.now` | |
| couponId | ObjectId→Coupon | no | `null` | |
| statusHistory[] | `{status, at}` | no | `[]` | |
| createdAt / updatedAt | Date | auto | — | |

**Statuses:** `AWAITING_PAYMENT` \| `PENDING_VERIFICATION` \| `CONFIRMED` \| `REJECTED` \| `CANCELLED`.

**Active set** (capacity + duplicate block): first three.

**Indexes / unique:** partial unique `{ userId: 1, divisionId: 1 }` where status ∈ active set.

**Lifecycle:** create → AWAITING_PAYMENT (+ PaymentSubmission); submit payment → PENDING_VERIFICATION; admin approve → CONFIRMED / reject → REJECTED; cancel/withdraw → CANCELLED. Rejected may resubmit payment.

---

### 4.8 PaymentSubmission — `paymentsubmissions`

| Purpose | UTR + screenshot review queue for a registration. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| registrationId | ObjectId→Registration | yes | — indexed |
| userId | ObjectId→User | yes | — indexed |
| eventId | ObjectId→Event | yes | — |
| expectedAmountMinorUnits | Number | yes | — server-derived, min 0 |
| submittedUtr | String \| null | no | `null` indexed |
| screenshotStorageKey | String \| null | no | `null` |
| submittedAt | Date \| null | no | `null` |
| status | enum | yes | `"AWAITING_SUBMISSION"` |
| reviewerId | ObjectId→User | no | `null` |
| reviewedAt | Date | no | `null` |
| reviewNote | String | no | `""` |
| createdAt / updatedAt | Date | auto | — |

**Statuses:** `AWAITING_SUBMISSION` \| `PENDING_REVIEW` \| `APPROVED` \| `REJECTED`.

**Indexes:** `{ status: 1, createdAt: -1 }`; `submittedUtr`.

**Lifecycle:** Created with registration (AWAITING_SUBMISSION). New row on each submit (PENDING_REVIEW). Admin decides once; duplicates flagged by UTR helper (not blocked).

---

### 4.9 Coupon — `coupons`

| Purpose | Per-event single-use codes bound to a payment option; reserve → redeem. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| code | String | yes | — uppercase, trim |
| eventId | ObjectId→Event | yes | — indexed |
| paymentOptionId | ObjectId | yes | — Event.paymentOptions._id |
| status | enum | yes | `"AVAILABLE"` indexed |
| expiresAt | Date | no | `null` |
| intendedUserId | ObjectId→User | no | `null` |
| reservedByUserId | ObjectId→User | no | `null` |
| reservedUntil | Date | no | `null` |
| reservationIntentId | String | no | `null` |
| redeemedByRegistrationId | ObjectId→Registration | no | `null` |
| redeemedAt | Date | no | `null` |
| createdBy | ObjectId→User | yes | — |
| disabledAt / disabledBy | Date / ObjectId | no | `null` |
| releasedAt / releasedBy / releaseReason | Date / ObjectId / String | no | null / null / `""` |
| createdAt / updatedAt | Date | auto | — |

**Statuses:** `AVAILABLE` \| `RESERVED` \| `REDEEMED` \| `DISABLED` \| `EXPIRED`.

**Indexes / unique:** `{ code: 1, eventId: 1 }` unique; `{ status: 1, reservedUntil: 1 }`; `{ reservedByUserId: 1, status: 1 }`.

---

### 4.10 Bracket — `brackets`

| Purpose | One single-elimination bracket per division. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| eventId | ObjectId→Event | yes | — indexed |
| divisionId | ObjectId→Division | yes | — **unique** |
| format | enum | yes | `"SINGLE_ELIMINATION"` |
| seed | Number | yes | — RNG seed (0 for manual) |
| participantRegistrationIds | ObjectId[] | no | `[]` |
| roundsCount | Number | yes | — |
| status | enum | yes | `"DRAFT"` | `DRAFT` \| `PUBLISHED` |
| version | Number | yes | `1` |
| createdAt / updatedAt | Date | auto | — |

**Lifecycle:** generate (DRAFT, may replace prior DRAFT matches) → publish (irreversible in app). Unpublish not supported.

---

### 4.11 Match — `matches`

| Purpose | Bracket slot / bout with schedule, scores, official result. |

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| eventId / divisionId / bracketId | ObjectId | yes | — | each indexed |
| round / order | Number | yes | — | unique together with bracketId |
| competitorARegistrationId / competitorBRegistrationId | ObjectId→Registration | no | `null` | |
| status | enum | yes | `"PENDING"` | see list |
| winnerRegistrationId | ObjectId | no | `null` | |
| resultMethod | String | no | `""` | |
| resultKind | enum \| null | no | `null` | `PROVISIONAL` \| `OFFICIAL` |
| scheduledAt | Date | no | `null` | |
| scheduleVersion | Number | yes | `0` | reminder supersede |
| mat | String | no | `""` | |
| resultRecordedBy / resultRecordedAt | ObjectId / Date | no | null | |
| finalizedByKind | enum \| null | no | `null` | `JUDGE_SESSION` \| `ADMIN` |
| finalizedById / finalizedAt | ObjectId / Date | no | null | |
| correctionHistory[] | subdocs | no | `[]` | previous winner/method/reason/by/at |
| scoreVersion / scoreEventSeq | Number | yes | `0` | optimistic concurrency |
| scoreA / scoreB / penaltiesA / penaltiesB | Number | yes | `0` | |
| provisionalWinnerRegistrationId | ObjectId | no | `null` | |
| provisionalResultMethod | String | no | `""` | |
| effectsAppliedKey | String | no | `null` | side-effect idempotency |
| createdAt / updatedAt | Date | auto | — | |

**Statuses:** `PENDING` \| `SCHEDULED` \| `LIVE` \| `DELAYED` \| `COMPLETED` \| `BYE` \| `CANCELLED` \| `ERROR`.

**Indexes / unique:** `{ bracketId, round, order }` unique; `{ status }`; `{ eventId, status }`; `{ eventId, scheduledAt, mat }`; competitorA/B + scheduledAt.

---

### 4.12 MatchScoreEvent — `matchscoreevents`

| Purpose | Append-only live scoring / finalize audit trail. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| matchId / eventId | ObjectId | yes | — indexed |
| type | enum | yes | — `POINT` \| `PENALTY` \| `ADJUSTMENT` \| `UNDO` \| `STATUS` \| `FINALIZE` |
| side | enum | no | — `A` \| `B` |
| value | Number | yes | `0` |
| label | String | no | `""` |
| actorKind | enum | yes | — `JUDGE_SESSION` \| `ADMIN` |
| actorId | ObjectId | yes | — credential or admin user |
| sessionId | ObjectId→JudgeSession | no | `null` |
| sequence | Number | yes | — min 1 |
| matchVersion | Number | yes | — |
| idempotencyKey | String | yes | — |
| reversesEventId / reversedByEventId | ObjectId | no | `null` |
| meta | Mixed | no | `{}` |
| createdAt / updatedAt | Date | auto | — |

**Indexes / unique:** `{ matchId, sequence }` unique; `{ matchId, idempotencyKey }` unique.

---

### 4.13 MatchJudgeCredential — `matchjudgecredentials`

| Purpose | Per-match judge login (username + password hash). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| matchId / eventId | ObjectId | yes | — indexed |
| username | String | yes | — **unique**, length 10 |
| passwordHash | String | yes | — |
| generation | Number | yes | `1` | sessions must match |
| status | enum | yes | `"ACTIVE"` | `ACTIVE` \| `REVOKED` |
| issuedBy / issuedAt | ObjectId / Date | yes | — / Date.now |
| revokedAt / revokedBy | Date / ObjectId | no | null |
| createdAt / updatedAt | Date | auto | — |

**Indexes:** `{ matchId, status }`; `username` unique.

---

### 4.14 JudgeSession — `judgesessions`

| Purpose | Short-lived judge cookie session bound to credential generation. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| credentialId | ObjectId→MatchJudgeCredential | yes | — indexed |
| matchId | ObjectId→Match | yes | — indexed |
| generation | Number | yes | — min 1 |
| tokenHash | String | yes | — unique |
| expiresAt | Date | yes | — TTL index |
| userAgent | String | no | `""` |
| revokedAt | Date | no | `null` |
| createdAt / updatedAt | Date | auto | — |

---

### 4.15 RankingRecord — `rankingrecords`

| Purpose | Computed global W/L/points per user (placeholder formula). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| userId | ObjectId→User | yes | — **unique** |
| scope | enum | yes | `"GLOBAL"` |
| wins / losses / points | Number | yes | `0` |
| calculationVersion | Number | yes | `1` |
| computedAt | Date | yes | Date.now |
| createdAt / updatedAt | Date | auto | — |

**Indexes:** `{ points: -1, wins: -1 }`.

**Formula note:** engine strategy is `points = wins * 3` (placeholder pending OD-004).

---

### 4.16 ManualRankingEntry — `manualrankingentries`

| Purpose | Admin-curated public board rows (prefer when published rows exist — model intent; public page wiring gap documented separately). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| displayName | String | yes | — |
| slug | String | no | `""` lowercase |
| userId | ObjectId→User | no | `null` |
| rank | Number | yes | — min 1 |
| gender | enum | no | `""` |
| weightBand / gym / photoUrl / note | String | no | `""` |
| experienceLevel | enum | no | `""` |
| published | Boolean | no | `true` |
| createdAt / updatedAt | Date | auto | — |

**Indexes:** `{ published: 1, rank: 1 }`; `{ weightBand: 1, gender: 1, rank: 1 }`.

---

### 4.17 RegistrationRequest — `registrationrequests`

| Purpose | Admin-reviewed cancellation or division transfer. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| type | enum | yes | — `CANCELLATION` \| `TRANSFER` |
| registrationId | ObjectId→Registration | yes | — indexed |
| userId | ObjectId→User | yes | — indexed |
| requestedDivisionId | ObjectId→Division | no | `null` | TRANSFER only |
| reason | String | yes | — |
| status | enum | yes | `"PENDING"` | `PENDING` \| `APPROVED` \| `REJECTED` |
| reviewerId / reviewNote / reviewedAt | ObjectId / String / Date | no | null / `""` / null |
| refundPercent | Number | no | `null` | set on cancel approve |
| createdAt / updatedAt | Date | auto | — |

**Indexes:** `{ status: 1, createdAt: -1 }`.

---

### 4.18 TransferInvite — `transferinvites`

| Purpose | Teammate seat handoff; raw token never stored (SHA-256 `tokenHash` only). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| tokenHash | String | yes | — unique + indexed |
| registrationId | ObjectId→Registration | yes | — indexed |
| fromUserId | ObjectId→User | yes | — |
| claimedByUserId | ObjectId→User | no | `null` |
| claimedAt | Date | no | `null` |
| createdAt / updatedAt | Date | auto | — |

**Indexes:** `{ registrationId: 1, claimedAt: 1 }`.

---

### 4.19 Notification — `notifications`

| Purpose | In-app fighter notifications (reminders, schedule, payment, results). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| userId | ObjectId→User | yes | — indexed |
| type | enum | yes | — see list |
| title / body | String | yes | — |
| href | String | no | `""` |
| readAt | Date | no | `null` |
| eventId / matchId | ObjectId | no | `null` |
| dedupeKey | String | yes | — **unique** |
| meta | Mixed | no | `{}` |
| createdAt / updatedAt | Date | auto | — |

**Types:** `MATCH_REMINDER_10M` \| `MATCH_STARTING_SOON` \| `MATCH_SCHEDULE_CHANGED` \| `MATCH_CANCELLED` \| `MATCH_RESULT` \| `PAYMENT_DECISION` \| `GENERIC`.

**Indexes:** `{ userId, createdAt: -1 }`; `{ userId, readAt }`; `dedupeKey` unique.

---

### 4.20 OutboxJob — `outboxjobs`

| Purpose | Durable async jobs (reminders, email, rankings recalc). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| type | enum | yes | — indexed |
| status | enum | yes | `"PENDING"` indexed |
| runAt | Date | yes | — indexed |
| attempts | Number | yes | `0` |
| maxAttempts | Number | yes | `5` |
| lastError | String | no | `""` |
| idempotencyKey | String | yes | — **unique** |
| payload | Mixed | yes | `{}` |
| processingStartedAt / completedAt | Date | no | `null` |
| supersededBy | ObjectId→OutboxJob | no | `null` |
| createdAt / updatedAt | Date | auto | — |

**Types:** `MATCH_REMINDER` \| `MATCH_SCHEDULE_CHANGED` \| `MATCH_RESULT_NOTIFY` \| `EMAIL_DISPATCH` \| `RANKINGS_RECALC`.

**Statuses:** `PENDING` \| `PROCESSING` \| `DONE` \| `FAILED` \| `CANCELLED` \| `SUPERSEDED`.

**Indexes:** `idempotencyKey` unique; `{ status: 1, runAt: 1 }`.

**Note:** `EMAIL_DISPATCH` is a reserved/no-op stub in the outbox processor; email is handled inside notification helpers.

---

### 4.21 ContentEntry — `contententries`

| Purpose | FAQ / announcement / policy CMS for public site + chatbot. |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| type | enum | yes | — `FAQ` \| `ANNOUNCEMENT` \| `POLICY` |
| title / body | String | yes | — FAQ: Q/A |
| publicationState | enum | yes | `"DRAFT"` | `DRAFT` \| `PUBLISHED` |
| createdBy | ObjectId→User | yes | — |
| createdAt / updatedAt | Date | auto | — |

**Indexes:** `{ type: 1, publicationState: 1 }`.

---

### 4.22 MediaAsset — `mediaassets`

| Purpose | Gallery / media links (external URL until OD-012 storage). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| eventId | ObjectId→Event | no | `null` |
| caption | String | yes | — |
| externalUrl | String | yes | — |
| publicationState | enum | yes | `"DRAFT"` |
| createdBy | ObjectId→User | yes | — |
| createdAt / updatedAt | Date | auto | — |

**Note:** `createMediaAsset` always persists `publicationState: "PUBLISHED"`; there is no unpublish/update publication API.

---

### 4.23 SiteSettings — `sitesettings`

| Purpose | Singleton public house contact card (`key: "default"`). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| key | String | yes | `"default"` unique |
| instagramHandle | String | no | `"up.n.roll"` |
| email / phoneDisplay / phoneTel | String | no | `""` |
| city | String | no | `"Mumbai"` |
| createdAt / updatedAt | Date | auto | — |

---

### 4.24 AuditLog — `auditlogs`

| Purpose | Append-only action trail (no updatedAt). |

| Field | Type | Required | Default |
|-------|------|----------|---------|
| actorId | ObjectId→User | no | — |
| action | String | yes | — |
| targetType | String | yes | — |
| targetId | String | no | — |
| before / after | Mixed | no | — |
| correlationId | String | no | — |
| createdAt | Date | auto | — |

---

## 5. Cross-cutting lifecycle notes

1. **Occupancy:** `Division.filledCount` is claimed/released atomically on active registration enter/leave. A missing counter is an error (run backfill), not treated as empty.
2. **Fee immutability:** `Registration.feeSnapshot` freezes amount/option/QR/coupon at create; later event fee edits do not rewrite open submissions.
3. **Bracket immutability after publish:** regenerating only allowed while DRAFT; publish schedules reminder outbox jobs. Unpublish is not supported.
4. **Scoring concurrency:** Match `scoreVersion` + MatchScoreEvent `idempotencyKey` prevent double-apply; finalize enqueues `RANKINGS_RECALC` + `MATCH_RESULT_NOTIFY` once via `effectsAppliedKey`.
5. **TTL:** Session and JudgeSession documents auto-delete when `expiresAt` passes.
6. **Privacy:** Aadhaar / parental consent / payment screenshots are storage keys only; served via authenticated API routes, not public URLs.
7. **Naming debt:** GrapplerProfile still uses collection `fighterprofiles`; User may still store legacy role `FIGHTER`.

---

*End of Database Documentation — Dimensity Labs · v1.0.0 · 2026-11-27 · `4ffb794`*
