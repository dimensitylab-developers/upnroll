# Backup and Restore

Phase 6. MongoDB holds every piece of real state in this app (no other durable store). Retention policy specifics are OD-011 (pending client decision) — this document covers the mechanism, not the schedule.

## Backup

Standard `mongodump` against the production `MONGODB_URI`:

```bash
mongodump --uri="$MONGODB_URI" --out=./backups/$(date +%Y%m%d-%H%M%S)
```

If hosting on MongoDB Atlas, prefer Atlas's built-in automated continuous backups over a cron'd `mongodump` — point-in-time restore and off-host storage come for free, and it doesn't compete with the live database for I/O during a backup window. This doc doesn't pick Atlas vs. self-hosted (OD-012), just notes the better default *if* Atlas is the eventual choice.

## What's actually sensitive in a backup

- `users.passwordHash` — scrypt-hashed, not reversible, but still treat backup files as sensitive (standard practice).
- `payment_submissions.screenshotStorageKey` points at files in `.local-storage/` (dev) or a real object store (production, once OD-012 resolves) — **not included in a `mongodump`**, since it's filesystem/object-storage content, not MongoDB data. A complete backup plan needs both: `mongodump` for the database, and a separate backup mechanism for wherever payment screenshots actually live. This is explicitly not solved yet because the storage provider itself isn't chosen (OD-012) — noted here so it isn't silently forgotten once that's resolved.
- `audit_logs` — the actual record of who did what; worth the same retention consideration as the rest, not accidentally excluded from a backup scope.

## Restore

```bash
mongorestore --uri="$MONGODB_URI" ./backups/<timestamp>
```

**Never restore into the production `MONGODB_URI` without first confirming the target** — `mongorestore` merges/overwrites by default. Restoring into a fresh/staging database first to verify the dump is sound, before ever pointing at production, is the safe default.

## Retention

Not decided (OD-011) — specifically because payment screenshots are PII-adjacent (proof of a real financial transaction) and the client needs to set the actual retention window, not have one assumed. Until that's resolved, treat all backups as retained indefinitely and handle them with the same care as the live database — don't let backups become a lower-security copy of the same sensitive data.
