# Database Index Review

Phase 6. Every model's declared indexes cross-referenced against the actual query patterns in `src/server/services/*.ts` — not a generic "add indexes everywhere" pass. Three gaps found and fixed during this review (not just logged); everything else below was already correctly indexed.

## Fixed this phase

| Model | Index added | Query it serves |
|---|---|---|
| `Match` | `{ status: 1 }` | `rankingService.recalculateRankings` scans every decided match collection-wide (`Match.find({ status: { $in: ["COMPLETED", "BYE"] } })`) — was a full collection scan as match volume grows. |
| `ContentEntry` | `{ type: 1, publicationState: 1 }` compound | `contentService.listPublished(type)` filters on both fields together on every public FAQ/announcement/policy page load, and on every chatbot question (FAQ lookup runs per message). |
| `RankingRecord` | `{ points: -1, wins: -1 }` compound | `rankingService.listPublicRankings` sorts by both on every load of the admin and public rankings pages. |

## Already correctly indexed (confirmed, not assumed)

| Model | Index | Reasoning |
|---|---|---|
| `User` | `email` unique | Every login/register does `User.findOne({ email })`. |
| `Session` | `tokenHash` unique, `userId`, `{ expiresAt: 1 }` TTL | Every authenticated request looks up by `tokenHash`; the TTL index is what actually expires old sessions at the DB level rather than relying on application cleanup. |
| `FighterProfile` | `userId` unique, `slug` unique | 1:1 with User; public profile lookups are by slug. |
| `Event` | `slug` unique | Every public event page is `getEventBySlug`. |
| `Division` | `eventId` | `listDivisionsForEvent` and the bracket/registration flows all filter by event. |
| `Registration` | `userId`, `eventId`, `divisionId`, plus the partial-unique `{userId, divisionId}` on active statuses | The partial index is the real integrity guarantee behind "no duplicate active registration in a division" — a DB-level guard, not just an application-level check. |
| `PaymentSubmission` | `registrationId`, `userId`, `submittedUtr` | Registration/user lookups are the common case; the UTR index backs `paymentQueue.ts`'s duplicate-reference flagging. |
| `Bracket` | `eventId`, `divisionId` unique | One bracket per division is enforced at the DB level, not just in `bracketService.generateBracket`'s application check. |
| `Match` | `eventId`, `divisionId`, `bracketId`, `{bracketId, round, order}` unique | The compound unique index is what actually prevents two matches from colliding on the same bracket slot — the real guarantee behind the bracket-addressing scheme in `bracketEngine.ts`. |
| `RegistrationRequest` | `registrationId`, `userId` | `requestService.createRequest`'s duplicate-pending check and both list functions. |

## Reviewed, no index added (reasoning recorded, not just skipped silently)

- **`AuditLog`** — no indexes beyond `_id`. There's no admin audit-log viewer UI yet (`docs/architecture/route-map.md` lists it `[later]`), so there's no query pattern to index against yet. Revisit when that UI is built — likely `{ actorId: 1, createdAt: -1 }` and `{ targetType: 1, targetId: 1 }`.
- **`MediaAsset`** — `publicationState` isn't indexed. Expected collection size (admin-curated media) is small enough that a collection scan is fine; revisit if this ever needs to scale past a few hundred entries.
- **`RegistrationRequest`** on `{registrationId, status}`** compound — the existing single-field `registrationId` index already narrows to a handful of documents per registration before the `status` filter applies; a compound index would be marginal at current scale, not worth the extra index-maintenance cost yet.

## Note on write amplification

Every index added here is a write-time cost (each insert/update touches every index on that collection), not just a free performance win — kept this list to the three gaps an actual service query pattern needed, rather than speculatively indexing every field that might someday be queried.
