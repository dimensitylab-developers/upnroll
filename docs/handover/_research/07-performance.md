# 07 — Performance research

Agent 7 notes. **Only what exists in code/docs measurements.** No invented Lighthouse / CWV scores.

---

## 1. Cache Components (Next.js 16)

**[Verified]** `frontend/next.config.ts`:

```ts
cacheComponents: true,
partialPrefetching: true, // required with Cache Components on 16.4.x — avoids shared-shell poisoning
```

Public reads use `"use cache"` + `cacheLife("minutes")` + `cacheTag(...)` in `frontend/src/lib/public-reads.ts` (events, divisions, brackets, schedule/results, rankings, fighters, content, media, site contact).

After mutations, Server Actions call `invalidatePublicTags` → `updateTag` (`frontend/src/lib/public-tags.ts`).

**CI short-circuit:** when `process.env.CI === "true"`, cached public helpers return empty lists / NotFound so prerender does not need Atlas — **[Verified]** `public-reads.ts`.

**Not cached (by design, per STATUS_UPDATE / code):** sessions, portal data, payments, private files.

---

## 2. `connection()` and React `cache()`

### Request binding

With Cache Components, cookie/DB/`Date.now()` paths must opt into request time via `connection()` from `next/server` before reading dynamic state.

**[Verified]** call sites include (non-exhaustive):

| Area | Path |
|------|------|
| Session entry | `backend/auth/session.ts` — `getSession()` awaits `connection()` then `readSession` |
| Layouts | `(admin)/admin/layout.tsx`, `(grappler)/grappler/layout.tsx`, `(judge)/judge/layout.tsx` |
| Public pages | `(public)/rankings/page.tsx`, `(public)/events/[slug]/page.tsx`, `(public)/grapplers/[slug]/page.tsx` |
| Home pieces | `site-header.tsx`, `home-hero.tsx`, `event-pitch-popup-host.tsx` |
| Cron | `api/cron/process-outbox/route.ts` |
| Preview | `(preview)/ui-preview/page.tsx` |

Session/role-gated layouts also export `export const instant = false` where needed (e.g. admin rankings page, admin layout pattern) so instant prerender is not attempted on cookie-bound portals — **[Verified]** e.g. `frontend/src/app/(admin)/admin/rankings/page.tsx`.

### Request dedupe

**[Verified]** `backend/auth/session.ts`:

- Inner `readSession` wrapped in React `cache()` for per-request dedupe.
- Public API is `getSession()` → `connection()` then `readSession()`.

---

## 3. Database indexes (from models)

Declared in `backend/models/*` (and historically reviewed in `docs/architecture/index-review.md`). Inventory from schemas:

| Model | Indexes (high level) | File |
|-------|----------------------|------|
| `User` | `email` unique | `User.ts` |
| `Session` | `userId`; `tokenHash` unique; TTL on `expiresAt` | `Session.ts` |
| `FighterProfile` / grappler | `userId` unique; `slug` unique; `createdAt`; `displayName` | `FighterProfile.ts` |
| `Event` | `slug` unique | `Event.ts` |
| `Division` | `eventId` | `Division.ts` |
| `Registration` | `userId`, `eventId`, `divisionId`; partial unique `{userId, divisionId}` for active statuses | `Registration.ts` |
| `PaymentSubmission` | `registrationId`, `userId`, `submittedUtr`; `{status, createdAt}` | `PaymentSubmission.ts` |
| `Bracket` | `eventId`; `divisionId` unique | `Bracket.ts` |
| `Match` | `eventId`, `divisionId`, `bracketId`; unique `{bracketId, round, order}`; `status`; `{eventId, status}`; `{eventId, scheduledAt, mat}`; competitor+`scheduledAt` | `Match.ts` |
| `RankingRecord` | `userId` unique; `{points, wins}` desc | `RankingRecord.ts` |
| `ManualRankingEntry` | `{published, rank}`; `{weightBand, gender, rank}` | `ManualRankingEntry.ts` |
| `ContentEntry` | `{type, publicationState}` | `ContentEntry.ts` |
| `RegistrationRequest` | `registrationId`, `userId`; `{status, createdAt}` | `RegistrationRequest.ts` |
| `Coupon` | unique `{code, eventId}`; `{status, reservedUntil}`; `{reservedByUserId, status}` | `Coupon.ts` |
| `OutboxJob` | unique `idempotencyKey`; `{status, runAt}`; type/status/runAt fields indexed | `OutboxJob.ts` |
| `MatchScoreEvent` | unique `{matchId, sequence}`; unique `{matchId, idempotencyKey}` | `MatchScoreEvent.ts` |
| `JudgeSession` | TTL `expiresAt`; `tokenHash` unique | `JudgeSession.ts` |
| `MatchJudgeCredential` | `username` unique; `{matchId, status}` | `MatchJudgeCredential.ts` |
| `Notification` | `{userId, createdAt}`; `{userId, readAt}`; unique `dedupeKey` | `Notification.ts` |
| `TransferInvite` | unique `tokenHash`; `{registrationId, claimedAt}` | `TransferInvite.ts` |
| `SiteSettings` | unique `key` | `SiteSettings.ts` |
| `EmailVerification` | `userId` | `EmailVerification.ts` |

