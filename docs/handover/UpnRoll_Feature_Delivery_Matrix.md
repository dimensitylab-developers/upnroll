# Up 'n Roll — Feature Delivery Matrix

| Field | Value |
|-------|--------|
| **Project** | Up 'n Roll |
| **Prepared by** | Dimensity Labs |
| **Document version** | 1.0.0 |
| **Date** | 2026-11-27 |
| **Git commit** | `4ffb794` |

---

## 1. Purpose

This matrix inventories product capabilities verified from codebase research under `docs/handover/_research/` at commit `4ffb794`. It does **not** invent features or close open decisions by assumption.

**Audience:** engineering leads, client stakeholders, and operators receiving the Dimensity Labs handover pack.

---

## 2. Status legends

### Implementation status

| Value | Meaning |
|-------|---------|
| **Implemented** | Feature is present end-to-end in UI and/or services as described |
| **Partially Implemented** | Core path exists with documented gaps, stubs, or incomplete wiring |
| **Not Implemented** | Explicitly absent (e.g. password reset) |
| **Unable to Verify** | Research could not confirm presence or behaviour from available evidence |

### Testing status

Drawn from `07-testing.md` for this handover pass:

| Value | Meaning |
|-------|---------|
| **Covered** | Automated Vitest evidence exists for the feature area |
| **Not Tested** | Manual / browser UAT was **not** re-executed in this research pass (or no automated suite covers the surface) |

Historical Phase 6 / E2E reports are **lab evidence from earlier dates**, not current sign-off. Re-run `npm test` and staging smoke before go-live.

### Open-decision / gap references

Limitations incorporate `07-limitations.md` and open decisions (OD-xxx) where they affect delivery honesty.

---

## 3. Summary counts

| Module | Rows | Implemented | Partially | Not Implemented |
|--------|------|-------------|-----------|-----------------|
| Public | 14 | 11 | 3 | 0 |
| Auth | 7 | 5 | 1 | 1 |
| Grappler | 12 | 12 | 0 | 0 |
| Admin | 16 | 14 | 2 | 0 |
| Judge | 6 | 5 | 1 | 0 |
| Brackets & matches | 8 | 6 | 0 | 2 |
| Payments | 8 | 7 | 1 | 0 |
| Rankings | 5 | 3 | 2 | 0 |
| Content & media | 6 | 4 | 1 | 1 |
| Notifications | 7 | 5 | 2 | 0 |
| Security | 8 | 7 | 0 | 1 |

*Partially includes stubs and wiring gaps; see Known limitations per row.*

---

## 4. Feature matrix

