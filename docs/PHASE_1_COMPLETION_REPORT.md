# Phase 1 completion report

Phase 1 adds server-side authorization and tighter data exposure. Phase 0 was not implemented. Phase 2 was not started. No database schema, authentication protocol, or Cache Components change was made.

## Findings addressed

- Protected service calls now take a readonly `Actor` built only from a validated server session. Role checks run inside the service, including reads.
- The session object returned to application code no longer includes `passwordHash` or the raw session document.
- Public fighter, ranking, payment-queue, audit, and name-enrichment reads use explicit field lists.
- Payment screenshots are limited to 3 MB and must match PNG, JPEG, or WEBP magic bytes. The declared MIME type must match those bytes.
- Local storage keys are resolved inside the storage root before any file is created or read.
- Payment proof responses are attachments with `nosniff` and `private, no-store`. Profile photos are fighter-only and also send `nosniff`.
- `server-only` marks session, service, and local-disk modules so a client bundle cannot import them.

## Actor

`Actor` is `Readonly<{ userId: string; role: "FIGHTER" | "ADMIN" }>`, frozen by `actorFromSession`. The only constructor reads `_id` and `role` from a session that `getSession`, `requireSession`, or `requireRole` already loaded from the HMAC cookie and the user record. There is no constructor that accepts a form field. `requireActor(role)` checks the session role, then the service checks again with `assertAdmin` or `assertFighter`. A fighter asking for another fighter's registration still gets `NotFoundError`, so the response does not reveal that the row exists. The wrong role gets `ForbiddenError`.

## Services that require an actor

Admin reads and writes: events, divisions, brackets, matches, the payment queue and screenshot, registration requests, content, media, ranking recalculation, recent registrations, audit feed, and the admin dashboard.

Fighter reads and writes: own profile, profile photo, registrations, payments, requests, match list, and the fighter dashboard.

Public catalog reads stay unauthenticated: published events, divisions, brackets, schedule, results, fighter directory, public fighter history, rankings, published content, and published media. `listPublicSchedule` still does not hide draft events. That filter belongs to Phase 0 and was left unchanged.

`loadMatchesForUser` is private to `matchService.ts`. `listMatchesForFighter(actor)` is the owner read and queries `actor.userId` only. `listPublicMatchHistory` returns wins, losses, and the public history fields. `getPublicFighterBySlug` uses that operation.

## DTO changes

- Public fighters expose `_id`, `displayName`, `slug`, `gym`, and `discipline`.
- Public fighter history exposes match id, event name, competitor names, winner name, and result method.
- Rankings and bracket name lookups select `displayName` (and `slug` for rankings).
- The payment queue exposes `user.email` and event `name` plus currency.
- Admin request rows load user email only. The audit feed returns action, actor email, and time.
- Admin recent registrations return fighter name, event name, and division name.
- The owner profile read still returns the fighter document to the signed-in fighter, because the profile form needs those fields. It is not a public DTO.

## Session

`getSession` selects `email`, `role`, and `status`, then copies `_id`, `email`, `role`, and `status` into the result. Expired, tampered, and disabled sessions still return null. Cookie signing, scrypt passwords, and `proxy.ts` cookie-name checks are unchanged. `getSession` is not wrapped in React `cache()`.

Registration creates the session, then builds the actor from `getSession`, then saves the photo. The photo is not saved from a client-supplied user id. A Server Action on the running dev server set a cookie and read it back in the same action; the value was `visible`. The regression test uses one cookie store for `createSession` and `getSession`.

## Uploads and private files

`MAX_SCREENSHOT_BYTES` is `3 * 1024 * 1024`, matching `experimental.serverActions.bodySizeLimit`. A file of exactly 3 MB can still be rejected by Next.js because multipart overhead counts toward that limit. The global limit was not raised. Profile photos stay at 1.5 MB and use the same magic-byte check.

`LocalDiskStorageAdapter` rejects empty keys, NUL bytes, absolute paths, and any key that resolves outside `.local-storage`. The payment screenshot route requires an admin actor. The review dialog links to that route as a download, because the response is `Content-Disposition: attachment`.

## server-only

The package is a `frontend` dependency (`server-only@0.0.1`). It is imported by `backend/auth/session.ts`, every non-test file in `backend/services/`, and `backend/storage/local-disk.ts`. It is not imported by `connect.ts`, `config.ts`, models, `password.ts`, or `cookie-name.ts`, so CLI scripts and `proxy.ts` keep working.

Vitest aliases the package to an empty stub. TypeScript resolves the import from the repository `node_modules` because `backend/` files walk upward from their own directory. The package is also present there for that resolution. The Next.js server webpack compilation aliases it to `empty.js`. Without that alias, shared server chunks load the throwing build and page-data collection fails. The browser compilation still uses the throwing entry. A temporary client page that imported `backend/auth/session.ts` failed `npm run build` on `server-only`. That page was removed. Importing `connect`, models, `password`, and `cookie-name` from `tsx` printed `cli-imports-ok` and did not throw.

## Files

New: `backend/auth/actor.ts`, `backend/auth/actor.test.ts`, `backend/services/authorization.security.test.ts`, `backend/services/matchPrivacy.test.ts`, `backend/storage/local-disk.test.ts`, `frontend/src/test/server-only-stub.ts`, `frontend/src/features/payments/delivery-headers.ts`, `frontend/src/features/payments/delivery-headers.test.ts`, this report.

Updated: session and the protected services, storage, upload validation, server actions, admin and fighter pages, the screenshot and photo routes, the payment review dialog, content schema imports, Vitest aliases, `frontend/package.json`, `frontend/package-lock.json`, and the server webpack alias in `frontend/next.config.ts`. The build script is `next build --webpack`, matching `dev`.

Not changed: `predev`, React `cache()`, GitHub Actions, draft-event schedule filtering, auth cookie format, password hashing, Mongoose schemas, and the 3 MB Server Action body limit.

## Verification

Commands were run on this machine after the edits.

| Check | Result |
| --- | --- |
| `npx tsc --noEmit --pretty false --project frontend/tsconfig.json` | Exit 0 |
| `npm test --prefix frontend` | 21 files, 131 tests, all passed |
| Same-action cookie probe on `http://localhost:3000/probe-cookie` | The Server Action returned `visible` |
| Client import of `session.ts` during `npm run build` | Failed to compile. Import trace: `probe-cookie/page.tsx` → `session.ts` → `server-only` |
| `tsx` import of connect, User, password, cookie-name, Event, and Division | Printed `cli-imports-ok`, exit 0 |
| `npm run build --prefix frontend` | Exit 0. `next build --webpack` compiled, typechecked, and generated the app routes. The temporary probe route was not in the route list. |

## Remaining risks

- Aadhaar and medical fields are still stored in plaintext and are still returned to the owning fighter. Encrypting them needs a schema and key-management decision, which was out of scope.
- Payment submissions still include the storage key on the admin queue so the UI knows a file exists. The bytes are only served through the admin route.
- A screenshot of exactly 3 MB can fail the Server Action body limit because of multipart overhead.
- Draft events can still appear on the public schedule. That is the Phase 0 fix and was intentionally left undone.
- There is no CSP or global security-header baseline. Screenshot and photo responses set their own headers.
- Payment decisions, bracket writes, and ranking recalculation are still multi-step writes without a transaction. That is Phase 2.

## Deferred

Phase 2 (transactions and a replica set) was not started. Phase 0 (CI, request-level `cache()`, and the startup link script) was not started.
