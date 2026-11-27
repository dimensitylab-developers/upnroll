# 07 — Troubleshooting research

Agent 7 common-issue playbook. Prefer **diagnostics** then **safe fixes** (no destructive DB ops unless owner-approved). Paths are repo-relative.

---

## Login / sessions

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Redirect loop / always `/login` | Missing/invalid session cookie; `SESSION_SECRET` mismatch across deploys | Check env `SESSION_SECRET` length ≥32; compare staging vs prod; inspect `Session` docs vs cookie | Set one stable secret per environment; avoid rotating casually (`docs/deployment/deployment-guide.md`) |
| “Incorrect email or password” | Wrong creds or DISABLED user | Confirm `User.status`; reset via `create-admin` only for admin promotion | Use known seed admin; do not share secrets in tickets |
| “Confirm email before sign in” | Unverified account | Dev: read verification code from server console (`ConsoleEmailAdapter` in `backend/email/console.ts`) | Complete `/verify`; configure SMTP if console unused |
| Admin lands on grappler dashboard | Role not `ADMIN` | Check `User.role` | `npm run create-admin -- --email … --password …` promotes + resets password (`scripts/create-admin.ts`) |
| Hydration Issues badge on auth/nav | Known QA findings | DevTools Issues overlay | Historical BUG-QA-2026-02 / prior nav fixes; distinguish prod vs `next dev` |

Auth gating is per layout (`getSession` / `requireRole` in `(admin)` / `(grappler)` layouts) — no `middleware.ts`; `frontend/src/proxy.ts` is cookie presence only (STATUS_UPDATE).

---

## Registration

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Cannot register / capacity error | Division full or `filledCount` invalid | Check division capacity vs active regs; STATUS notes missing `filledCount` rejects changes | Owner-run `npm run backfill-occupancy` from frontend **after** reading script behavior; never on prod without backup |
| Duplicate registration rejected | Partial unique index on active `{userId, divisionId}` | Expected | Cancel/transfer via requests flow |
| Admin cannot open fighter registration list API | `listOpenDivisionsForRegistration` asserts fighter | Authorization tests | Use grappler account for that path |
| Wrong fee/QR | Event payment QR / fee snapshot not set | Admin event payment settings + `feeSnapshot` / QR storage tests | Configure normal + coupon QR in admin |

---

## Coupons

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Code rejected | Wrong event, already used, expired reservation | `Coupon` status / `reservedUntil` / unique `{code, eventId}` | Issue new single-use coupon; wait reservation TTL (`COUPON_RESERVATION_MINUTES`) |
| Concurrent redeem race | Two fighters same code | Covered by `couponConcurrency.test.ts` | One winner; other sees conflict — expected |
| Abuse / guessing | No rate limit on coupon apply (QA BUG-QA-2026-03) | Inspect `coupon-actions` vs `checkRateLimit` on login | Mitigate at edge/WAF if needed; code gap remains until fixed |

---

## Payments

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Stuck PENDING | Design: manual admin verify only | Admin `/admin/payments` queue | Approve/reject with reason; never expect auto-approve |
| Screenshot upload fails | Size/type; storage driver | 3MB / PNG JPEG WEBP; `STORAGE_DRIVER` in prod | Fix env; retry upload |
| File missing after approve path | Local disk ephemeral (serverless) or wrong driver | Check `STORAGE_DRIVER`; file keys on submission | Prefer `gridfs` on Vercel; restore from backup if disk wiped |
| Duplicate UTR flagged | `paymentQueue` duplicate detection | Index on `submittedUtr` | Investigate genuine duplicate vs typo |
| Email not received after submit/decision | Console adapter or SMTP misconfig | Server logs `[dev email…]`; prod needs five `SMTP_*` | Configure SMTP; verify `instrumentation` startup |

---

## Judge / scoring

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Redirect to `/judge/login` | No judge session cookie | Expected when logged out | Use admin-issued 10-char username/password credentials |
| Invalid username/password | Wrong/expired credential | `MatchJudgeCredential` status + match binding | Regenerate credentials for published match |
| Cannot score after finalize | Match locked | Match/score event state | Correction only via admin match tools (audit trail) |
| Scope errors | Judge session tied to one match | `judge-session.scope.test.ts` | Re-login with correct match creds |

---

