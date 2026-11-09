# GridFS — technical design

Date: 7 November 2026. Status: architecture approved in principle as the basis for an implementation plan. This document does not authorize application code.

GridFS is the preferred production store for private payment screenshots and fighter profile photos. It is not implemented. No bucket, adapter, or migration exists. Hosting is still unselected. This design does not choose a host, copy `.local-storage`, restructure `backend/`, or change unrelated services.

Atlas remains the only database. The adapter uses the existing Mongoose connection and `GridFSBucket` from the MongoDB driver already installed with Mongoose (`mongodb@7.7.0` via mongoose). No second database, no object-storage vendor, and no extra GridFS package.

Public brand assets, gallery images, and the homepage video stay files under `frontend/public`.

## Preserved architectural decisions

- One `privateFiles` bucket, default 255 KiB chunks.
- Existing MongoDB Atlas database and Mongoose connection.
- Storage keys of the form `gridfs:<24-hex id>`.
- Existing `StorageAdapter` abstraction, extended only as below.
- Existing authorization rules on services and protected routes.
- Uploads outside retryable transactions.
- No automatic migration from local disk.
- No retention sweeper.
- No hosting-provider selection.

## Scope of a later implementation

In scope, and only after both this design and a separate implementation authorization:

- A GridFS adapter behind the existing `StorageAdapter`.
- Development keeps `LocalDiskStorageAdapter`.
- Production selects the adapter explicitly. There is no silent fall-through to local disk, and there is no boot refusal of local disk until the GridFS adapter is implemented and the operator has configured it.
- Call sites store the key `put` returns. Today `submitPayment` stores the key it generated and ignores the return value. That assignment changes to the returned key. Nothing else in payment review changes.
- Profile-photo replacement deletes a previous key only after the profile document points at the new key, and never deletes the key currently referenced by the profile.
- Protected routes authorize first, then stream without buffering the whole file.
- Compensation `delete` when the business transaction fails.
- An operator-run orphan report that is read-only by default.
- Tests listed in section 8, including concurrent profile replacement and shared-database isolation.

Out of scope:

- Copying or deleting existing `.local-storage` files.
- Folder moves, new services, or a change to registration, brackets, rankings, email, or the occupancy backfill.
- Public media, `MediaAsset` URLs, or a CDN.
- A scheduled deleter. Retention stays OD-011.
- Changing the 3 MB screenshot limit or the 1.5 MB profile-photo limit.

## 1. Bucket and collections

One bucket, name `privateFiles`, on `mongoose.connection.db` after `connectDB()`.

GridFS then uses two collections in the same database as the business data:

| Collection | Role |
| --- | --- |
| `privateFiles.files` | One document per upload: id, length, chunk size, upload date, filename, content type, metadata. |
| `privateFiles.chunks` | The bytes, in the driver's default chunk size (255 KiB). |

Do not create a second bucket for photos versus screenshots. `metadata.purpose` distinguishes them. Do not change the chunk size. These files are at most 3 MB, and a custom chunk size would be tuning without a measurement.

The application database is whichever database `MONGODB_URI` opens. The bucket does not pick a different database. `upnrol_txn_test` is the shared Atlas database name for both the existing transaction suite and the GridFS integration suite. Both suites must refuse to drop any other name. They must not run concurrently while either drops that database. See section 8.1.

## 2. Metadata and association

The business documents stay the association. GridFS metadata is a copy for operators and for the orphan report. It is not an access check.

`put` returns a storage key of the form `gridfs:<24-hex file id>`. `PaymentSubmission.screenshotStorageKey` and `FighterProfile.photoKey` store that string. Local-disk keys stay path strings such as `payment-screenshots/...` and `profiles/...`. A GridFS adapter rejects a key that is not `gridfs:<id>`. The local adapter rejects a `gridfs:` key. Old local files keep working on the local adapter. They are not imported.

Filename on the GridFS document is a label, not the key. Screenshots use the current label shape `payment-screenshots/<registrationId>/<time>-<random>.<ext>`. Photos use `profiles/<userId>.<ext>`. Two files may share a filename. Reads and deletes use the id in the storage key, so a filename clash does not choose the wrong file.

Metadata written at upload:

