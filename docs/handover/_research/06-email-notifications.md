# 06 — Email & notifications

Research for Up 'n Roll handover. Verified against `backend/email/*`, `backend/notifications/*`, `backend/services/{verificationMail,paymentService,requestService,matchService,notificationService,reminderService,outboxService,scoringService}.ts`, and cron route.

---

## 1. Transport: Nodemailer / SMTP

| Item | Detail |
|------|--------|
| Adapter factory | `getEmailAdapter()` in `backend/email/console.ts` |
| SMTP impl | `createSmtpAdapter` → `nodemailer.createTransport` (`backend/email/smtp.ts`) |
| Config | `readSmtpSettings` / `requireSmtpSettings` (`smtp-config.ts`) |
| Env names | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| Pass handling | Whitespace stripped (Gmail app-password paste) |
| Secure | `secure: true` when port === 465 |
| Timeouts | connect 15s, greeting 15s, socket 30s |
| Selection | If all five SMTP vars set → real SMTP (including local `npm run dev`). Else: **console adapter** in non-production; production runtime throws (fail closed). |
| Boot assert | `frontend/src/instrumentation.ts` calls `assertProductionEmailConfig()` on Node runtime |
| Vendor | Vendor-agnostic Nodemailer (docs may mention SMTP2GO; code does not hardcode a vendor) |

**Console adapter:** logs `[dev email — not sent]` — no delivery. Never used in production when config is complete; production without SMTP refuses to start.

**Site URL in templates:** `getPublicSiteUrl()` (`backend/email/templates/site.ts`) prefers `NEXT_PUBLIC_SITE_URL`, then Vercel URLs, else `http://localhost:3000`.

---

## 2. Templates — locations

| File | Role |
|------|------|
| `backend/email/templates/layout.ts` | Shared HTML shell |
| `backend/email/templates/simple.ts` | `simpleEmail({ subject, badge, headline, greeting?, paragraphs, cta?, preheader })` — most transactional mail |
| `backend/email/templates/tournament-confirmed.ts` | Payment **approved** confirmation card |
| `backend/email/templates/escape.ts` | HTML escaping helpers |
| `backend/email/templates/site.ts` | Public absolute URLs + contact constant |
| `backend/email/greeting.ts` | `greetingLine(name)` |
| `backend/email/types.ts` | `EmailAdapter` / message types |

There is no separate React email package — HTML strings built in TypeScript.

---

## 3. Outbox job types

Defined in `backend/models/OutboxJob.ts`:

| Type | Processor | Purpose |
|------|-----------|---------|
| `MATCH_REMINDER` | `reminderService.processMatchReminderJob` | 10‑min / starting-soon reminders → in-app + email |
| `MATCH_SCHEDULE_CHANGED` | `notificationService.processScheduleChangedNotifyJob` | In-app schedule change (email not in this processor) |
| `MATCH_RESULT_NOTIFY` | `notificationService.processMatchResultNotifyJob` | In-app + email after result (enqueued from scoring) |
| `RANKINGS_RECALC` | `rankingService.recalculateRankingsSystem` | Post-result rankings (not a user notification) |
| `EMAIL_DISPATCH` | **No-op stub** in `processOutboxJob` | Reserved / optional; “handled inside notification helpers” |

**Statuses:** `PENDING` → `PROCESSING` → `DONE` | `FAILED` | `CANCELLED` | `SUPERSEDED`.

**Reliability:**

- Unique `idempotencyKey`; duplicate enqueue returns existing  
- `supersedeOutboxJobsByPrefix` for stale reminders / schedule keys  
- Default `maxAttempts: 5`; exponential backoff capped at 30 min  
- `recoverStaleProcessingJobs` (default 5 min) for crashed workers  
- Cron: `GET|POST /api/cron/process-outbox` with `Authorization: Bearer CRON_SECRET`; event-day gate unless `?force=1` or Vercel cron UA  

Admin UI: `/admin/notifications` (Outbox) — list failed jobs + `retryFailedOutboxJob`.

---

## 4. In-app notifications

