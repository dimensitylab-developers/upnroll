# Database Integrity Report — Phase 2

Date: 2026-11-09  
Branch: `suraj`

## Issues addressed

| Issue | Original | Change | Files | Improvement |
|-------|----------|--------|-------|-------------|
| Unbounded payment queue | `PaymentSubmission.find()` all rows | Status filter at query + limit 200 | `paymentService.ts` | Prevents admin memory/load blowups |
| Client MIME used for storage | `file.type` after validation | Persist `fileCheck.contentType` | `paymentService.ts` | Storage metadata matches bytes |
| Transfer orphaned payment owner | Registration.userId moved; payments kept old userId | `updateMany` payment userId in claim txn | `teammateTransfer.ts` | Payment review ownership stays consistent |
| Concurrent bracket create race | Unique `divisionId` could surface raw duplicate key | Catch `isDuplicateKey` → ConflictError | `bracketService.ts` | Safe conflict message under concurrency |
| Missing compound indexes | Status/queue/transfer/event lookups weaker | Added `{status,createdAt}`, `{registrationId,claimedAt}`, `{eventId,status}` | PaymentSubmission, TransferInvite, Match models | Query efficiency |

## Compatibility notes

- New indexes are schema declarations. In environments with `autoIndex: false`, operators must create them via Atlas UI or `syncIndexes` during a maintenance window. **No destructive migration was executed.**
- Transfer invite field is now `tokenHash` (Phase 1). Legacy plaintext `token` documents are ignored by lookups.

## Remaining limitations

- Payment queue duplicate-UTR flagging only sees the bounded page of rows (most recent 200 matching the filter).
- Ranking recalculation still reads all COMPLETED/BYE matches (indexed by status, but unbounded by design).
- Occupancy backfill remains an operator script (pre-existing production readiness item).