| Field | Screenshot | Profile photo |
| --- | --- | --- |
| `purpose` | `payment-screenshot` | `profile-photo` |
| `ownerUserId` | the fighter's user id | the fighter's user id |
| `registrationId` | the registration id | omitted |
| `contentType` | the detected type | the detected type |
| `sha256` | hex of the validated bytes | hex of the validated bytes |

`paymentSubmissionId` is not known until the transaction inserts the payment row. It is not written onto the file. The payment row points at the file. The other direction is not required.

A route must not accept a storage key from the query string or the body. It loads the payment or the profile the actor is allowed to see, then opens the key stored on that document.

## 3. Upload, size, and MIME

Server Actions already buffer the body. `experimental.serverActions.bodySizeLimit` is `3mb`. This design does not pretend the browser streams into GridFS. The action still holds a `Buffer`. The GridFS write uses `openUploadStream` so the bytes are stored as chunks, not as one document field.

Order:

1. Authorize (`assertFighter` for both uploads).
2. Enforce the existing limits before any chunk is written. Screenshots: `validateScreenshotMeta`, 3 MB, PNG, JPEG, or WEBP magic bytes that match the declared type. Photos: `readProfilePhoto`, 1.5 MB, the same three types.
3. Open the upload stream with the filename label, content type, and metadata.
4. Write the buffer and finish the stream.
5. Return `gridfs:<id>` only after the stream finishes.
6. If the stream fails, run the failure path in section 3.1. A failed validation never opens a stream.

The content type stored in GridFS is the type detected from the bytes, not the browser's declared type when they disagree. A disagreement is a validation error and does not upload.

### 3.1 Upload failure handling against the installed driver

Verified against `mongodb@7.7.0` type declarations (`mongodb.d.ts`):

- `GridFSBucketWriteStream.abort()` places the write stream in an aborted state and **deletes all chunks that have already been written**.
- `GridFSBucket.delete(id)` deletes a completed file document and its chunks.
- `GridFSBucketReadStream.abort()` stops pushing data and kills the underlying cursor.

Adapter rules:

| Failure | Required cleanup |
| --- | --- |
| Validation fails before `openUploadStream` | No stream. Nothing to clean. |
| Error while writing or finishing the upload stream | Call `uploadStream.abort()`. Capture `uploadStream.id`. If abort itself fails, call `bucket.delete(id)` and ignore a missing-file result. Then rethrow the original error. |
| Process dies during upload | Chunks or a partial file document may remain. They are orphans for section 6. The next process does not invent a sweeper. |
| Compensation `delete` after a failed business transaction | Call `bucket.delete(id)`. A missing file resolves without throwing, matching today's local adapter. If that delete fails after logging a redacted error, the file remains an orphan. |

Incomplete uploads must be covered by unit tests with a mocked write stream and by an Atlas integration case that forces a write error and asserts no leftover chunks for that id.

## 4. Download

Authorization finishes before GridFS is touched.

| Route | Gate, in order | Then |
| --- | --- | --- |
| `GET /api/v1/admin/payments/[id]/screenshot` | Admin actor, then `getPaymentScreenshot` loads that payment. Missing key is not found. | Stream the key on that payment only. |
| `GET /api/v1/fighter/photo` | Fighter session, then that fighter's own profile. | Stream `profile.photoKey` only. |
| `GET /api/v1/admin/fighters/[userId]/photo` | Admin role, then that user's profile. | Stream that profile's `photoKey` only. |

All three responses set `Content-Type` from the adapter, `X-Content-Type-Options: nosniff`, and `Cache-Control: private, no-store`. Screenshots also keep `Content-Disposition: attachment` via `paymentProofHeaders`.

`getSignedUrl` stays a non-HTTP marker (`gridfs://<id>`). It is not a public URL and routes must not redirect to it.

### 4.1 Next.js streaming bridge

`StorageAdapter` gains:

```ts
open(key: string): Promise<{ stream: NodeJS.ReadableStream; contentType: string; length: number }>;
```

The GridFS adapter returns `bucket.openDownloadStream(id)`. The local adapter returns a filesystem read stream after the existing path check.

Route handlers must not buffer the whole file into a `Buffer` or `Uint8Array` for delivery. Delivery shape:

