# Phase 5 — Rankings, Content, and Support

Date: 2026-11-02. Scope: fighter public profiles, a swappable ranking engine, admin content management (FAQ/announcements/policies), a media placeholder, a bounded rule-based chatbot, and cancellation/transfer requests with admin review.

## Phase summary

Fighters now have an editable profile (display name, gym, discipline) and a public profile page showing their real win/loss record and match history, derived from actual completed matches — not invented. Rankings are computed by a swappable strategy; the shipped default is an explicitly-labeled placeholder (3 points per win) since the real methodology (OD-004) is still pending — the engine, the data pipeline, and both the admin and public ranking pages are fully built and waiting for a real formula to drop in. Admins can publish FAQs, announcements, and policies, and add media entries (external URL only — real storage is still OD-012). A site-wide chatbot widget answers questions by keyword-matching against published FAQs only, with an honest fallback for anything it can't match — no LLM involved. Fighters can request a cancellation or transfer on an active registration; admins review and decide, with the registration's actual state updated on approval and a decision email sent either way.

## Actual files changed

**Models**: `src/server/models/{RankingRecord,ContentEntry,MediaAsset,RegistrationRequest}.ts`, `FighterProfile.ts` (extended with `gym`/`discipline`)
**Pure engines**: `src/server/services/{rankingEngine,chatbotEngine}.ts`
**Services**: `src/server/services/{rankingService,fighterService,contentService,mediaService,requestService}.ts`
**Features**: `src/features/{profile,content,media,requests,rankings,chatbot}/**`
**Admin routes**: `src/app/(admin)/admin/{content,media,requests,rankings}/page.tsx`
**Fighter routes**: `src/app/(fighter)/fighter/{profile,requests}/page.tsx`
**Public routes**: `src/app/{fighters,fighters/[slug],rankings,faq,announcements,policies}/page.tsx`
**Global**: `src/app/layout.tsx` (mounts `ChatbotWidget`)
**Tests**: `src/server/services/{rankingEngine,chatbotEngine}.test.ts`
**Docs**: `docs/architecture/{data-model,route-map}.md`, `docs/product/scope-matrix.md`, `docs/decisions/open-decisions.md`

## Architectural decisions

- **Ranking is global per fighter, not per-division.** Dividing by division would require a stable weight-class/discipline taxonomy that OD-001/OD-002 haven't settled — `Division` documents are event-scoped, so "Lightweight" in one event and "Lightweight" in another are different documents with no guaranteed relationship. Ranking by a category that isn't stable yet would be worse than not ranking by category at all.
- **The ranking formula is a named, swappable function** (`winLossPointsStrategy`), not inlined math — every place it's surfaced (admin page, public page, docs) says "placeholder pending OD-004" so nobody downstream mistakes it for an approved methodology.
- **Chatbot is deterministic keyword matching, not an LLM integration.** Picking an AI provider is its own OD-012-class infra/cost decision I'm not authorized to make unilaterally; a rule-based matcher against admin-curated, published content satisfies Part D #9's actual requirement ("approved FAQs... clear limits and safe fallbacks") without introducing that dependency.
- **`MediaAsset` stores an external URL, not an uploaded file** — same reasoning as the QR payment screen's placeholder from Phase 3: real object storage/CDN is still OD-012, so this doesn't pretend to be a finished upload pipeline.
- **`RegistrationRequest` approval applies the real state change** (cancellation → `Registration.status = CANCELLED`; transfer → `Registration.divisionId` changes, after a same-event + capacity check) rather than being a request log with no teeth. No invented eligibility windows or fees — OD-007 is still open, and the UI says so directly to the fighter submitting a request.
- **Caught before the build, not after**: wrote `createContentSchema` to import `CONTENT_TYPES` from the Mongoose-backed `ContentEntry` model, then reused that same import path from a client-facing `<Select>` component — same class of bug as Phase 4's `event-status.ts` mistake. Caught it by pattern-matching against that prior fix *before* running the build this time, and split out a client-safe `content-types.ts` constants module from the start. Re-ran the whole-codebase `"use client"` + `@/server/` grep after finishing — zero violations.
- **Radix `<Select>` form-bubbling gap recurred** (content-type picker) — same fix as Phase 4's participant-order form: a controlled `value`/`onValueChange` pair mirrored into a hidden `<input>`, since Radix Select doesn't bubble to native `FormData` on its own.

## Functional verification

- `npm run lint` — clean (one warning surfaced and fixed: `recalculateRankingsAction` takes no meaningful arguments, which tripped `no-unused-vars` differently than the two-argument actions elsewhere once both parameters were unused — resolved with a scoped single-line disable, not a blanket one).
- `npm run test` — **81/81 passing** (11 new: `rankingEngine.test.ts` covers win/loss computation from mixed decided/undecided matches and the placeholder points formula; `chatbotEngine.test.ts` covers an obviously-relevant match, a case/punctuation-insensitive match, a correctly-null unrelated question, empty-FAQ-list handling, and — the one I actually hand-traced before trusting it — picking the higher-overlap FAQ when a question partially matches two entries).
- `npm run build` — passes, 34 routes total. Confirmed `/` stays statically prerendered even with the new site-wide `ChatbotWidget` mounted in the root layout (it's a client component with no server data dependency, so it doesn't force the shell dynamic) — this was the specific thing I checked for given Phase 4's public-page static/dynamic lesson.
- `scripts/seed-demo.ts` re-smoke-tested after the new models were added — same fail-fast/connects-then-times-out behavior, no import regressions.
- Whole-codebase scan for `"use client"` files importing `@/server/**` — zero violations (including the one caught and fixed during this phase, described above).

## Known limitations (stated plainly)

- **Still no live database in this sandbox** — same constraint as every phase. Recalculating rankings against real matches, submitting and deciding a real cancellation/transfer request, and the chatbot matching against real published FAQs are all verified at the pure-function/unit level, not as a live end-to-end run. First thing to verify once a MongoDB URI exists.
- No public `/media` listing page — `MediaAsset` creation and admin listing exist, but nothing public renders them yet (wasn't in the approved Phase 5 route plan; add when there's actual approved media to show).
- No dedicated notification record — acknowledgement/decision emails go straight through the `EmailAdapter` with no persisted history of what was sent to whom, since nothing yet needs to query that independently of the email send itself.
- Chatbot has no conversation memory or multi-turn context — each question is matched independently, which is appropriate for a bounded FAQ matcher but worth naming as a limitation, not an oversight.

## Requirement status

RNK-001, CHB-001, REQ-001, REQ-002 move to "built" in `docs/product/scope-matrix.md`, each with its specific placeholder/deferred piece named rather than glossed over. ADM-001 now covers the full admin surface built across Phases 2–5.

## Next phase dependencies

Phase 6 (production hardening) per Part Q: end-to-end testing, security/accessibility review, API authorization tests, database index review, performance profiling, deployment docs. The single biggest open item carried from every phase is still **a reachable MongoDB** — Phase 6 is also the natural point to finally resolve that, since "production hardening" without a database to hit is a contradiction in terms. OD-001/002/003/004/007/012 remain the client-approval blockers for turning today's generic/placeholder pieces (disciplines, weight classes, bracket formats beyond single-elimination, the ranking formula, cancellation/transfer policy specifics, and real storage/email providers) into the real thing.
