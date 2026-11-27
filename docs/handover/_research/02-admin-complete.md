# Admin capabilities (complete)

Research source: `frontend/src/app/(admin)/admin/**`, `frontend/src/features/{admin,admin-payments,events,payments,brackets,matches,rankings,content,media,settings,requests,notifications,scoring}`, `backend/services/*`, `backend/auth/*`, `backend/audit/log.ts`.

**Global permissions:** Every `/admin/**` route is gated in `(admin)/admin/layout.tsx`: session required (else `/login`); `session.user.role === "ADMIN"` required (else `/grappler/dashboard`). Backend service mutations call `assertAdmin(actor)` / pages call `requireActor("ADMIN")`. **Roles in product:** `ADMIN` and `GRAPPLER` only (legacy `FIGHTER` normalized to `GRAPPLER`). **There is no VERIFIER role.**

**Nav** (`AdminNav`): Dashboard, Events, Grapplers, Payments, Requests, Rankings, Content, Settings, Media, Outbox, Audit.

---

## 1. Admin dashboard

1. **Feature name:** Admin desk / overview  
2. **Purpose:** At-a-glance presence, pending money/requests, next event shortcuts, recent registrations and house activity.  
3. **Navigation path:** `/admin`  
4. **Permissions:** `ADMIN` only (`getAdminDashboardData` → `assertAdmin`).  
5. **Step-by-step ops:** Open desk → review stat cards → open Next event hub / Divisions / Brackets / Matches → chase pending payments or requests → skim timelines.  
6. **Fields/actions:** Stats: grappler count, entries today (logins), new accounts today, pending payments. Sections: Next event; Who came in (`USER_LOGIN`); New accounts; Profiles (`FIGHTER_PROFILE_*`); Event registrations; Needs attention (pending payments + pending requests); House activity (recent audit). Links to `/admin/events`, `/admin/grapplers`, `/admin/payments`, `/admin/requests`.  
7. **Validation:** N/A (read-only).  
8. **Backend ops:** `dashboardService.getAdminDashboardData` composes `countFighters`, `listUpcomingEventsForAdmin`, `countPaymentsByStatus` / `listPaymentQueue`, `listPendingRequestsForAdmin`, `listRecentRegistrationsForAdmin`, audit helpers (`listRecentAuditLogs*`, `listRecentAccountsForAdmin`, `getAdminPresenceStats`).  
9. **DB changes:** None.  
10. **Outcome:** Operator sees who signed up, who logged in, what needs review.  
11. **Errors/limits:** Upcoming events capped (5); pending payments/requests capped in feed (5 / 3); registrations feed 8; audit snippets 8–10. Presence “entries today” = login audits, not email verify.

---

## 2. Events list + create

1. **Feature name:** Events list & create  
2. **Purpose:** Create tournaments and open each event hub.  
3. **Navigation path:** `/admin/events`  
4. **Permissions:** `ADMIN` (`listEventsForAdmin`, `createEvent`).  
5. **Step-by-step ops:** Fill create form → submit → event appears in All events → click row → hub.  
6. **Fields/actions:** Create: name, slug, venue, startDate, registrationOpensAt, registrationClosesAt, feeAmount (major), currency (default INR), matCount. List shows name, slug, venue, start date, status.  
7. **Validation:** Zod `createEventSchema` — name ≥2; slug lowercase `[a-z0-9-]`; fee `^\d+(\.\d{1,2})?$`; opens &lt; closes; matCount ≥1. Service: unique slug; fee ≥0 integer minor units.  
8. **Backend ops:** `eventService.createEvent` — status `DRAFT`; seeds `paymentInstructions`, default `paymentOptions` tier, empty `scoringRules` (`configured: false`); audit `EVENT_CREATED`.  
9. **DB changes:** Insert `Event`.  
10. **Outcome:** Draft event ready for hub setup.  
11. **Errors/limits:** Duplicate slug → conflict. **No delete/archive event UI.** Status not set on create form (always DRAFT).

---

## 3. Event hub (detail) + status / mats / overview / registrations