### 4.1 Public

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-PUB-001 | Public | Marketing home | Landing with hero, next-event strip, how-to-enter, gallery, about, FAQ strip | Implemented | Not Tested | Events cache, content/FAQ | `(public)/page.tsx`, `cachedPublicEvents` | — |
| FEAT-PUB-002 | Public | About | Brand / story page with featured event | Implemented | Not Tested | Public events | `(public)/about/page.tsx` | — |
| FEAT-PUB-003 | Public | Events list & detail | Upcoming board + per-slug landing (live/held/superfight variants) | Implemented | Not Tested | Event model, public reads | `(public)/events/**` | Missing resource may return HTTP 200 with not-found UI (BUG-QA-2026-01) |
| FEAT-PUB-004 | Public | Public brackets | Published brackets per division for an event | Implemented | Covered (bracketEngine) | PUBLISHED Bracket | `events/[slug]/brackets`, `cachedPublishedBracket` | Only single-elim; unpublished not shown |
| FEAT-PUB-005 | Public | Public results | Results table from public match reads | Implemented | Covered (match-related) | Completed matches | `events/[slug]/results` | — |
| FEAT-PUB-006 | Public | Public schedule | Schedule + call board with live refresh cues | Implemented | Covered (publicSchedule) | Match schedule | `events/[slug]/schedule` | — |
| FEAT-PUB-007 | Public | Live brackets hub | Focus-event live board at `/brackets` | Implemented | Not Tested | Published brackets | `(public)/brackets/page.tsx` | — |
| FEAT-PUB-008 | Public | Held archive | Static held-event record via fixture map | Implemented | Not Tested | `HELD_ARCHIVE` fixtures | `events/held/[slug]` | Fixture-based, not live DB archive |
| FEAT-PUB-009 | Public | Rankings board | Public `/rankings` by experience level | Partially Implemented | Covered (rankingEngine unit) | CONFIRMED regs + RankingRecord | `rankings/page.tsx`, `listRankingBoardEntries` | Manual rankings **not** wired; `wins*3` placeholder (OD-004); treat as provisional |
| FEAT-PUB-010 | Public | Seeding demo | Non-indexed seeding walkthrough | Implemented | Covered (seeding helpers) | Demo fixtures | `/rankings/demo` | `robots: noindex` |
| FEAT-PUB-011 | Public | Grappler public profile | Shareable athlete card by slug | Implemented | Covered (profilePhoto rules) | GrapplerProfile | `/grapplers/[slug]` | Private fields omitted |
| FEAT-PUB-012 | Public | Grapplers directory | Directory entry at `/grapplers` | Partially Implemented | Not Tested | — | `/grapplers` → redirect `/rankings` | Redirect stub only |
| FEAT-PUB-013 | Public | FAQ / policies / announcements | CMS-backed public boards | Implemented | Covered (starterFaqs, home-faq) | ContentEntry PUBLISHED | `/faq`, `/policies`, `/announcements` | OD-010 content approval process open |
| FEAT-PUB-014 | Public | Store & Seminars | Merchandise / seminars surfaces | Partially Implemented | Not Tested | — | `/store`, `/seminars` | `<ComingSoon />` stubs only |

---

### 4.2 Auth

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-AUTH-001 | Auth | Email/password register | Create GRAPPLER only; profile stub; verification email | Implemented | Covered (schemas, session) | SMTP or console adapter, User, GrapplerProfile | `registerAction`, `(auth)/register` | Admins never via public register |
| FEAT-AUTH-002 | Auth | Email verification | 6-digit hashed code, 15 min TTL; session on success | Implemented | Covered | EmailVerification, verificationMail | `verifyEmailAction`, `/verify` | Delivery depends on SMTP (unproven in standing docs) |
| FEAT-AUTH-003 | Auth | Login / logout | Password login with ACTIVE + verified checks; logout destroys session | Implemented | Covered | Session, password scrypt | `loginAction`, `logoutAction` | Generic credential errors |
| FEAT-AUTH-004 | Auth | Google OAuth | Optional OAuth start/callback; soft-fail if unset | Partially Implemented | Covered (oauth-state unit) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `/api/auth/google*` | Soft-fail without creds; typically BLOCKED in UAT without config |
| FEAT-AUTH-005 | Auth | Password reset | Self-service password reset | Not Implemented | Not Tested | — | E2E / TEST_MATRIX AUTH-05 | Explicit product gap |
| FEAT-AUTH-006 | Auth | Auth rate limiting | In-memory 10/60s on register/login/verify/resend | Implemented | Covered (rateLimit) | `backend/http/rateLimit.ts` | auth actions | Single-process only; not multi-instance safe |
| FEAT-AUTH-007 | Auth | Admin bootstrap | CLI provisions ADMIN users | Implemented | Not Tested | `ADMIN_SEED_*` env for CLI | `scripts/create-admin.ts` | Not a public API |

---

