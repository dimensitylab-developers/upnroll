# GridFS — implementation plan

Date: 7 November 2026. Basis: `docs/GRIDFS_TECHNICAL_DESIGN.md` (architecture approved in principle).

This plan is for review. It does **not** authorize coding, dependency installs, database writes, file migration, push, or merge.

## Goal

Add a GridFS adapter for private payment screenshots and fighter profile photos on the existing Atlas database and Mongoose connection, behind the existing `StorageAdapter`, without migrating `.local-storage`, without restructuring the backend, and without selecting a host.

## Exact files to change

### New files

| Path | Purpose |
| --- | --- |
| `backend/storage/gridfs.ts` | `GridFSStorageAdapter` using `GridFSBucket` from the MongoDB driver already pulled in by mongoose. |
| `backend/storage/factory.ts` | `getStorageAdapter()` selection: `local` in development/test; production requires an explicit driver. |
| `backend/storage/keys.ts` | Parse and format `gridfs:<id>`; reject cross-adapter keys. |
| `backend/storage/stream-response.ts` | Bridge Node readable → Web `ReadableStream` for `NextResponse`; wire abort/cleanup. |
| `backend/storage/gridfs.test.ts` | Unit tests with a mocked bucket / streams. |
| `backend/storage/stream-response.test.ts` | Unit tests for abort and header plumbing without Atlas. |
| `backend/db/atlas-suite-lock.ts` | Shared lock so Atlas suites do not drop `upnrol_txn_test` concurrently. |
| `backend/db/gridfs.integration.test.ts` | Atlas-only GridFS suite, same DB name guard as transactions. |
| `scripts/report-gridfs-orphans.ts` | Read-only orphan report; optional delete only with confirmation + explicit ids. |
| `frontend/package.json` script entry | e.g. `report-gridfs-orphans`. |

### Existing files to edit

| Path | Change |
| --- | --- |
| `backend/storage/types.ts` | Add `open(key)`. Keep `put`, `get`, `getSignedUrl`, `delete`. |
| `backend/storage/local-disk.ts` | Implement `open` with a filesystem stream. Stop exporting production `getStorageAdapter` if moved to `factory.ts`; keep the class. Reject `gridfs:` keys. |
| `backend/services/paymentService.ts` | Store the key returned by `put`. Import adapter from the factory. On transaction failure, keep compensation `delete`. Screenshot delivery uses `open` via the route helper, not a buffered `get`. |
| `backend/services/profilePhoto.ts` | Upload new key first; update profile; delete previous only if it is no longer the live `photoKey`. Never delete the live key. Concurrent-safe re-read before delete. |
| `frontend/src/app/api/v1/admin/payments/[id]/screenshot/route.ts` | Authorize → open → stream response. No full-file buffer. |
| `frontend/src/app/api/v1/fighter/photo/route.ts` | Same streaming delivery; keep nosniff and private cache headers. |
| `frontend/src/app/api/v1/admin/fighters/[userId]/photo/route.ts` | Same streaming delivery; add nosniff to match the fighter route. |
| `backend/db/transactions.integration.test.ts` | Acquire/release the shared Atlas suite lock around connect/drop. |
| `frontend/.env.example` | Document `STORAGE_DRIVER=local\|gridfs` (empty values only). |
| `docs/deployment/backup-restore.md` | Note that with GridFS selected, `privateFiles.*` are in the database dump; with local disk they are not. |
| `docs/MASTER_ENGINEERING_ROADMAP.md` | After merge of the feature, mark GridFS implementation status. Not part of the first code commit unless asked. |

### Files not to touch

Registration state machine, brackets, rankings, email, occupancy backfill, public media, chatbot, CI workflow host choice, and any automatic migration of `.local-storage`.

## Proposed code changes

### Adapter selection

```text
getStorageAdapter():
  development / test → LocalDiskStorageAdapter
  production + STORAGE_DRIVER=gridfs → GridFSStorageAdapter
  production + STORAGE_DRIVER=local → LocalDiskStorageAdapter (allowed only when operator knowingly selects it; still not multi-instance safe)
  production + STORAGE_DRIVER unset → throw clear error (no silent local fall-through)
```

Do **not** enable a “refuse local in production” hard fail until the owner separately authorizes that after GridFS is verified. The unset-driver throw prevents accidental ambiguity without inventing a host topology.

### `put` / `open` / `delete`

- `put`: validate already done by callers; open upload stream; write buffer; await finish; return `gridfs:<id>`.
- On write error: `await uploadStream.abort()`; if needed `await bucket.delete(id)`; rethrow original error.
- `open`: parse id; `openDownloadStream(id)`; return `{ stream, contentType, length }` from the files document.
- `delete`: parse id; `bucket.delete(id)`; treat missing as success.

### Payment submit

```text
key = await storage.put(...)
try { withTransaction(... store key ...) }
catch { await storage.delete(key); throw }
```

### Profile photo

```text
linkedKey = existing.photoKey
newKey = await storage.put(...)
try {
  update profile to newKey
} catch {
  await storage.delete(newKey)
  throw
}
if (linkedKey && linkedKey !== newKey) {
  re-read live photoKey
  if (live !== linkedKey) skip delete   // never delete the live key
  else await storage.delete(linkedKey)  // orphan if this fails
}
```

### Route streaming