1. **Feature name:** Event hub  
2. **Purpose:** Central control for one event: status, mats, QR, fees/coupons panel, overview edit, division edits, registration list + admin withdraw.  
3. **Navigation path:** `/admin/events/[id]`  
4. **Permissions:** `ADMIN` (`getEventForAdmin`, related services).  
5. **Step-by-step ops:** Open hub → set status/mats → upload default QR and/or manage Fees & coupons → edit overview → manage divisions (inline or door) → review registrations / withdraw / open grappler sheet. Use door links for deep pages.  
6. **Fields/actions:**  
   - **Doors:** Divisions, Brackets, Matches, Fees & coupons, Scoring rules.  
   - **Status:** `DRAFT` | `REGISTRATION_OPEN` | `REGISTRATION_CLOSED` | `COMPLETED`.  
   - **Mats:** matCount ≥1 (rewrites open match mats).  
   - **Default payment QR:** file upload → storage.  
   - **Overview:** name, description, venue, dates, fee, currency.  
   - **Divisions (inline):** edit name/discipline/capacity per division.  
   - **Registrations:** status, link to `/admin/grapplers/[userId]`, `WithdrawButton` when active.  
7. **Validation:** Status enum; matCount integer ≥1; overview opens &lt; closes; fee ≥0; capacity ≥ filledCount.  
8. **Backend ops:** `updateEventStatus`, `updateEventMatCount`, `setEventPaymentQr`, `updateEventDetails`, `updateDivision`, `listRegistrationsForEvent`, `withdrawRegistration`; payments panel uses `paymentOptionService` / `couponService`. Audits: `EVENT_STATUS_CHANGED`, `EVENT_MATS_UPDATED`, `EVENT_PAYMENT_QR_UPDATED`, `EVENT_DETAILS_UPDATED`, etc.  
9. **DB changes:** Update `Event` / `Division`; withdraw → `Registration` `CANCELLED` + seat release; may auto-resolve scheduled matches via `WITHDRAWAL`.  
10. **Outcome:** Event operable end-to-end from hub.  
11. **Errors/limits:** Capacity cannot drop below filled. **No event delete.** Public listing only for non-DRAFT statuses (`PUBLIC_EVENT_STATUSES`). Withdraw only for active statuses (`AWAITING_PAYMENT`, `PENDING_VERIFICATION`, `CONFIRMED`).

---

## 4. Divisions door

1. **Feature name:** Divisions management  
2. **Purpose:** Seed Road-to-Super-Fight grid and/or create custom divisions.  
3. **Navigation path:** `/admin/events/[id]/divisions`  
4. **Permissions:** `ADMIN`.  
5. **Step-by-step ops:** Optionally Seed → and/or Create division → return to hub to edit capacity/name.  
6. **Fields/actions:** Seed button (`seedRoadToSuperFightDivisions`, default capacity 64). Create: name, discipline, capacity. List shows name, discipline, capacity (read-only on this page).  
7. **Validation:** `createDivisionSchema` — capacity ≥1. Seed is idempotent by division name.  
8. **Backend ops:** `createDivision`, `seedRoadToSuperFightDivisions` (`divisionTaxonomy.roadToSuperFightDivisionSeeds`); audit `DIVISION_CREATED`.  
9. **DB changes:** Insert `Division` (+ gender/experience/weight metadata when seeded).  
10. **Outcome:** Divisions available for registration and brackets.  
11. **Errors/limits:** **Edit/delete not on this page** (edit on hub). **No delete division UI.** Seed skips existing names.

---

## 5. Brackets door

1. **Feature name:** Bracket generate + publish  
2. **Purpose:** Order confirmed participants, generate single-elimination DRAFT bracket, publish once.  
3. **Navigation path:** `/admin/events/[id]/brackets`  
4. **Permissions:** `ADMIN` (`listEligibleParticipants`, `generateBracket`, `publishBracket`, `getBracketForDivision`).  
5. **Step-by-step ops:** Per division: reorder seeds → Generate from this order **or** random with seed → preview `BracketView` → Publish when DRAFT.  
6. **Fields/actions:** Participant list (CONFIRMED only); mode `manual` | `random` + seed; Publish button only if `status === "DRAFT"`.  
7. **Validation:** All ordered IDs must be CONFIRMED in that division.  
8. **Backend ops:** `bracketService.generateBracket` (transaction: replace matches if regenerating DRAFT; version++); `publishBracket` (DRAFT→PUBLISHED + schedule reminders). Audits `BRACKET_GENERATED`, `BRACKET_PUBLISHED`.  
9. **DB changes:** Upsert `Bracket`; delete+insert `Match` rows; publish updates status.  
10. **Outcome:** Published bracket drives public schedule/matches/judges.  
11. **Errors/limits:** **Unpublish is not supported** (explicit `ConflictError` if regenerating a PUBLISHED bracket: “Unpublish is not supported”). Publish is one-way; republish of already PUBLISHED fails. Eligible = CONFIRMED only (pending payment not included).