### 4.3 Grappler portal

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-GRP-001 | Grappler | Grappler desk | Dashboard: next bout, active reg, alerts, card preview | Implemented | Covered (dashboard parse) | dashboardService | `/grappler/dashboard` | — |
| FEAT-GRP-002 | Grappler | Profile management | Full sheet: personal, competition, medical, waiver, uploads | Implemented | Covered (profilePhoto, schemas) | fighterService, storage | `/grappler/profile` | — |
| FEAT-GRP-003 | Grappler | Identity & minor consent uploads | Passport photo, Aadhaar/ID, parental consent for under-18 | Implemented | Covered (file validation) | storage adapter | profile / registration forms | Max 1.5 MB; magic-byte types |
| FEAT-GRP-004 | Grappler | Discover & register | Open divisions; eligibility; seat claim; fee snapshot | Implemented | Covered (state machine, eligibility, feeSnapshot) | Event REGISTRATION_OPEN, Division | `/grappler/registrations/new` | Weight bounds stored but not scale-enforced at register |
| FEAT-GRP-005 | Grappler | My registrations | List seats with status badges → payment | Implemented | Covered (registration tests) | Registration | `/grappler/registrations` | — |
| FEAT-GRP-006 | Grappler | Payment desk | QR, optional coupon, UTR + screenshot submit | Implemented | Covered (paymentQueue, schemas) | PaymentSubmission, feeSnapshot | `/grappler/registrations/[id]/payment` | Manual UPI — no card gateway |
| FEAT-GRP-007 | Grappler | My matches | Privacy-scoped assigned matches only | Implemented | Covered (matchPrivacy) | matchService | `/grappler/matches` | — |
| FEAT-GRP-008 | Grappler | Cancel / transfer requests | Grappler creates CANCELLATION or TRANSFER; admin decides | Implemented | Covered (requestService) | RegistrationRequest | `/grappler/requests` | Refund % recorded only; no automated payout (OD-007/008) |
| FEAT-GRP-009 | Grappler | Teammate transfer | Token invite; claimant completes form and takes seat | Implemented | Covered (teammateTransfer) | TransferInvite | `/grappler/transfer/[token]` | Raw token shown once to owner |
| FEAT-GRP-010 | Grappler | In-app alerts | List / mark read / unread count | Implemented | Covered (outbox recovery related) | Notification | `/grappler/notifications` | See notifications module gaps |
| FEAT-GRP-011 | Grappler | Portal layout gate | Session required; non-GRAPPLER → `/admin` | Implemented | Covered (session/actor) | getSession | `(grappler)/layout.tsx` | Proxy is UX-only |
| FEAT-GRP-012 | Grappler | Legacy fighter URLs | `/fighter/*` permanent redirect to `/grappler/*` | Implemented | Not Tested | next.config redirects | `next.config.ts` | Naming debt in code remains |

---

### 4.4 Admin

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-ADM-001 | Admin | Admin desk | Stats, pending money/requests, presence, audit snippets | Implemented | Not Tested | dashboardService | `/admin` | Feeds capped (e.g. 5 pending payments) |
| FEAT-ADM-002 | Admin | Events CRUD (create/edit/status) | Create DRAFT; hub edits; status/mats/overview | Implemented | Not Tested | eventService | `/admin/events`, `/admin/events/[id]` | **No delete/archive event** |
| FEAT-ADM-003 | Admin | Divisions | Seed Road-to-Super-Fight grid; create custom; hub edit | Implemented | Covered (tournamentRules / taxonomy usage) | divisionTaxonomy | `/admin/events/[id]/divisions` | **No delete division UI**; door page edit limited |
| FEAT-ADM-004 | Admin | Grapplers roster & sheet | Searchable list + read-only registration sheet + private images | Implemented | Not Tested | fighterService, admin media APIs | `/admin/grapplers` | No admin create/edit/delete profiles; in-memory filter |
| FEAT-ADM-005 | Admin | Payment verification queue | Approve/reject UTR + screenshot | Implemented | Covered (paymentQueue, authz) | paymentService | `/admin/payments` | Queue hard cap 200; duplicate UTR advisory only; **no VERIFIER role** |
| FEAT-ADM-006 | Admin | Fees & coupons | Payment options, QR upload, coupon issue/disable/release | Implemented | Covered (coupon logic/concurrency) | paymentOptionService, couponService | `/admin/events/[id]/payments` | Coupon code shown once; released redeemed → DISABLED |
| FEAT-ADM-007 | Admin | Requests review | Decide cancel/transfer with note | Implemented | Covered (requestService) | requestService | `/admin/requests` | Refund informational only |
| FEAT-ADM-008 | Admin | Scoring rules editor | JSON rules for judge scoring readiness | Implemented | Covered (scoringService.logic, tournamentRules) | Event.scoringRules | `/admin/events/[id]/scoring-rules` | JSON editor only — no structured builder |
| FEAT-ADM-009 | Admin | Matches ops | Schedule, record/correct results, judge credentials panel | Implemented | Covered (matchService) | matchService, judgeCredentialService | `/admin/events/[id]/matches` | Dual path vs judge finalize (see brackets) |
| FEAT-ADM-010 | Admin | Rankings admin | Manual CRUD + recalculate computed records | Partially Implemented | Covered (rankingEngine) | rankingService, manualRankingService | `/admin/rankings` | Admin copy claims public prefers manual; **public page ignores manual** |
| FEAT-ADM-011 | Admin | Content CMS | Create/edit/publish/unpublish FAQ/announcement/policy | Implemented | Covered (starterFaqs) | contentService | `/admin/content` | **No delete content UI**; OD-010 process open |
| FEAT-ADM-012 | Admin | Media library | Caption + external URL create + list | Partially Implemented | Not Tested | mediaService | `/admin/media` | No edit/delete/unpublish/file upload; create always PUBLISHED |
| FEAT-ADM-013 | Admin | Site settings | House name + public contact card | Implemented | Not Tested | siteSettingsService | `/admin/settings` | Defaults seed Instagram/city if missing |
| FEAT-ADM-014 | Admin | Outbox retry | List failed jobs; retry | Implemented | Covered (outboxRecovery) | outboxService | `/admin/notifications` | Failed-only view; cap 50 |
| FEAT-ADM-015 | Admin | Audit log viewer | Read-only recent privileged actions | Implemented | Not Tested | AuditLog | `/admin/audit` | Latest ~80; no filter/search UI; before/after not shown |
| FEAT-ADM-016 | Admin | Layout RBAC | ADMIN-only portal; others redirected | Implemented | Covered (authorization.security) | getSession | `(admin)/layout.tsx` | No multi-admin ACL beyond ADMIN |