1. Authorize and resolve the storage key from the business document.
2. `const { stream, contentType, length } = await storage.open(key)`.
3. Convert the Node.js readable with `Readable.toWeb(stream)` from `node:stream`.
4. Return `new NextResponse(webStream, { headers })`, including `Content-Length` when `length` is known.
5. On client abort (`request.signal` abort), call the Node stream's destroy path and, for GridFS, `readStream.abort()` so the cursor is killed.
6. On stream error after headers are sent, destroy the Node stream. Do not attempt to rewrite the status code. Log a redacted error with the file id, not the bytes and not personal fields from the body.

`get` remains for callers that already expect a buffer. It may read `open` with the same 3 MB ceiling. Protected photo and screenshot routes use `open` only. Development's local adapter implements the same `open` contract so those routes do not branch on storage driver.

If the key is missing, `open` raises not-found. The route does not fall back to local disk.

## 5. Failed business transactions

Uploads stay outside `withTransaction`. A retry of the transaction must not upload again.

Payment submit, after this design:

1. Validate and `put`. Hold the returned key.
2. Run the existing transaction, storing that key on the new payment row.
3. If the transaction throws, `delete` that key, then rethrow. This matches the current `catch` in `submitPayment`.
4. Send email only after commit. An email failure does not delete the file.

Profile save today deletes the previous key before the new `put`, and before `updateFighterProfile`. A failure then loses the previous photo. The implementation changes only that order:

1. Read the current `photoKey` from the profile. Call it `linkedKey`.
2. `put` the new photo. Do not delete `linkedKey`.
3. `updateFighterProfile` with the new key.
4. If the profile update throws, `delete` the new key only. The profile still points at `linkedKey`.
5. If the profile update commits, and `linkedKey` is non-empty and different from the new key, `delete` `linkedKey`. A failure of that delete leaves an orphan for section 6. It does not roll back the profile.

### 5.1 Profile-photo concurrency

Two simultaneous replacements for the same fighter must not delete the key currently referenced by the profile.

Rules:

- Before any delete of a previous key, re-read `FighterProfile.photoKey` (or use the value returned by the successful update). Delete that previous key only when it is still not equal to the live `photoKey`.
- Never call `delete` on the key that is currently stored on the profile document.
- If replacement A uploads key A1 and replacement B uploads key B1, and B's profile update wins last, then A's abandoned A1 must remain until the orphan report lists it. B must not delete A1 while A1 is still the live key, and must not delete B1 while B1 is the live key.
- The orphan report must detect an abandoned replacement: a `profile-photo` file whose id is not the current `photoKey` for that owner, after the grace period.

A dedicated test covers two concurrent photo replacements and asserts the live profile key's file still exists.

Do not put GridFS chunk writes inside the transaction callback.

## 6. Interrupted uploads and orphans

An orphan is a `privateFiles.files` document whose id is not the current `screenshotStorageKey` or `photoKey` on any payment or profile. Metadata is not the proof. The business collections are.

Interrupted cases:

| Case | What the implementation does |
| --- | --- |
| Validation fails | No stream. No file document. |
| Upload stream throws | Abort (driver deletes written chunks). Then `bucket.delete(id)` if needed. |
| Process dies during the upload | A file document or chunks may exist with no business pointer. |
| Transaction throws after `put` | Section 5 deletes that key. If that delete also fails, the file is an orphan. |
| Previous photo delete fails after the profile commit | The new key is linked. The old file is an orphan. |
| Lost concurrent photo replacement | The abandoned upload is an orphan. The live `photoKey` is never deleted by the other request. |

### 6.1 Orphan report: read-only by default

Detection is a manual script, run by an operator, not on startup and not on a timer.

Default mode is **report only**:

- Ignore files whose `uploadDate` is less than 24 hours old, so a request still in flight is not listed.
- Print id, purpose, owner user id, upload date, and whether a business document points at the id.
- Exit 0 after printing. Delete nothing.

Deletion mode is a separate, explicit operator action:

- Requires an explicit confirmation flag (for example `--delete-confirmed`) **and** an explicit list of ids (for example `--id=<hex>` repeated, or a file of ids).
- Refuses to delete an id that is currently linked from any payment or profile.
- Without both the confirmation flag and at least one id, the script must not delete.

