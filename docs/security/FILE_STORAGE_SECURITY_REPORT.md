# File Storage Security Report — Phase 3

Date: 2026-11-09  
Branch: `suraj`

## Issues addressed

| Issue | Original | Change | Improvement |
|-------|----------|--------|-------------|
| Private file routes buffered entire file | Handlers called `storage.get()` then wrapped bytes | Stream via `storage.open()` + `toWebFileStream` | Lower memory; abort destroys stream |
| Screenshot disposition already attachment | Kept / ensured | `paymentProofHeaders` + Content-Length | Download-as-attachment, no sniffing |
| Photo routes used session helpers inconsistently | Fighter route used getSession | `requireActor("FIGHTER")` / ADMIN | Role boundary at handler |
| Admin photo userId unchecked | Raw path param | `requireObjectId` | Reject malformed ids |
| Upload metadata sparse | put without purpose/owner | Metadata on payment + profile puts | GridFS files carry purpose/owner for audit |

## Unchanged by design

- GridFS remains preferred production driver (`STORAGE_DRIVER=gridfs`).
- Local disk remains default outside production.
- No public signed HTTP URLs for private files (`getSignedUrl` returns non-HTTP markers only).
- Magic-byte validation for screenshots/photos already present from earlier phases.

## Orphan handling

- Failed GridFS uploads abort/delete the upload stream id (`cleanupFailedUpload`).
- Payment submit deletes the stored object if the DB transaction fails after `put`.
- There is still **no scheduled sweeper** for orphans if both abort and delete fail — operators can inspect the `privateFiles` bucket periodically. Documented as remaining Low priority.

## Manual verification

1. Upload payment screenshot → admin opens `/api/v1/admin/payments/{id}/screenshot` → attachment download, authorized only as ADMIN.
2. Upload profile photo → fighter `/api/v1/fighter/photo` streams image; unauthenticated → 401/403.
3. Admin fighter photo route with invalid userId → validation error.
4. With `STORAGE_DRIVER=gridfs`, confirm GridFS file metadata includes purpose/owner after upload.