---

### 4.5 Judge

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-JDG-001 | Judge | Credential issue | Admin generates one-time username/password for published match | Implemented | Covered (judge-session.scope) | MatchJudgeCredential | judge-credential-actions | Password revealed once; PUBLISHED bracket + both competitors |
| FEAT-JDG-002 | Judge | Regenerate / revoke | Kill sessions; bump generation or revoke without replacement | Implemented | Covered | judgeCredentialService | same | Blocked if COMPLETED/CANCELLED/BYE |
| FEAT-JDG-003 | Judge | Judge login | Separate cookie session; rate-limited per username | Implemented | Covered | judge-session | `/judge/login` | PENDING matches not login-eligible even if creds issuable |
| FEAT-JDG-004 | Judge | Scoring console | Points/penalties from event rules; undo; finalize | Implemented | Covered (scoringService.logic) | scoringRules ready | `/judge`, judge actions | Requires configured rules; optimistic concurrency |
| FEAT-JDG-005 | Judge | Match-scoped authz | Session bound to one matchId + credential generation | Implemented | Covered | assertJudgeCanMutateMatch | judge-session.ts | Shared login ≠ verified person (audit note) |
| FEAT-JDG-006 | Judge | DELAYED status | Enum accepts DELAYED for login/scoring | Partially Implemented | Not Tested | Match.status | Match model, scoring | **No service writer** sets `status = "DELAYED"` (enum-only / partial) |

---