---

## 6. Matches door

1. **Feature name:** Match schedule, results, judge credentials  
2. **Purpose:** Run day-of operations: schedule mats/times, record/correct results, issue judge logins.  
3. **Navigation path:** `/admin/events/[id]/matches`  
4. **Permissions:** `ADMIN` (`listMatchesForEvent`, `updateMatchSchedule`, `recordMatchResult`, `correctMatchResult`, judge credential service).  
5. **Step-by-step ops:** Tabs Upcoming / Completed → for both-competitor matches: Schedule → Generate/Regenerate/Revoke judge credentials → Record result when SCHEDULED → Correct if COMPLETED and downstream not decided.  
6. **Fields/actions:** Schedule: `scheduledAt`, `mat`, optional conflict override. Result: winner registration + method. Correct: winner, method, reason. Judge panel: one-time username/password reveal.  
7. **Validation:** Both competitors required to schedule/result; result only from SCHEDULED; method required; correct needs reason and `canCorrectResult` (next match not decided). Judge issue requires **published** bracket + both competitors.  
8. **Backend ops:** `matchService.updateMatchSchedule` (conflict detection), `recordMatchResult` / `correctMatchResult` (advances winner), `judgeCredentialService.generate|regenerate|revoke`. Emails/WhatsApp may fire on schedule updates. Audits `MATCH_*`, `JUDGE_CREDENTIALS_*`.  
9. **DB changes:** Update `Match`; insert/update `MatchJudgeCredential` / revoke sessions; correction history array.  
10. **Outcome:** Live bracket progression and mat officials access.  
11. **Errors/limits:** Schedule conflicts block unless `allowConflicts`. Judge credentials blocked if bracket unpublished. Reminders warn if no `scheduledAt`. BYE matches have no result UI. Live scoring via judges is separate (`scoringService`); admin UI here is record/correct dialogs.

---

## 7. Fees & coupons door (+ hub panel)

1. **Feature name:** Payment options (tiers) & coupons  
2. **Purpose:** Configure fee tiers with QRs and single-use coupon codes linked to a tier.  
3. **Navigation path:** `/admin/events/[id]/payments` (also embedded on hub).  
4. **Permissions:** `ADMIN`.  
5. **Step-by-step ops:** Add/edit payment options → upload QR per option → generate coupon (optional custom code / expiry) → copy revealed code → Disable or Release redeemed as needed.  
6. **Fields/actions:** Option: label, amount (major), active, isDefault, QR file. Coupon: paymentOptionId, code optional, expiresAt optional; actions Disable / Release(+reason).  
7. **Validation:** Label required; amount ≥0 minor units; coupon code 4–32 chars; release requires reason; cannot disable REDEEMED (must release).  
8. **Backend ops:** `paymentOptionService.create|update|uploadQr`; `couponService.createCoupon|listCouponsForEvent|disableCoupon|releaseRedeemedCoupon`. Syncs legacy `paymentInstructions` from default option. Audits `PAYMENT_OPTION_*`, `COUPON_*`.  
9. **DB changes:** Nested `Event.paymentOptions`; `Coupon` docs; storage for QR keys.  
10. **Outcome:** Grapplers pay default tier unless coupon selects another.  
11. **Errors/limits:** Coupon code shown once after create. Redeemed → DISABLED on release (not re-AVAILABLE). Global payment **verification** is on `/admin/payments`, not this page.

---

## 8. Scoring rules door