| Item | Detail |
|------|--------|
| Model | `backend/models/Notification.ts` |
| Types | `MATCH_REMINDER_10M`, `MATCH_STARTING_SOON`, `MATCH_SCHEDULE_CHANGED`, `MATCH_CANCELLED`, `MATCH_RESULT`, `PAYMENT_DECISION`, `GENERIC` |
| Dedupe | Unique `dedupeKey` |
| Grappler API | `listMyNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `countUnreadNotifications` |
| Admin | `listNotificationsForAdmin`; outbox retry via notifications actions |
| UI | `/grappler/notifications` |

**Note:** `PAYMENT_DECISION` and `MATCH_CANCELLED` are schema enums; payment decisions currently send **email only** (no `Notification.create` in `paymentService`). Schedule-changed outbox job writes **in-app only** (immediate schedule update in `matchService` also sends email + WhatsApp mock separately).

---

## 5. WhatsApp

`backend/notifications/whatsapp.ts` — **mock only** (`console.log`). Called from `matchService` on schedule updates. Not production delivery.

---

## 6. Trigger matrix

| Event / trigger | Recipient | Channel | Action / content |
|-----------------|-----------|---------|------------------|
| User registers | New grappler | Email | Verification code (`sendVerificationCode`) |
| Resend verification | Unverified grappler | Email | New code (if still unverified) |
| Email verified | Grappler | Email | Welcome (`simpleEmail`) |
| Payment submitted | Grappler | Email | “Payment submission received” (not confirmation) |
| Payment approved | Grappler | Email | `tournamentConfirmedEmail` |
| Payment rejected | Grappler | Email | Rejection + reason; decision commits even if mail fails |
| Cancel/transfer request decided | Grappler | Email | Approved/rejected + note/refund % |
| Match schedule updated (admin) | Both competitors | Email + WhatsApp mock | “Your bout is scheduled…” immediate send |
| Match schedule version bump | Both competitors | Outbox → **in-app** | `MATCH_SCHEDULE_CHANGED` |
| Bracket publish / schedule reminder | Both competitors | Outbox `MATCH_REMINDER` → **in-app + email** | 10 min before or “starting soon” |
| Match result finalized (scoring) | Both competitors | Outbox `MATCH_RESULT_NOTIFY` → **in-app + email** | Result method posted |
| Result side effect | System | Outbox `RANKINGS_RECALC` | Rankings engine (no user message) |

---

## 7. Failure handling

| Failure | Behaviour |
|---------|-----------|
| SMTP missing in production | Process boot / adapter throws — no silent console send |
| SMTP missing in development | Console adapter logs message |
| Verification / welcome send errors | Propagate to caller (register/verify can fail) |
| Payment decision email | try/catch; log; **do not** roll back decision |
| Match result email inside outbox job | Inner catch swallows send error; **job** still can complete if createNotification succeeds — comment notes delivery not claimed; prefer treating SMTP throw carefully (current code catches per-user send) |
| Outbox processor throw | `lastError` truncated 500 chars; retry with backoff until `maxAttempts` → `FAILED` |
| Stuck `PROCESSING` | Cron recovery resets to `PENDING` |
| Admin retry | `retryFailedOutboxJob` → `PENDING` + `runAt=now` |
| WhatsApp | Always “succeeds” (log only) |
| Duplicate notification | Unique `dedupeKey` → return existing doc |
| Superseded reminders | Prefix supersede when schedule changes |

---

## 8. Implemented vs gaps

**Implemented:** Nodemailer adapter, console fallback, production assert, HTML templates, verification + payment + request + bout/reminder/result mail, durable outbox with idempotency/backoff, grappler inbox, admin outbox retry.

**Gaps / recommendations:**

- Wire or remove unused `EMAIL_DISPATCH` and unused notification types (`PAYMENT_DECISION`, `MATCH_CANCELLED`)  
- Align schedule-change: either outbox email too, or document that only the immediate `matchService` send covers email  
- Real WhatsApp/SMS provider if fight-day SMS is required  
- Dead-letter alerting (email/Slack) when jobs hit `FAILED`  
- Queue metrics / observability beyond console logger  
