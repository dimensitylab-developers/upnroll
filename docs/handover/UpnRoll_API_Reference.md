# Up 'n Roll — API & Server Actions Reference

| Field | Value |
|-------|--------|
| **Project** | Up 'n Roll |
| **Prepared by** | Dimensity Labs |
| **Document version** | 1.0.0 |
| **Date** | 2026-11-27 |
| **Git commit** | `4ffb794` |

---

## 1. Purpose and conventions

This document inventories every HTTP route handler under `frontend/src/app/api/**` and every Server Action in `frontend/src/features/**` as verified against research at commit `4ffb794`.

**Primary mutation surface:** product mutations are implemented as **Server Actions** (`"use server"`), not as REST CRUD endpoints. REST is used mainly for **binary media delivery**, **Google OAuth**, **health**, and **cron**.

**Auth helpers**

| Helper | Use |
|--------|-----|
| `requireActor("ADMIN" \| "GRAPPLER")` | Server Actions / services for User-role portals |
| `getSession()` / `requireSession()` / `requireRole()` | App session (cookie `upnroll_session`) |
| `requireJudgeSession()` | Judge scoring plane (cookie `upnroll_judge_session`) |
| `Authorization: Bearer <CRON_SECRET>` | Cron outbox worker |

**Rate limiting:** in-memory token bucket (`backend/http/rateLimit.ts`) — **10 tokens / 60 seconds per key**, single-process only. Applied to auth (and judge-login) actions; not generally applied to REST media routes.

| Surface | Key pattern | Limit |
|---------|-------------|-------|
| `registerAction` | `register:{clientIp}` | 10 / 60s |
| `loginAction` | `login:{clientIp}` | 10 / 60s |
| `verifyEmailAction` | `verify:{clientIp}` | 10 / 60s |
| `resendCodeAction` | `resend:{clientIp}` | 10 / 60s |
| Judge login | `judge-login:{username}` | 10 / 60s |
| Other actions / API routes | — | none in-process |

Fictional identifiers in examples are placeholders, not live data. Environment secret **values** are never documented here—configure via env only.

---

## 2. REST endpoints

### 2.1 Health and cron

#### `GET /api/health`

| Item | Detail |
|------|--------|
| **Auth** | Public |
| **Purpose** | MongoDB ping for uptime checks |
| **Request** | None |
| **Response 200** | `{ "ok": true }` |
| **Response 503** | `{ "ok": false }` |

#### `GET|POST /api/cron/process-outbox`

| Item | Detail |
|------|--------|
| **Auth** | `Authorization: Bearer <CRON_SECRET>` (responds 503 if secret unset) |
| **Purpose** | Recover stale outbox jobs and process up to 25 due jobs; optional event-day gate unless `?force=1` or Vercel cron user-agent |
| **Request** | Headers only; query `force=1` optional |
| **Response 200** | `{ "ok": true, "skipped": false, "recovered": N, "processed": N, "results": [...] }` |
| **Skipped** | `{ "ok": true, "skipped": true, "reason": "...", "processed": 0 }` |
| **401** | `{ "error": "Unauthorized." }` |

---

### 2.2 Auth (Google OAuth)

#### `GET /api/auth/google`

| Item | Detail |
|------|--------|
| **Auth** | Public |
| **Purpose** | Start Google OAuth; set state/entry/return cookies; redirect to Google |
| **Request** | Query `entry`, optional `from` (safe app path) |
| **Response** | `302` → Google authorize URL, or soft error redirect if OAuth env unset |

#### `GET /api/auth/google/callback`

| Item | Detail |
|------|--------|
| **Auth** | OAuth authorization code + verified state cookie |
| **Purpose** | Exchange code, upsert GRAPPLER user (+ profile if new), create session, redirect |
| **Request** | Query `code`, `state` |
| **Response** | `302` → dashboard / safe return path, or OAuth error path |

OAuth env names (values not listed): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Soft-fails with `?google=unavailable` when unset. Disabled accounts redirect with `?google=disabled`.

