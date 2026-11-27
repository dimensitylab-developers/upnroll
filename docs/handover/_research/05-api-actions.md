# 05 — API routes & Server Actions

Auth helpers: `requireActor("ADMIN"|"GRAPPLER")`, `getSession()`, `requireJudgeSession()`, cron `Authorization: Bearer CRON_SECRET`.  
Rate limiting: in-memory token bucket (`backend/http/rateLimit.ts`) — **10 tokens / 60s per key**, single-process only. Used on auth actions (not REST routes generally).

Fictional examples below use placeholder IDs/values — not live data.

---

## Rate limiting summary

| Surface | Key pattern | Limit |
|---|---|---|
| `registerAction` | `register:{clientIp}` | 10 / min burst |
| `loginAction` | `login:{clientIp}` | same |
| `verifyEmailAction` | `verify:{clientIp}` | same |
| `resendCodeAction` | `resend:{clientIp}` | same |
| Other actions / API routes | none in-process | — |

---

## API `route.ts` endpoints

### Health & cron

#### `GET /api/health`
- **Auth:** public  
- **Purpose:** Mongo ping for uptime checks  
- **Request:** none  
- **Response (200):** `{ "ok": true }`  
- **Response (503):** `{ "ok": false }`

#### `GET|POST /api/cron/process-outbox`
- **Auth:** `Authorization: Bearer <CRON_SECRET>` (503 if secret unset)  
- **Purpose:** Recover stale outbox jobs + process up to 25 due jobs; optional event-day gate unless `?force=1` or Vercel cron UA  
- **Request:** headers only; query `force=1` optional  
- **Response (200):**  
  `{ "ok": true, "skipped": false, "recovered": 0, "processed": 2, "results": [...] }`  
- **Skipped:** `{ "ok": true, "skipped": true, "reason": "...", "processed": 0 }`  
- **401:** `{ "error": "Unauthorized." }`

---

### Auth (Google OAuth)

#### `GET /api/auth/google`
- **Auth:** public  
- **Purpose:** Start Google OAuth; set state/entry/return cookies; redirect to Google  
- **Request:** query `entry`, optional `from` (safe app path)  
- **Response:** `302` → Google authorize URL (or error redirect if OAuth unset)

#### `GET /api/auth/google/callback`
- **Auth:** OAuth code + verified state cookie  
- **Purpose:** Exchange code, upsert GRAPPLER user (+ profile if new), create session, redirect  
- **Request:** query `code`, `state`  
- **Response:** `302` → app dashboard / return path, or oauth error path

---

### Public media

#### `GET /api/v1/public/grapplers/[slug]/photo`
- **Auth:** public  
- **Purpose:** Serve grappler passport photo by public slug  
- **Response:** image bytes (`Cache-Control: public, max-age=300, stale-while-revalidate=3600`) or 404

---

### Grappler private media (aliases under `/fighter/` still present)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/grappler/photo` | GRAPPLER | Own profile photo |
| GET | `/api/v1/fighter/photo` | GRAPPLER | Legacy alias → same |
| GET | `/api/v1/grappler/aadhaar` | GRAPPLER | Own Aadhaar image (`no-store`) |
| GET | `/api/v1/fighter/aadhaar` | GRAPPLER | Legacy alias |
| GET | `/api/v1/grappler/parental-consent` | GRAPPLER | Own parental consent image |
| GET | `/api/v1/fighter/parental-consent` | GRAPPLER | Legacy alias |

**Example response:** `200` image stream, or `404` text `"No photograph yet."` / `"No identity proof image yet."`

#### `GET /api/v1/grappler/events/[eventId]/payment-qr`
- **Auth:** session required; ADMIN can open any event QR; GRAPPLER must own a registration for that event (or pass `?registrationId=` that they own)  
- **Query:** optional `paymentOptionId`, `registrationId`  
- **Purpose:** Stream payment QR image for the event / option  
- **Response:** image (`private, max-age=60`) or error JSON via `fail()`

---