### 4.6 Brackets & matches

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-BRK-001 | Brackets | Single-elim engine | Power-of-two pad, standard seeds, deterministic shuffle, byes | Implemented | Covered (bracketEngine) | — | `bracketEngine.ts` | Format only; OD-003 RR/points open |
| FEAT-BRK-002 | Brackets | Generate DRAFT | Admin manual/random generate for CONFIRMED participants | Implemented | Covered | Bracket, Match | `generateBracketAction` | Eligible = CONFIRMED only |
| FEAT-BRK-003 | Brackets | Publish | DRAFT → PUBLISHED; schedule reminders | Implemented | Covered | outbox reminders | `publishBracketAction` | **Unpublish not supported**; no regenerate after publish |
| FEAT-BRK-004 | Brackets | Winner advance | Fill next slot A/B; SCHEDULED when both set | Implemented | Covered (matchService) | bracket rounds | matchService / scoringService | Dual advance helpers (admin vs scoring) |
| FEAT-BRK-005 | Brackets | Admin record / correct result | Quick result on SCHEDULED; correct if next undecided | Implemented | Covered | canCorrectResult | matches actions | Admin path does not set OFFICIAL score timeline like judge finalize |
| FEAT-BRK-006 | Brackets | Match schedule | scheduledAt + mat with conflict detection | Implemented | Covered | Match | `updateScheduleAction` | Conflicts block unless override |
| FEAT-BRK-007 | Brackets | Round robin / format picker | Alternate tournament formats | Not Implemented | Not Tested | — | OD-003, client deferred | Single-elim only shipped |
| FEAT-BRK-008 | Brackets | Season locks | Season model / post-decision transfer lock | Not Implemented | Not Tested | — | client deferred list | No Season model; transfer after decided match still allowed |

---

### 4.7 Payments

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-PAY-001 | Payments | Manual UPI/QR flow | Fee snapshot; QR stream; UTR + screenshot | Implemented | Covered | storage, PaymentSubmission | paymentService, payment desk | Not a PSP/card gateway |
| FEAT-PAY-002 | Payments | Multi payment options | Event-scoped tiers with amount/QR/default | Implemented | Covered | Event.paymentOptions | paymentOptionService | OD-005 fee amounts open; OD-006 QR artwork client asset |
| FEAT-PAY-003 | Payments | Coupon reserve/redeem | Single-use reserve → redeem into feeSnapshot | Implemented | Covered (coupon concurrency) | Coupon | couponService, applyPaymentCouponAction | Coupon apply **lacks rate limit** (BUG-QA-2026-03) |
| FEAT-PAY-004 | Payments | Admin approve/reject | PENDING_REVIEW → CONFIRMED/REJECTED + emails | Implemented | Covered | registration state machine | admin-payments actions | Decision commits even if email fails |
| FEAT-PAY-005 | Payments | UTR validation | Client/server schema for UTR format | Partially Implemented | Covered (schemas) | payment schemas | `features/payments/schemas.ts` | Validator is **generic placeholder** (OD-005a) |
| FEAT-PAY-006 | Payments | Fee immutability | Snapshot frozen at registration create | Implemented | Covered (feeSnapshot) | Registration.feeSnapshot | registrationService | Later fee edits do not rewrite open submissions |
| FEAT-PAY-007 | Payments | Occupancy with payments | Seat claim on active statuses; release on reject/cancel | Implemented | Covered | Division.filledCount | registrationService | Missing filledCount rejects mutations — backfill required |
| FEAT-PAY-008 | Payments | Private proof delivery | Admin screenshot stream; grappler QR stream | Implemented | Covered (delivery-headers) | storage adapter | admin/grappler payment media routes | GridFS prod readiness owner-confirm (OD-012 / E2E-GRIDFS) |

---

### 4.8 Rankings

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-RNK-001 | Rankings | Computed RankingRecord | Recalc from COMPLETED/BYE; upsert global records | Implemented | Covered (rankingEngine) | Match results | rankingService | Strategy `wins * 3` placeholder (OD-004) |
| FEAT-RNK-002 | Rankings | Outbox auto-recalc | Finalize enqueues RANKINGS_RECALC | Implemented | Covered (outbox) | cron process-outbox | scoringService → outbox | Not every admin quick-result path identical to finalize |
| FEAT-RNK-003 | Rankings | Manual ranking CRUD | Admin upsert/delete published manual entries | Implemented | Not Tested | ManualRankingEntry | manualRankingService, admin UI | Stored/admin-visible only until public wiring |
| FEAT-RNK-004 | Rankings | Public board wiring | Prefer published manual numbers on `/rankings` | Partially Implemented | Not Tested | listPublishedManualRankings | rankings page uses `listRankingBoardEntries` only | **Gap:** `listPublishedManualRankings` unused outside its service |
| FEAT-RNK-005 | Rankings | Home vs board sources | Home strip vs `/rankings` data sources | Partially Implemented | Not Tested | cachedPublicRankings vs board entries | `home-live.tsx`, rankings page | Source split; provisional public points |