1. **Feature name:** Event scoring rules  
2. **Purpose:** Configure JSON rules judges/admin scoring need before live scoring is ready.  
3. **Navigation path:** `/admin/events/[id]/scoring-rules`  
4. **Permissions:** `ADMIN` (`updateEventScoringRules`).  
5. **Step-by-step ops:** Edit JSON (`configured`, points, penalties, outcomes) → Save.  
6. **Fields/actions:** Freeform `rulesJson`; reference list of allowed submissions (display only).  
7. **Validation:** Must parse as JSON with `configured` boolean; if `configured: true`, `isScoringRulesReady` (outcomes required; points required if `winByHighestScore`).  
8. **Backend ops:** `scoringService.updateEventScoringRules`; audit `EVENT_SCORING_RULES_UPDATED`.  
9. **DB changes:** `Event.scoringRules`.  
10. **Outcome:** Judges can score when rules ready.  
11. **Errors/limits:** **JSON editor only** (no structured UI builder). New events start `configured: false`.

---

## 9. Grapplers roster

1. **Feature name:** Grapplers roster  
2. **Purpose:** Searchable list of fighter profiles for desk review.  
3. **Navigation path:** `/admin/grapplers?q=`  
4. **Permissions:** `ADMIN` (`listFightersForAdmin`).  
5. **Step-by-step ops:** Optional search → open sheet.  
6. **Fields/actions:** Client filter on displayName, email, academy, cityState, userId. Thumb photo via `/api/v1/admin/grapplers/[userId]/photo`.  
7. **Validation:** N/A.  
8. **Backend ops:** `fighterService.listFightersForAdmin` (profiles + emails).  
9. **DB changes:** None.  
10. **Outcome:** Navigate to registration sheet.  
11. **Errors/limits:** Search is in-memory filter after full list load (no server pagination). **No admin create/edit/delete of profiles** from this UI (read + open).

---

## 10. Grappler detail (registration sheet)

1. **Feature name:** Grappler registration sheet  
2. **Purpose:** Read-only mirror of personal, competition, medical, terms; private ID / parental consent images.  
3. **Navigation path:** `/admin/grapplers/[userId]`  
4. **Permissions:** `ADMIN` (`getFighterForAdmin`). Private media routes require admin session.  
5. **Step-by-step ops:** Open sheet → review sections and images.  
6. **Fields/actions:** Display of profile fields (DOB, mobile, academy, belt, medical flags, waiver, etc.). Images: photo, aadhaar, parental consent via admin API routes.  
7. **Validation:** Invalid/missing id → `notFound()`.  
8. **Backend ops:** `fighterService.getFighterForAdmin`; storage open via API routes.  
9. **DB changes:** None.  
10. **Outcome:** Desk can verify identity/medical completeness.  
11. **Errors/limits:** **Read-only** — no admin edit of grappler data here. Parental consent called out when age &lt; 18 and missing.

---

## 11. Payments queue (verification)

1. **Feature name:** Payment verification queue  
2. **Purpose:** Manually approve/reject UTR + screenshot submissions.  
3. **Navigation path:** `/admin/payments` (+ filters `status`, `event`, `q`, `from`, `to`)  
4. **Permissions:** `ADMIN` only — **no separate verifier role**.  
5. **Step-by-step ops:** Filter queue → Review → check screenshot/UTR (duplicate flag) → Approve or Reject (reason required).  
6. **Fields/actions:** Status chips: All / PENDING_REVIEW / APPROVED / REJECTED / AWAITING_SUBMISSION. Review dialog: screenshot from `/api/v1/admin/payments/[id]/screenshot`, optional approve note, required reject note.  
7. **Validation:** Decide only while `PENDING_REVIEW`; reject note non-empty.  
8. **Backend ops:** `listPaymentQueue`, `approvePayment` / `rejectPayment` → registration `CONFIRMED` / `REJECTED` + seat claim/release; email fighter; audits `PAYMENT_APPROVED` / `PAYMENT_REJECTED`.  
9. **DB changes:** `PaymentSubmission` status/reviewer fields; `Registration` status + history; division `filledCount` as needed.  
10. **Outcome:** Confirmed registrations become bracket-eligible.  
11. **Errors/limits:** Queue hard cap **200**. Duplicate UTR is advisory only. Already decided → conflict. See also `02-verification.md`.

---

## 12. Coupons (via event payments panel)

Covered in **§7 Fees & coupons**. Standalone nav item does not exist; coupons are event-scoped only.

---

## 13. Requests (cancel / transfer)