---

### 2.3 Public media

#### `GET /api/v1/public/grapplers/[slug]/photo`

| Item | Detail |
|------|--------|
| **Auth** | Public |
| **Purpose** | Serve grappler passport photo by public slug |
| **Response** | Image bytes with `Cache-Control: public, max-age=300, stale-while-revalidate=3600`, or 404 |

---

### 2.4 Grappler private media

Legacy path aliases under `/api/v1/fighter/*` mirror `/api/v1/grappler/*`.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/grappler/photo` | GRAPPLER | Own profile photo |
| GET | `/api/v1/fighter/photo` | GRAPPLER | Legacy alias |
| GET | `/api/v1/grappler/aadhaar` | GRAPPLER | Own identity-proof image (`no-store`) |
| GET | `/api/v1/fighter/aadhaar` | GRAPPLER | Legacy alias |
| GET | `/api/v1/grappler/parental-consent` | GRAPPLER | Own parental consent image |
| GET | `/api/v1/fighter/parental-consent` | GRAPPLER | Legacy alias |

**Typical response:** `200` image stream, or `404` text such as `"No photograph yet."` / `"No identity proof image yet."`

#### `GET /api/v1/grappler/events/[eventId]/payment-qr`

| Item | Detail |
|------|--------|
| **Auth** | Session required. ADMIN may open any event QR; GRAPPLER must own a registration for that event (or pass `?registrationId=` that they own) |
| **Query** | Optional `paymentOptionId`, `registrationId` |
| **Purpose** | Stream payment QR image for the event / option |
| **Response** | Image (`private, max-age=60`) or error JSON via `fail()` |

---

### 2.5 Admin private media

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/admin/grapplers/[userId]/photo` | ADMIN | Grappler photo |
| GET | `/api/v1/admin/grapplers/[userId]/aadhaar` | ADMIN | Identity-proof image |
| GET | `/api/v1/admin/grapplers/[userId]/parental-consent` | ADMIN | Parental consent |
| GET | `/api/v1/admin/events/[id]/payment-qr` | ADMIN | Legacy event-level QR |
| GET | `/api/v1/admin/events/[id]/payment-options/[optionId]/qr` | ADMIN | Payment option QR |
| GET | `/api/v1/admin/payments/[id]/screenshot` | ADMIN | Payment proof screenshot |

**Example (fictional):**

```http
GET /api/v1/admin/payments/665f0a1b2c3d4e5f67890123/screenshot
Cookie: upnroll_session=…
→ 200 image/png (Content-Disposition: inline)
```

---

## 3. Server Actions

All modules below use `"use server"`. The **Auth** column is the first gate in the action; services may assert again (`assertAdmin` / `assertGrappler`).

### 3.1 Auth — `features/auth/actions.ts`

| Action | Auth | Purpose | Rate limit |
|--------|------|---------|------------|
| `registerAction` | Public | Create GRAPPLER + profile stub; send verify code; redirect `/verify` | Yes |
| `loginAction` | Public | Password login; redirect admin or grappler dashboard | Yes |
| `verifyEmailAction` | Public | Confirm email code; create session | Yes |
| `resendCodeAction` | Public | Resend verify code (generic response; no email enumeration) | Yes |
| `logoutAction` | Session optional | Destroy session; redirect `/login` | No |

**Register form fields (typical):** `displayName`, `mobile`, `email`, `password`, `from`.

**Password policy (register):** minimum 10 characters, maximum 200, must include a letter and a number. Login schema requires a non-empty password only.

---

### 3.2 Profile — `features/profile/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `updateProfileAction` | GRAPPLER | Update grappler profile + optional Aadhaar / parental consent uploads |

---

### 3.3 Registrations — `features/registrations/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `createRegistrationAction` | GRAPPLER | Validate/update profile (incl. minor consent), create registration (+ optional coupon), return payment redirect |
| `withdrawRegistrationAction` | ADMIN | Admin cancel active registration; auto-resolve open matches |