```text
authorize
{ stream, contentType, length } = await storage.open(key)
web = Readable.toWeb(nodeStream)
return new NextResponse(web, { headers: contentType, nosniff, private, length, disposition for screenshots })
on request.signal abort → destroy node stream / readStream.abort()
```

## Dependency and import requirements

| Item | Plan |
| --- | --- |
| New npm package | None. Use `GridFSBucket` from `mongodb` already installed under mongoose (`mongodb@7.7.0`). |
| Import path | Prefer `import { GridFSBucket, ObjectId } from "mongodb"` after confirming TypeScript resolves it the same way mongoose does. If the workspace needs a path alias (as with nodemailer), add one in `frontend/tsconfig.json` only. |
| `serverExternalPackages` | Add `"mongodb"` only if the webpack build bundles it incorrectly; otherwise leave as today (`mongoose` already external). Decision during the build verification commit. |
| Node APIs | `node:stream` (`Readable.toWeb`), Node 20+ (already required by Nodemailer / CI Node 22). |

No Nodemailer or SMTP changes. No GridFS-specific third-party package.

## Test strategy

| Layer | What |
| --- | --- |
| Unit | Mocked upload/download streams: success, abort deletes chunks, missing delete is quiet, key parsing, concurrent profile delete guard with a fake profile store. |
| Unit | Stream response helper: converts Node → Web stream; abort signal destroys the Node stream. |
| Unit | Orphan script: default prints only; delete without `--delete-confirmed` refuses; linked id refused. |
| Atlas integration | Shared lock + `upnrol_txn_test` name guard. Upload/read/delete one PNG. Force incomplete upload. Assert no leftover chunks. |
| Atlas transactions suite | Same lock. Existing eight tests unchanged in intent. |
| Authorization | Existing security tests still pass; add streaming route test that a fighter cannot open another fighter's screenshot. |
| Concurrency | Two simultaneous profile photo replacements; assert live key file exists; abandoned key listed by orphan report after grace (or with grace overridden in test). |

CI continues to skip Atlas suites (localhost / no URI). Local/Atlas runs remain operator machines with the URI.

## Commit boundaries

Small reviewable commits, no secrets:

1. **storage port**: add `open` to types; implement on local disk; add stream-response helper + unit tests.
2. **gridfs adapter**: `gridfs.ts`, keys, factory, unit tests with mocks. No call-site behavior change yet beyond factory wiring in development still selecting local.
3. **call sites**: payment returned-key + compensation; profile replace order + live-key guard; three routes stream.
4. **atlas isolation + gridfs integration**: lock helper, update transaction suite, add gridfs integration tests.
5. **orphan report script**: read-only default; confirmed delete path; npm script; docs for backup-restore one paragraph.

Do not combine with hosting selection, occupancy backfill, SMTP2GO DNS, or public media work.

## Rollback strategy

| If | Then |
| --- | --- |
| Adapter bugs before production selects `gridfs` | Revert the git commits. Development still on local disk. No data migration to undo. |
| Production already writing `gridfs:` keys | Roll the app back only after confirming those keys are not required, or leave the GridFS adapter in place. Rolling back the app to a local-only binary cannot read `gridfs:` keys. |
| Bad orphan delete | Restore `privateFiles.files` and `privateFiles.chunks` from the pre-delete Atlas snapshot / dump into a **staging** database first, then decide. |
| Partial feature merged | Feature flag is `STORAGE_DRIVER`. Leaving it unset in production fails closed (throw). Setting `local` keeps old behavior for a single persistent disk only. |

No automatic down-migration of GridFS documents into `.local-storage`.

## Backup and restore implications

- With `STORAGE_DRIVER=gridfs`, include `privateFiles.files` and `privateFiles.chunks` in every database backup. Atlas continuous backup covers them when enabled by the owner.
- Restore those two collections with the business collections into the same database name.
- With local disk still selected, database dumps still omit private file bytes. Back up `.local-storage` separately if needed.
- Public assets under `frontend/public` remain outside MongoDB.
- Update `docs/deployment/backup-restore.md` in commit 5 of the boundary list.

## Acceptance criteria

Implementation may be marked complete only when all of the following are true:

1. Typecheck, Vitest (including new unit tests), and `npm run build` exit 0.
2. Protected photo/screenshot routes stream via Web `ReadableStream` and do not assemble a full-file `Buffer` for the response body.
3. Client abort cleans up the Node/GridFS read stream.
4. Upload stream errors call `abort()`; incomplete uploads leave no reclaimable chunks for that id (unit + Atlas proof).
5. Payment transaction failure deletes the uploaded key; email failure does not.
6. Profile replacement never deletes the key currently stored on the profile; concurrent replacement test passes.
7. Orphan report defaults to read-only; deletes require `--delete-confirmed` and explicit ids; linked ids refused.
8. Transaction and GridFS Atlas suites share a lock and both refuse to drop any database other than `upnrol_txn_test`.
9. No `.local-storage` copy or delete migration ran.
10. No hosting provider was selected in the change.
11. Documentation updated: backup-restore note; design status remains “implementation authorized / shipped” only after owner sign-off on the running code.

## Explicit non-goals for this plan

- Hosting selection or multi-instance deploy.
- Occupancy backfill.
- Production launch.
- DNS / SMTP2GO verification.
- Retention sweeper.
- Changing public media.

## Approval gate

Stop here. Do not write application code until the owner authorizes this plan (or a revised version) as the implementation authorization for GridFS.