---

### 4.9 Content & media

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-CNT-001 | Content | Content CMS | FAQ / ANNOUNCEMENT / POLICY draft→publish | Implemented | Covered | ContentEntry | contentService, `/admin/content` | No delete; OD-010 approval process open |
| FEAT-CNT-002 | Content | Soft unpublish content | Return content to DRAFT | Implemented | Not Tested | setContentPublicationState | content actions | Contrast with media/brackets |
| FEAT-CNT-003 | Content | FAQ chatbot | Deterministic keyword match over published FAQs; no LLM | Implemented | Covered (chatbotEngine) | published FAQs | `askChatbotAction`, ChatbotWidget | Not generative AI |
| FEAT-CNT-004 | Content | Starter FAQs | Auto-ensure starter FAQ content for public | Implemented | Covered (starterFaqs) | content | `backend/content/starterFaqs` | — |
| FEAT-CNT-005 | Content | Media assets | External URL + caption gallery registration | Partially Implemented | Not Tested | MediaAsset | mediaService | No edit/delete/unpublish; always PUBLISHED on create; OD-012 object storage |
| FEAT-CNT-006 | Content | Brand assets / Made in India | Approved photography / footer mark | Not Implemented | Not Tested | OD-014, client deferred | open-decisions | Client deferred (2026-11-14) |

---

### 4.10 Notifications

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-NTF-001 | Notifications | In-app inbox | Types for reminders, schedule, results, etc. | Implemented | Covered | Notification model | notificationService, grappler alerts | — |
| FEAT-NTF-002 | Notifications | Mark read | One / all read actions | Implemented | Not Tested | Notification.readAt | notifications actions | — |
| FEAT-NTF-003 | Notifications | Match reminders | Outbox MATCH_REMINDER → in-app + email | Implemented | Covered (outbox) | cron, SMTP | reminderService | Needs cron + SMTP for delivery |
| FEAT-NTF-004 | Notifications | Result notify | MATCH_RESULT_NOTIFY after finalize | Implemented | Covered | scoring finalize | outbox processor | — |
| FEAT-NTF-005 | Notifications | Schedule change | Outbox in-app + immediate email/WhatsApp mock from matchService | Partially Implemented | Not Tested | OutboxJob, matchService | notificationService | Channels diverge; WhatsApp is **console mock only** |
| FEAT-NTF-006 | Notifications | Payment decision in-app | PAYMENT_DECISION notification type | Partially Implemented | Not Tested | Notification enum | paymentService | Schema type exists; payment decisions currently **email-only** |
| FEAT-NTF-007 | Notifications | SMTP transport | Nodemailer adapter; prod fail-closed; console in non-prod without SMTP | Implemented | Covered (smtp unit/config) | SMTP_* env | `backend/email/*` | Inbox delivery **unproven** in standing docs (P0) |

---

### 4.11 Security

| Feature ID | Module | Name | Description | Implementation | Testing | Dependencies | Source refs | Known limitations |
|------------|--------|------|-------------|----------------|---------|--------------|-------------|-------------------|
| FEAT-SEC-001 | Security | Session auth | HMAC cookie + hashed Mongo token; fixation rotation | Implemented | Covered (session, cookies) | SESSION_SECRET | `backend/auth/session.ts` | 30-day max age; no MFA |
| FEAT-SEC-002 | Security | Password hashing | scrypt + timing-safe verify | Implemented | Covered (password) | — | `backend/auth/password.ts` | — |
| FEAT-SEC-003 | Security | RBAC depth | Proxy → layout → requireActor → service assert* | Implemented | Covered (authorization.security) | roles ADMIN/GRAPPLER | layouts, actor | Proxy presence-only |
| FEAT-SEC-004 | Security | Upload hardening | Magic bytes, size caps, path traversal block, nosniff | Implemented | Covered (file-validation, storage keys) | STORAGE_DRIVER | storage adapters | Prod must set STORAGE_DRIVER explicitly |
| FEAT-SEC-005 | Security | Security headers + CSP | HSTS, DENY frame, nosniff, Permissions-Policy; CSP Report-Only | Implemented | Not Tested | next.config | `frontend/next.config.ts` | CSP **not enforcing** until nonce/hash strategy |
| FEAT-SEC-006 | Security | Auth rate limits | Token bucket on unauth auth endpoints | Implemented | Covered | rateLimit | auth + judge login | Not Redis/distributed |
| FEAT-SEC-007 | Security | Safe error exposure | toAppError / fail(); generic 500s | Implemented | Covered (errors) | http helpers | route handlers | — |
| FEAT-SEC-008 | Security | External error monitoring | Sentry/Datadog-style ops monitoring | Not Implemented | Not Tested | — | deployment-guide | P1 ops gap |