---

### 3.4 Payments (grappler) — `features/payments/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `submitPaymentAction` | GRAPPLER | Upload UTR + screenshot for a registration |

**Typical FormData:** `registrationId`, `utr`, `screenshot`.

---

### 3.5 Coupons (grappler) — `features/payments/coupon-actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `applyPaymentCouponAction` | GRAPPLER | Reserve coupon for event (`code` + `reservationIntentId`) and return preview |

---

### 3.6 Payment options & coupons (admin) — `features/payments/admin-actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `createPaymentOptionAction` | ADMIN | Add event payment option |
| `updatePaymentOptionAction` | ADMIN | Edit option (label / amount / active / default) |
| `uploadPaymentOptionQrAction` | ADMIN | Upload QR for an option |
| `createCouponAction` | ADMIN | Issue coupon for option |
| `disableCouponAction` | ADMIN | Disable non-redeemed coupon |
| `releaseRedeemedCouponAction` | ADMIN | Audit-release redeemed coupon (→ DISABLED) |

---

### 3.7 Payment verification — `features/admin-payments/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `approvePaymentAction` | ADMIN | Approve PENDING_REVIEW submission → registration CONFIRMED |
| `rejectPaymentAction` | ADMIN | Reject with required note → registration REJECTED |

---

### 3.8 Requests & teammate transfer — `features/requests/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `createRequestAction` | GRAPPLER | Create CANCELLATION / TRANSFER request |
| `decideRequestAction` | ADMIN | Approve/reject pending request |
| `createTeammateTransferAction` | GRAPPLER | Create/rotate teammate transfer invite (raw token returned once) |
| `claimTeammateTransferAction` | GRAPPLER | Claim invite token → take registration ownership |

---

### 3.9 Events — `features/events/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `createEventAction` | ADMIN | Create event |
| `createDivisionAction` | ADMIN | Create division under event |
| `seedRoadToSuperFightDivisionsAction` | ADMIN | Seed taxonomy grid divisions |
| `updateEventStatusAction` | ADMIN | Change event status |
| `updateEventMatCountAction` | ADMIN | Set mat count |
| `updateEventDetailsAction` | ADMIN | Edit name / venue / dates / etc. |
| `updateDivisionAction` | ADMIN | Edit division fields / capacity / fee override |
| `uploadEventPaymentQrAction` | ADMIN | Upload legacy event-level QR |

---

### 3.10 Brackets — `features/brackets/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `generateBracketAction` | ADMIN | Build single-elim bracket (manual order or random seed) |
| `publishBracketAction` | ADMIN | Publish DRAFT → PUBLISHED (+ schedule reminders) |

**Typical FormData:** `divisionId`, `eventId`, `orderedRegistrationIds`, `mode=random|manual`, `seed`.

---

### 3.11 Matches — `features/matches/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `recordResultAction` | ADMIN | Record winner + method on SCHEDULED match |
| `correctResultAction` | ADMIN | Correct COMPLETED result if next match undecided |
| `updateScheduleAction` | ADMIN | Set `scheduledAt` / mat (conflict check) |

---

### 3.12 Judge credentials — `features/matches/judge-credential-actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `generateJudgeCredentialsAction` | ADMIN | Issue once; returns username/password once |
| `regenerateJudgeCredentialsAction` | ADMIN | Revoke old + issue new generation |
| `revokeJudgeCredentialsAction` | ADMIN | Revoke active credentials + sessions |
| `fetchJudgeCredentialMeta` | ADMIN | Active credential meta without password |

---

### 3.13 Judge scoring — `features/judge/actions.ts`

Judge is **not** a `User.role`. Access uses a separate credential + cookie session.