## Brackets

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Generate blocked | Published bracket already exists / insufficient confirmed fighters | `bracketService` status checks | Do not invent unpublish; regenerating published may be blocked — confirm in admin UI before force changes |
| Public bracket empty | Bracket still `DRAFT` | `getPublishedBracketForDivision` only `PUBLISHED` | Admin publish |
| Odd n / byes confusing | Single-elim + byes only (OD-003 RR still open) | `bracketEngine` tests | Educate operators; no round-robin engine yet |
| Stale public view after publish | Cache tags | `cacheTag` / `invalidatePublicTags` | Wait `cacheLife("minutes")` or trigger action that updates tags |

---

## Rankings

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Board shows 0–0 / “Champion” odd | Board = confirmed regs + RankingRecord zeros until results; presentation BUG-QA-2026-05 | `/rankings` uses `cachedRankingBoardEntries` | Recalculate after matches; treat formula as provisional (OD-004) |
| Manual admin entries not on public board | **Code gap:** `listPublishedManualRankings` unused by public page | Grep shows admin-only usage | Do not promise manual numbers on `/rankings` until wired |
| Home rankings snippet differs from board | Home uses `cachedPublicRankings()` (RankingRecord sort) | `home-live.tsx` vs rankings page | Expected until product unifies sources |
| Points not updating after match | Recalc is explicit / outbox job | Run admin Recalculate; check outbox cron | Ensure cron secret + workflow/Vercel cron |

---

## Email

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Prod process won’t start | Missing SMTP in production runtime | `frontend/src/instrumentation.ts` + `assertProductionEmailConfig` | Set all five `SMTP_*` |
| Build fails asking for SMTP | Unusual; build should skip via `NEXT_PHASE` | Confirm not forcing production email assert during build | Build without serving runtime |
| Dev codes “not sent” | Console adapter | Server stdout | Copy code from log |
| Gmail auth failures | App password / spaces | `.env.example` strips spaces note | Use app password |

---

## MongoDB

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| App errors / health `ok:false` | Bad URI, network, wrong DB name | `GET /api/health`; URI must include DB path (avoid default `test`) | Fix `MONGODB_URI`; check Atlas IP allowlist **[Owner-confirm]** |
| Transaction test wiped wrong DB | Misconfigured test URI | Tests target isolated DB names | Never point integration tests at prod |
| Duplicate key errors | Unique indexes (email, bracket division, coupon code, etc.) | Read Mongo error + model indexes | Resolve conflicting document; do not drop indexes casually |

---

## Deploy / storage / cron

| Symptom | Likely cause | Diagnostics | Safe fix |
|---------|--------------|-------------|----------|
| Prod boot: `STORAGE_DRIVER must be set…` | Unset in production | `backend/storage/factory.ts` | Set `gridfs` or `local` |
| Photos/screenshots 404 on Vercel | `local` on ephemeral FS | Storage keys vs adapter | Switch to GridFS + migrate/backfill keys (`backfill-gridfs-keys` script — **Owner-confirm** before run) |
| Cron 401/503 | Bad/missing `CRON_SECRET` | `api/cron/process-outbox/route.ts` | Align secret with Vercel + GH Actions secrets |
| Outbox skipped always | Off event day without `force` | Response `{ skipped: true, reason }` | Use Vercel daily force or `?force=1`; enable GH workflow on fight day |
| Vercel install fails resolving mongoose | Root vs frontend modules | `vercel.json` installCommand + ensure-root-modules | Keep installCommand; don’t remove webpack aliases in `next.config.ts` |
| `/ui-preview` 404 in staging | `UI_PREVIEW_ENABLED` not `true` | Preview page `connection()` gate | Set env only on authorized staging |

---

## Rollback-oriented safe actions

1. Redeploy last known-good commit/deployment.  
2. Restore Mongo from verified dump into **non-prod first** (`docs/deployment/backup-restore.md`).  
3. Disable GH outbox workflow if jobs misbehave.  
4. Rotate `SESSION_SECRET` only when intentional full logout is acceptable.

---

## Related QA bug IDs (historical)

`docs/qa/BUG_REPORT.md`, `docs/qa/TEST_MATRIX.md`: BUG-QA-2026-01 (missing event HTTP 200), -02 hydration, -03 coupon rate limit, -04 cold dev perf, -05 rankings presentation.
