# Implementation Commit Log

Branch: `suraj`  
Started: 2026-11-09  
Rule: one focused Conventional Commit per implementation point; phase milestone after each phase.

| Phase | Implementation | Commit Hash | Status |
|-------|----------------|-------------|--------|
| Phase 0 | Remediation checklist + commit log | `ed24b64` | Completed |
| Phase 1 | Event registration listing authz | `d8168be` | Completed |
| Phase 1 | Session rotation on create | `9edbc4f` | Completed |
| Phase 1 | Verify/resend rate limits | `df903cb` | Completed |
| Phase 1 | ObjectId validation | `c82f83e` | Completed |
| Phase 1 | Google OAuth state cookie | `e655999` | Completed |
| Phase 1 | Fighter actor + hashed transfer tokens | `914e6d5` | Completed |
| Phase 1 | HSTS + Permissions-Policy | `2dc10d1` | Completed |
| Phase 1 | Phase completion checkpoint | `8189bd2` | Completed |
| Phase 2 | Payment queue bound + detected MIME | `1c69684` | Completed |
| Phase 2 | Transfer payment ownership rewrite | `40e2a58` | Completed |
| Phase 2 | Bracket concurrent generation | `8523785` | Completed |
| Phase 2 | Compound indexes | `793f6e1` | Completed |
| Phase 2 | Phase completion checkpoint | `8cb5a15` | Completed |
| Phase 3 | Stream private downloads + metadata | `0e22c1c` | Completed |
| Phase 3 | Phase completion checkpoint | `5a6d13f` | Completed |
| Phase 4 | WhatsApp port + match ObjectIds | `dbe0216` | Completed |
| Phase 5 | Fighter registration page actor | `85cb144` | Completed |
| Phase 6 | SMTP timeouts + Google env example | `047f3b0` | Completed |
| Phase 7 | Logger + CastError mapping | `3242cdc` | Completed |
| Phase 8 / Final | Hardening docs + checklist closeout | `297045d` | Completed |
| QA Runtime | Remove force-dynamic (cacheComponents) | `902a3a1` | Completed |
| QA Runtime | SiteHeader connection() date fix | `5d9e3e4` | Completed |
| QA Runtime | Role portal redirects + admin race guard | `f951b63` | Completed |
| QA Runtime | QA report suite under docs/qa | `f772ff8` | Completed |
| QA Runtime | Admin/Fighter nav hydrate defer | `29c62e2` | Completed |
| E2E Flow | Flow map + execution report + lifecycle script + evidence | _(pending this commit)_ | In progress |

Note: `06e50b8` (`docs(architecture): …`) appeared on the branch during this window from a separate documentation commit and is not part of the hardening implementation stream.

---

## Remaining limitations (cross-phase)

- CSP Report-Only until Next.js nonce strategy
- In-memory rate limits (single instance)
- No scheduled GridFS orphan sweeper
- Occupancy backfill still operator-run
- WhatsApp mock only
- TransferInvite schema uses `tokenHash`; regenerate any legacy plaintext invites
- New indexes need `syncIndexes` / Atlas create if `autoIndex` is disabled
- Not pushed to remote
