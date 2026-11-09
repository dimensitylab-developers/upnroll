# Backup and Restore

MongoDB Atlas is the system of record. The running app still stores private files on local disk, so a database dump is not a complete copy of those files. Retention policy specifics are OD-011 (pending). This document covers the mechanism, not a backup owner or a schedule. Who operates backups is unresolved.

## Backup

Standard `mongodump` against the production `MONGODB_URI`:

```bash
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d-%H%M%S)
```

Atlas is already the only database. Its continuous backup is the preferred database mechanism when the project owner turns it on. This document does not turn it on, and it does not assign who is responsible for checking snapshots. A `mongodump` is the manual alternative. Neither one was taken for this update.

## What's actually sensitive in a backup

- `users.passwordHash` — scrypt-hashed, not reversible, but still treat backup files as sensitive (standard practice).
- `payment_submissions.screenshotStorageKey` and fighter photo keys point at files in `.local-storage/` today. Those bytes are not in a `mongodump`. Back up that directory separately if a development machine must keep them. Do not copy or delete those files as part of a backup drill.
- GridFS is the preferred future store for those private files. It is not active. When an implementation exists and has been verified, the screenshot and photo bytes would live in the same Atlas database as the business documents, and a database backup would include them. Until that code exists, do not assume a database snapshot contains the files. Public brand assets, gallery images, and the homepage video stay in the Next.js public directory either way. They are not private uploads and they are not in GridFS.
- `audit_logs` — the actual record of who did what; worth the same retention consideration as the rest, not accidentally excluded from a backup scope.

## Restore

```bash
mongorestore --uri="$MONGODB_URI" ./backups/<timestamp>
```

**Never restore into the production `MONGODB_URI` without first confirming the target** — `mongorestore` merges/overwrites by default. Restoring into a fresh/staging database first to verify the dump is sound, before ever pointing at production, is the safe default.

## Retention

Not decided (OD-011) — specifically because payment screenshots are PII-adjacent (proof of a real financial transaction) and the client needs to set the actual retention window, not have one assumed. Until that's resolved, treat all backups as retained indefinitely and handle them with the same care as the live database — don't let backups become a lower-security copy of the same sensitive data.