| Action | Auth | Purpose |
|--------|------|---------|
| `judgeLoginAction` | Public credentials | Login with match username/password → judge cookie |
| `judgeLogoutAction` | Judge session | Destroy judge session |
| `loadJudgeScoringConsole` | Judge session | Load match scoring state for UI |
| `judgeScorePointAction` | Judge session | Apply POINT/PENALTY with idempotency + version |
| `judgeUndoScoreAction` | Judge session | Undo last eligible score event |
| `judgeFinalizeAction` | Judge session | Official finalize with outcome code |

---

### 3.14 Scoring rules — `features/scoring/admin-actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `saveScoringRulesAction` | ADMIN | Persist event `scoringRules` config |

---

### 3.15 Rankings — `features/rankings/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `recalculateRankingsAction` | ADMIN | Recompute RankingRecord from COMPLETED/BYE matches |
| `upsertManualRankingAction` | ADMIN | Create/update ManualRankingEntry |
| `deleteManualRankingAction` | ADMIN | Delete manual entry |

---

### 3.16 Notifications — `features/notifications/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `markNotificationReadAction` | GRAPPLER | Mark one notification read |
| `markAllNotificationsReadAction` | GRAPPLER | Mark all read |
| `retryOutboxJobAction` | ADMIN | Retry failed/stuck outbox job |

---

### 3.17 Settings — `features/settings/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `updateSiteSettingsAction` | ADMIN | Update SiteSettings contact card |
| `updateHouseNameAction` | ADMIN | Update house display name (session ADMIN check) |

---

### 3.18 Media — `features/media/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `createMediaAction` | ADMIN | Create MediaAsset (caption + external URL) |

---

### 3.19 Content — `features/content/actions.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `createContentAction` | ADMIN | Create FAQ / announcement / policy entry |
| `publishContentAction` | ADMIN | Publish content entry |
| `updateContentAction` | ADMIN | Edit title / body / type |

---

### 3.20 Chatbot — `features/chatbot/ask-chatbot-action.ts`

| Action | Auth | Purpose |
|--------|------|---------|
| `askChatbotAction` | Public | Keyword-match published FAQs (**no LLM**); human-help pattern returns contact email |

**Example (fictional):**

```ts
await askChatbotAction("What is the weigh-in time?");
// → { answer: "…from FAQ body…", matched: true }
```

---

## 4. Module → service map

| Feature module | Primary backend services |
|----------------|--------------------------|
| auth | session, password, verificationMail, User / FighterProfile |
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

## 5. Auth & security notes (API-relevant)

| Topic | Behaviour |
|-------|-----------|
| App session cookie | `upnroll_session` — httpOnly, sameSite lax, secure in production; HMAC-packed token; SHA-256 hash stored in Mongo |
| Judge session cookie | `upnroll_judge_session` — 12-hour max age; bound to credential generation |
| Proxy (`frontend/src/proxy.ts`) | Cookie **presence** redirects for UX only; layouts and actions re-verify session + role |
| Layout gates | Admin / grappler layouts redirect by role; judge layout does **not** role-redirect (proxy + page/actions enforce) |
| Error shape | Route `fail()` → `{ success: false, error: { code, message } }`; unknown errors → generic client message |
| Upload validation | Magic-byte image detection (PNG/JPEG/WebP); size caps; path traversal blocked on local disk |
| Cron | Never expose `CRON_SECRET` values; header shape only |

**Actors:** Public · Grappler (`User.role=GRAPPLER`) · Admin (`ADMIN`) · Judge-credential (separate plane, not a User role). Legacy Mongo role `FIGHTER` is normalized to `GRAPPLER` on read.

---

## 6. Handover notes

1. Most product mutations are **Server Actions**, not REST.
2. `/api/v1/fighter/*` mirrors `/api/v1/grappler/*` for legacy path compatibility.
3. Judge flows use a **separate cookie session** from User sessions.
4. There is no general-purpose REST CRUD product API; App Router + Server Actions are the primary surface.
5. Rate limiting is **single-instance** (in-memory); multi-instance deployments need an external limiter for auth endpoints.

---

*End of API & Server Actions Reference — Dimensity Labs · v1.0.0 · 2026-11-27 · `4ffb794`*