### Admin private media

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/admin/grapplers/[userId]/photo` | ADMIN | Grappler photo |
| GET | `/api/v1/admin/grapplers/[userId]/aadhaar` | ADMIN | Aadhaar image |
| GET | `/api/v1/admin/grapplers/[userId]/parental-consent` | ADMIN | Parental consent |
| GET | `/api/v1/admin/events/[id]/payment-qr` | ADMIN | Legacy event QR |
| GET | `/api/v1/admin/events/[id]/payment-options/[optionId]/qr` | ADMIN | Payment option QR |
| GET | `/api/v1/admin/payments/[id]/screenshot` | ADMIN | Payment proof screenshot |

**Fictional example — payment screenshot:**

```http
GET /api/v1/admin/payments/665f0a1b2c3d4e5f67890123/screenshot
Cookie: session=…
→ 200 image/png (Content-Disposition: inline; proof headers)
```

---

## Server Actions (by feature module)

All modules use `"use server"`. Roles below are the first gate in the action (service may assert again).

### `features/auth/actions.ts` — public / session

| Action | Auth | Purpose | Rate limit |
|---|---|---|---|
| `registerAction` | public | Create GRAPPLER + profile stub; send verify code; redirect `/verify` | yes |
| `loginAction` | public | Password login; redirect admin or grappler dashboard | yes |
| `verifyEmailAction` | public | Confirm email code; create session | yes |
| `resendCodeAction` | public | Resend verify code (generic response) | yes |
| `logoutAction` | session optional | Destroy session; redirect `/login` | no |

**Fictional form fields (register):** `displayName`, `mobile`, `email`, `password`, `from`

---

### `features/profile/actions.ts` — GRAPPLER

| Action | Purpose |
|---|---|
| `updateProfileAction` | Update grappler profile + optional Aadhaar / parental consent uploads |

---

### `features/registrations/actions.ts`

| Action | Auth | Purpose |
|---|---|---|
| `createRegistrationAction` | GRAPPLER | Validate/update profile (incl. minor consent), create registration (+ optional coupon), return payment redirect |
| `withdrawRegistrationAction` | ADMIN | Admin cancel active registration; auto-resolve open matches |

---

### `features/payments/actions.ts` — GRAPPLER

| Action | Purpose |
|---|---|
| `submitPaymentAction` | Upload UTR + screenshot for a registration |

**Fictional:** FormData `registrationId`, `utr`, `screenshot` → success revalidate payment page / error string.

---

### `features/payments/coupon-actions.ts` — GRAPPLER

| Action | Purpose |
|---|---|
| `applyPaymentCouponAction` | Reserve coupon for event (`code` + `reservationIntentId`) and return preview |

---

### `features/payments/admin-actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `createPaymentOptionAction` | Add event payment option |
| `updatePaymentOptionAction` | Edit option (label/amount/active/default) |
| `uploadPaymentOptionQrAction` | Upload QR for an option |
| `createCouponAction` | Issue coupon for option |
| `disableCouponAction` | Disable non-redeemed coupon |
| `releaseRedeemedCouponAction` | Audit-release redeemed coupon (→ DISABLED) |

---

### `features/admin-payments/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `approvePaymentAction` | Approve PENDING_REVIEW submission → registration CONFIRMED |
| `rejectPaymentAction` | Reject with required note → registration REJECTED |

---

### `features/requests/actions.ts`

| Action | Auth | Purpose |
|---|---|---|
| `createRequestAction` | GRAPPLER | Create CANCELLATION / TRANSFER request |
| `decideRequestAction` | ADMIN | Approve/reject pending request |
| `createTeammateTransferAction` | GRAPPLER | Create/rotate teammate transfer invite (raw token once) |
| `claimTeammateTransferAction` | GRAPPLER | Claim invite token → take registration ownership |

---

### `features/events/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `createEventAction` | Create event |
| `createDivisionAction` | Create division under event |
| `seedRoadToSuperFightDivisionsAction` | Seed taxonomy grid divisions |
| `updateEventStatusAction` | Change event status |
| `updateEventMatCountAction` | Set mat count |
| `updateEventDetailsAction` | Edit name/venue/dates/etc. |
| `updateDivisionAction` | Edit division fields / capacity / fee override |
| `uploadEventPaymentQrAction` | Upload legacy event-level QR |

---