1. **Feature name:** Cancellation & transfer requests  
2. **Purpose:** Admin decide fighter-submitted CANCELLATION / TRANSFER requests.  
3. **Navigation path:** `/admin/requests`  
4. **Permissions:** `ADMIN` decide; fighters create (`assertFighter`).  
5. **Step-by-step ops:** Review pending row → Approve or Reject with note.  
6. **Fields/actions:** Table: email, type, reason, status; dialog decision + note.  
7. **Validation:** One pending request per registration; transfer target same event, different division, capacity available.  
8. **Backend ops:** `requestService.decideRequest` — cancel → `CANCELLED` + seat release + `refundPercent` (50% if ≥30 days before start, else 0); transfer → claim target / release source + update `divisionId`. Emails fighter. Audit `REGISTRATION_REQUEST_DECIDED` (failure audit on unexpected errors).  
9. **DB changes:** `RegistrationRequest`, `Registration`, division occupancy.  
10. **Outcome:** Spot freed or moved; refund percent recorded on cancellation approval (informational for ops — not an automated payout).  
11. **Errors/limits:** **No automated bank refund.** Concurrent decide → conflict. Target capacity race handled via seat claim.

---

## 14. Rankings (manual + recalculate)

1. **Feature name:** Rankings admin  
2. **Purpose:** Maintain manual ranking entries; recalculate win/loss/points from completed matches.  
3. **Navigation path:** `/admin/rankings`  
4. **Permissions:** `ADMIN`.  
5. **Step-by-step ops:** Add manual entry (name, rank, weight/gender/experience/gym, published) → Remove as needed → Recalculate computed records.  
6. **Fields/actions:** Manual form; remove per entry; `RecalculateRankingsButton`; table of computed `listPublicRankings` (points/wins/losses).  
7. **Validation:** displayName required; rank integer ≥1; gender/experience enums when set.  
8. **Backend ops:** `manualRankingService.upsert|delete|list`; `rankingService.recalculateRankings` (versioned `RankingRecord`). Audits `MANUAL_RANKING_*`, `RANKINGS_RECALCULATED`.  
9. **DB changes:** `ManualRankingEntry`; upsert `RankingRecord`.  
10. **Outcome:** Desk-managed list + refreshed computed records.  
11. **Errors/limits:** **Partially Implemented — public board wiring:** Admin copy says “Public board prefers published manual numbers,” and `listPublishedManualRankings()` exists, but **no caller** uses it. Public `/rankings` uses `listRankingBoardEntries` (confirmed registrations + `RankingRecord`), not `ManualRankingEntry`. Manual entries are stored/admin-visible only until wired. Recalculate can conflict if concurrent version bump. Super Fight assignment is house/manual process, not automated.

---

## 15. Content CMS

1. **Feature name:** Content (FAQ / announcements / policies)  
2. **Purpose:** Publish copy for public FAQ + chatbot keyword engine.  
3. **Navigation path:** `/admin/content?type=`  
4. **Permissions:** `ADMIN`.  
5. **Step-by-step ops:** Create entry → edit → Publish/Unpublish toggle → filter by type.  
6. **Fields/actions:** type `FAQ` | `ANNOUNCEMENT` | `POLICY`; title; body; publicationState DRAFT/PUBLISHED.  
7. **Validation:** Zod create/update — title/body ≥2.  
8. **Backend ops:** `contentService.create|update|setContentPublicationState|listAllContent`. Starter FAQs auto-ensured for public FAQ reads. Audits `CONTENT_*`.  
9. **DB changes:** `ContentEntry`.  
10. **Outcome:** Published FAQ/announcement/policy visible publicly / chatbot.  
11. **Errors/limits:** **No delete content UI.** Unpublish returns to DRAFT (unlike brackets).

---

## 16. Media

1. **Feature name:** Media library  
2. **Purpose:** Register external media URLs with captions for public gallery use.  
3. **Navigation path:** `/admin/media`  
4. **Permissions:** `ADMIN`.  
5. **Step-by-step ops:** Submit caption + URL → appears in list.  
6. **Fields/actions:** caption, externalUrl (optional eventId in service, not exposed in current form).  
7. **Validation:** caption ≥2; valid URL.  
8. **Backend ops:** `mediaService.createMediaAsset` (always `publicationState: "PUBLISHED"`); `listAllMedia`. Audit `MEDIA_CREATED`.  
9. **DB changes:** Insert `MediaAsset`.  
10. **Outcome:** Asset listed for public published queries.  
11. **Errors/limits:** **Partially Implemented:** create + list only — **no edit, delete, unpublish, or file upload** (external URL only). Model has DRAFT/PUBLISHED but create always PUBLISHED.