---

## 5. Cross-cutting gaps (from limitations research)

Priority labels from `07-limitations.md`. Nothing below is an approved production default.

### P0 — production / integrity

| Item | Impact on matrix |
|------|------------------|
| Hosting / integrations (OD-012) | Object storage, email provider, hosting still owner decisions |
| SMTP delivery unproven | FEAT-NTF-007 / auth verify delivery confidence |
| Backup ownership + retention (OD-011) | Payment screenshots PII-adjacent |
| Multi-instance + in-memory rate limit / local disk | FEAT-SEC-006, FEAT-PAY-008 |
| GridFS production readiness | Adapter exists; owner-confirm before relying on `STORAGE_DRIVER=gridfs` |
| Occupancy backfill | Missing `filledCount` can reject registration mutations |

### P1 — product / polish (selected)

| Item | Related Feature IDs |
|------|---------------------|
| Ranking methodology OD-004 + manual board unwired | FEAT-RNK-001…005, FEAT-PUB-009 |
| No bracket unpublish | FEAT-BRK-003 |
| Media no unpublish/update | FEAT-CNT-005, FEAT-ADM-012 |
| Store / Seminars stubs | FEAT-PUB-014 |
| Password reset absent | FEAT-AUTH-005 |
| Coupon apply without rate limit | FEAT-PAY-003 |
| Missing public resource HTTP 200 | FEAT-PUB-003 |
| CSP Report-Only | FEAT-SEC-005 |
| Formats beyond single-elim (OD-003) | FEAT-BRK-007 |

### P2 — deferred / exclusions

| Item | Notes |
|------|-------|
| Audit filter UI | FEAT-ADM-015 |
| Real WhatsApp | FEAT-NTF-005 |
| REST CRUD product API | Mutations are Server Actions (by design) |
| Champion entity | Presentation only; no separate model |
| `/ui-preview` in production | Env-gated; leave disabled |
| Live pen-test / Lighthouse standing gates | Not standing CI gates |

---

## 6. Testing inventory snapshot

| Item | Value |
|------|-------|
| Automated test files (research pass) | **50** `*.test.ts` |
| Runner | Vitest via `npm test` (frontend vitest; `@/server/*` → backend) |
| Manual UAT this pass | **Not Tested** (browser rows not re-executed) |
| Standing Playwright/Cypress job | **Not retained** in-repo |
| Historical Phase 6 / E2E | Treat as historical confidence only |

Primary automated coverage clusters: auth/session/HTTP; registration/payments/coupons; brackets/matches/scoring; rankings/requests/chatbot/outbox; storage/email/validation; selected frontend schemas.

---

## 7. How to interpret for go-live

1. Treat **Implemented + Covered** as engineering confidence for unit/service behaviour — still require staging smoke for UI and SMTP.
2. Treat **Partially Implemented** rows as **must-disclose** to the client before claiming production completeness.
3. Close OD rows only with **explicit client sign-off + date**; engineering must not close by assumption (`open-decisions.md`).
4. Re-run `npm test`, production build, and a fresh UAT against `docs/qa/CLIENT_UAT_CHECKLIST.md` before handover sign-off.

---

*End of Feature Delivery Matrix — Dimensity Labs · v1.0.0 · 2026-11-27 · `4ffb794`*