**Phase 6 review** (`docs/architecture/index-review.md`) added Match `status`, ContentEntry compound, RankingRecord sort compound after cross-checking service queries. AuditLog left without secondary indexes (no viewer UI yet).

---

## 4. `next/image` patterns (in code)

Imports of `next/image` found in:

| File | Pattern notes |
|------|----------------|
| `frontend/src/components/layout/brand.tsx` | `BrandMark` uses `Image` width/height 40; wordmark uses plain `<img>` with eslint disable |
| `frontend/src/components/home/about-story.tsx` | `fill`, `sizes`, one `priority` |
| `frontend/src/components/home/event-pitch-popup.tsx` | `fill` + `sizes` |
| `frontend/src/components/home/manga-cards.tsx` | static `/manga/*.jpg` cards via `Image` |
| `frontend/src/components/events/superfight-landing.tsx` | `fill`, `priority`, `sizes="100vw"` |
| `frontend/src/components/events/event-poster.tsx` | `fill`, `priority`, responsive `sizes` |

Private uploads (photos/screenshots) are served via API/storage helpers, **not** through `next/image` optimization pipelines — consistent with Phase 6 performance-pass note.

Homepage video: documented as `preload="metadata"` + poster path in STATUS_UPDATE (confirm in home components if needed); not a Lighthouse claim.

---

## 5. Documented measurements (historical — not re-run this agent)

| Source | Claim | Caveat |
|--------|-------|--------|
| `docs/phases/performance-pass.md` | Build: ~1.5MB uncompressed client JS chunks; largest ~220KB / 204KB; 18 routes; 4 static at that time | Snapshot of a past build; numbers may drift |
| Same | Every data-bearing page is a Server Component; `"use client"` on interactive leaves | Code pattern still holds; not re-grepped page-by-page this pass |
| `docs/STATUS_UPDATE.md` Phase 3 | Client JS dropped ~23,826 bytes after React Query removal; warm prod TTFB/LCP “did not improve” | Historical |
| `docs/qa/PERFORMANCE_OBSERVATIONS.md` | Dev cold compile 3–30s; some routes tens of seconds on `next dev` | **Dev-only**; not production RUM |
| `docs/qa/TEST_MATRIX.md` PERF-01 | Cold `/brackets`/~35s etc. on lab `next dev` | FAIL noted for demo polish; explicitly not prod |

**Explicitly not claimed here:** Lighthouse scores, Core Web Vitals field data, or current gzip transfer sizes. Phase 6 stated no live Lighthouse run.

---

## 6. Other runtime constraints affecting perceived performance

| Item | Citation |
|------|----------|
| Server Actions body size limit `3mb` (passport photos) | `frontend/next.config.ts` `experimental.serverActions` |
| In-memory rate limiter (single process) | `backend/http/rateLimit.ts` |
| Webpack alias pinning mongoose/mongodb for single connection | `frontend/next.config.ts` |
| `DynamicBoundary` Suspense wrapper for session-dependent subtrees | `frontend/src/components/dynamic-boundary.tsx` (architecture docs / CLAUDE.md) |

---

## 7. Guidance for operators

Prefer timing judgments on `npm run build` + `npm run start`, not `next dev` cold compiles (`docs/qa/PERFORMANCE_OBSERVATIONS.md`).