---

## 17. Settings

1. **Feature name:** Site settings + house name  
2. **Purpose:** Admin greeting name; public footer contact (Instagram, email, phone, city).  
3. **Navigation path:** `/admin/settings`  
4. **Permissions:** `ADMIN`.  
5. **Step-by-step ops:** Save house display name → save public contact.  
6. **Fields/actions:** House name (profile displayName for admin user). Contact: instagramHandle, email, phoneDisplay, phoneTel, city.  
7. **Validation:** `updateSiteSettingsSchema` (handle regex, email optional empty, phone digits, city ≥2). House name length 2–80.  
8. **Backend ops:** `siteSettingsService.get|update`; house name via settings actions / display-name helpers. Audit `SITE_SETTINGS_UPDATED`.  
9. **DB changes:** `SiteSettings` singleton `key: "default"`; admin user’s display name store.  
10. **Outcome:** Public contact + personalized admin greetings.  
11. **Errors/limits:** Defaults seed Instagram `up.n.roll` / city Mumbai if missing.

---

## 18. Outbox / notifications

1. **Feature name:** Failed outbox deliveries  
2. **Purpose:** Inspect and retry durable jobs that exhausted retries (email/reminders/etc.).  
3. **Navigation path:** `/admin/notifications` (nav label **Outbox**)  
4. **Permissions:** `ADMIN` (`listFailedOutboxJobs`, `retryFailedOutboxJob`).  
5. **Step-by-step ops:** Fix underlying issue (SMTP, etc.) → Retry job.  
6. **Fields/actions:** Job type, attempts, runAt, lastError; Retry button.  
7. **Validation:** Only `FAILED` jobs retryable.  
8. **Backend ops:** `outboxService.listFailedOutboxJobs` (limit 50), `retryFailedOutboxJob` → status PENDING.  
9. **DB changes:** `OutboxJob` status/error/runAt.  
10. **Outcome:** Job re-queued for worker processing.  
11. **Errors/limits:** **Failed-only view** — no full outbox browser, no cancel/edit payload UI. Cap 50.

---

## 19. Audit log

1. **Feature name:** Audit log  
2. **Purpose:** Read-only trail of privileged and key user actions.  
3. **Navigation path:** `/admin/audit`  
4. **Permissions:** `ADMIN` (`listAuditLogsPage`).  
5. **Step-by-step ops:** Scroll recent rows (mobile cards / desktop table).  
6. **Fields/actions:** when, action, actor (name·email), targetType/targetId.  
7. **Validation:** N/A.  
8. **Backend ops:** `listAuditLogsPage(actor, { limit: 80 })`. Writes happen across services via `writeAuditLog`.  
9. **DB changes:** None on read; writes are side-effects of other ops.  
10. **Outcome:** Forensics / desk accountability.  
11. **Errors/limits:** **No filters / search / pagination UI** (service supports skip; page uses fixed 80). Detail before/after not shown on this page.

---

## Cross-cutting admin APIs (private bytes)

| Route | Purpose |
| --- | --- |
| `/api/v1/admin/payments/[id]/screenshot` | Payment proof image |
| `/api/v1/admin/events/[id]/payment-qr` | Default event QR |
| `/api/v1/admin/events/[id]/payment-options/[optionId]/qr` | Tier QR |
| `/api/v1/admin/grapplers/[userId]/photo` | Passport photo |
| `/api/v1/admin/grapplers/[userId]/aadhaar` | ID proof |
| `/api/v1/admin/grapplers/[userId]/parental-consent` | Consent image |

All require admin session.

---

## Explicit limitations checklist

| Area | Limitation |
| --- | --- |
| Roles | No VERIFIER / multi-admin ACL beyond ADMIN |
| Bracket | No unpublish; cannot regenerate after publish |
| Events | No delete/archive |
| Divisions | No delete; door page has no edit form |
| Media | No edit/delete/unpublish; URL-only |
| Content | No delete |
| Manual rankings | Stored but **not** consumed by public rankings page |
| Outbox | Failed jobs only |
| Audit | Latest ~80, no filter UI |
| Payments | Queue limit 200; manual UTR check |
| Refunds | Percent recorded on cancel approve; no payout automation |