Do not add a retention window for linked files. There is no automatic migration. Files that exist only under `.local-storage` are invisible to this report.

## 7. Backup and restore

When this adapter is in use, `privateFiles.files` and `privateFiles.chunks` are ordinary collections in the Atlas database. An Atlas snapshot or a `mongodump` of that database includes them. A dump of the business collections without those two collections restores the payment rows and not the bytes.

Restore rules:

- Restore `privateFiles.files` and `privateFiles.chunks` together, into the same database as the payment and profile documents.
- Confirm the target database name before `mongorestore`. Do not restore onto the live database as the first try.
- A GridFS restore does not recreate `.local-storage`.
- Public files under `frontend/public` are not in the dump. They ship with the application.
- This design does not turn on Atlas backups and does not assign who checks them.

Until the adapter is actually configured, backups still omit private files, because those bytes are on local disk. `docs/deployment/backup-restore.md` should gain a sentence to that effect in the implementation change, not before.

## 8. Tests

Unit tests use a fake bucket or a mocked `GridFSBucket`. They do not need Atlas.

| Case | Expected |
| --- | --- |
| PNG, JPEG, and WEBP under the limit | `put` returns `gridfs:<id>` and writes metadata purpose and owner. |
| Oversize screenshot or photo, or mismatched magic bytes | No upload stream opened. |
| Upload stream error | `abort()` called; leftover chunks for that id are gone; original error propagates. |
| `open` before the actor check | Not possible from the route: the test calls the service, and a fighter asking for another fighter's payment screenshot gets not-found without a bucket read. |
| Admin screenshot and admin photo | Open the key stored on that row, not a key supplied by the test as if it came from the query. |
| Fighter's own photo | Opens only `photoKey` from that fighter's profile. |
| Route delivery | Response body is a Web stream from `Readable.toWeb`. No full-file `Buffer` in the route. |
| Client abort during download | Read stream is aborted or destroyed. |
| Transaction abort after `put` | `delete` called with the returned key. The payment row is absent. |
| `delete` of a missing id | Resolves, matching today's local adapter. |
| Profile update fails after the new `put` | New key deleted. Previous key still on the profile. |
| Two concurrent photo replacements | The live profile key's file still exists. An abandoned upload is not the live key and is detectable as an orphan after the grace period. Never deletes the key currently on the profile. |
| Two concurrent screenshot uploads for two registrations | Two ids. Neither delete removes the other. |
| Two fighters racing one seat | Existing occupancy test. The losing transaction deletes only its own screenshot key. |
| Orphan report default | Lists unlinked ids older than the grace period. Deletes nothing. |
| Orphan report delete without confirmation | Refuses. |
| Orphan report delete with confirmation and explicit ids | Deletes only those unlinked ids. Refuses a linked id. |

### 8.1 Integration-test isolation

Both Atlas suites use database name `upnrol_txn_test` and preserve the guard that refuses to drop any other name.

They must not run at the same time while either suite drops that database. Implementation plan requirement:

- Share one lock helper (for example a file lock under the OS temp directory, or a Vitest project that runs the two Atlas files in one worker with `fileParallelism: false` for those files only).
- Each suite's `beforeAll` acquires the lock. `afterAll` releases it after disconnect.
- If the lock cannot be acquired within a timeout, the suite fails with a clear message rather than dropping the database under another suite.
- The database-name check stays: `if (name !== "upnrol_txn_test") throw`.

An Atlas GridFS integration file uploads one small PNG, reads it back through `open`, deletes it, forces one incomplete-upload failure, and asserts no chunk remains for that id. It does not touch `.local-storage`.

## Implementation approval

This design is approved in principle as the basis for preparing the implementation plan. It still does not authorize application code.

Confirmations locked for the plan:

- Bucket name `privateFiles` and the default 255 KiB chunk size.
- Storage key format `gridfs:<id>`.
- The 24-hour orphan-report grace period.
- The `open` method on `StorageAdapter`, with Node-to-Web stream bridging for Next.js responses.
- Orphan reporting read-only by default; deletes require explicit confirmation and explicit ids.
- Concurrent profile replacements never delete the live profile key.

Anything else in the current payment, profile, and route behavior stays unless the implementation plan names it.