### `features/brackets/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `generateBracketAction` | Build single-elim bracket (manual order or random seed) |
| `publishBracketAction` | Publish DRAFT → PUBLISHED (+ schedule reminders) |

**Fictional FormData:** `divisionId`, `eventId`, `orderedRegistrationIds` (comma ids), `mode=random|manual`, `seed`

---

### `features/matches/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `recordResultAction` | Record winner + method on SCHEDULED match |
| `correctResultAction` | Correct COMPLETED result if next match undecided |
| `updateScheduleAction` | Set `scheduledAt` / mat (conflict check) |

---

### `features/matches/judge-credential-actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `generateJudgeCredentialsAction` | Issue once; returns username/password once |
| `regenerateJudgeCredentialsAction` | Revoke old + issue new generation |
| `revokeJudgeCredentialsAction` | Revoke active credentials + sessions |
| `fetchJudgeCredentialMeta` | Active credential meta without password |

---

### `features/judge/actions.ts` — Judge session (not User role)

| Action | Auth | Purpose |
|---|---|---|
| `judgeLoginAction` | public credentials | Login with match username/password → judge cookie |
| `judgeLogoutAction` | judge session | Destroy judge session |
| `loadJudgeScoringConsole` | judge session | Load match scoring state for UI |
| `judgeScorePointAction` | judge session | Apply POINT/PENALTY with idempotency + version |
| `judgeUndoScoreAction` | judge session | Undo last eligible score event |
| `judgeFinalizeAction` | judge session | Official finalize with outcome code |

---

### `features/scoring/admin-actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `saveScoringRulesAction` | Persist event `scoringRules` config |

---

### `features/rankings/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `recalculateRankingsAction` | Recompute RankingRecord from COMPLETED/BYE matches |
| `upsertManualRankingAction` | Create/update ManualRankingEntry |
| `deleteManualRankingAction` | Delete manual entry |

---

### `features/notifications/actions.ts`

| Action | Auth | Purpose |
|---|---|---|
| `markNotificationReadAction` | GRAPPLER | Mark one notification read |
| `markAllNotificationsReadAction` | GRAPPLER | Mark all read |
| `retryOutboxJobAction` | ADMIN | Retry failed/stuck outbox job |

---

### `features/settings/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `updateSiteSettingsAction` | Update SiteSettings contact card |
| `updateHouseNameAction` | Update house display name (session ADMIN check) |

---

### `features/media/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `createMediaAction` | Create MediaAsset (caption + external URL) |

---

### `features/content/actions.ts` — ADMIN

| Action | Purpose |
|---|---|
| `createContentAction` | Create FAQ/announcement/policy entry |
| `publishContentAction` | Publish content entry |
| `updateContentAction` | Edit title/body/type |

---

### `features/chatbot/ask-chatbot-action.ts` — public

| Action | Purpose |
|---|---|
| `askChatbotAction` | Keyword-match published FAQs (no LLM); human-help pattern returns contact email |

**Fictional:**

```ts
await askChatbotAction("What is the weigh-in time?");
// → { answer: "…from FAQ body…", matched: true }
```

---

## Grouping map (module → primary backend services)

| Feature module | Services |
|---|---|
| auth | session, password, verificationMail, User/FighterProfile |
| profile / registrations | fighterService, profilePhoto, registrationService, couponService |
| payments* | paymentService, paymentOptionService, couponService |
| requests | requestService, teammateTransfer |
| events | eventService, divisionTaxonomy |
| brackets / matches | bracketService, matchService, judgeCredentialService |
| judge / scoring | scoringService, judge-session auth |
| rankings | rankingService, manualRankingService |
| notifications | notificationService, outboxService |
| settings / media / content / chatbot | siteSettingsService, mediaService, contentService, chatbotEngine |

---

## Notes for handover

1. Most product mutations are **Server Actions**, not REST. REST is mainly **binary media delivery**, OAuth, health, and cron.
2. `/api/v1/fighter/*` mirrors `/api/v1/grappler/*` for legacy path compatibility.
3. Judge flows use a **separate cookie session** from User sessions.
4. Cron must never expose `CRON_SECRET` in docs beyond the header shape; configure via env only.
