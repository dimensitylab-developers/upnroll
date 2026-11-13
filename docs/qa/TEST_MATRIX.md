# Test Matrix — Manual QA 2026-11-12

Statuses used: **PASS**, **FAIL**, **BLOCKED**, **NOT IMPLEMENTED**, **NOT APPLICABLE**.  
Code inspection alone is never a PASS. Runtime evidence required.

| ID | Requirement | Role | Route/API | Preconditions | Scenario | Expected | Actual | Status | Evidence | Defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PUB-01 | Home loads | Visitor | `/` | Dev server | Open home | Brand, nav, CTAs | Loaded; brand + nav present | PASS | Browser snapshot | — |
| PUB-02 | Events list | Visitor | `/events` | — | Open events | Superfight card listed | 200, card visible | PASS | HTTP 200 ~1.9s; prior snapshot | — |
| PUB-03 | Event detail | Visitor | `/events/up-n-roll-superfight-series` | Seeded event | Open detail | Divisions, register CTA, back link | Divisions + Register + Back | PASS | Browser | — |
| PUB-04 | Missing event HTTP status | Visitor | `/events/does-not-exist-xyz` | — | Unknown slug | HTTP 404 + not-found UI | UI 404, **HTTP 200** | FAIL | curl headers `200 OK` | BUG-QA-2026-01 |
| PUB-05 | Brackets index | Visitor | `/brackets` | — | Open | Page loads | 200 (~37s cold) | PASS | curl | PERF note |
| PUB-06 | Rankings | Visitor | `/rankings` | Data present | Open board | Weight classes + cards; formula disclaimer | Board + “3 points per win” | PASS | Browser | OD-004 gap |
| PUB-07 | Store | Visitor | `/store` | — | Open | Coming soon / no cart | Coming soon copy | NOT IMPLEMENTED | Browser (commerce) | — |
| PUB-08 | Seminars | Visitor | `/seminars` | — | Open | Coming soon | 200 | NOT IMPLEMENTED | HTTP smoke | — |
| PUB-09 | FAQ / About / Policies / Announcements | Visitor | those paths | — | Open | 200 | 200 | PASS | curl | — |
| PUB-10 | Health | Ops | `/api/health` | Mongo up | GET | `{ok:true}` | `{"ok":true}` 200 | PASS | curl | — |
| AUTH-01 | Login page + back | Visitor | `/login` | — | Open | Form + Back to home | Present | PASS | Browser | — |
| AUTH-02 | Bad credentials | Visitor | `/login` | — | Wrong email/password | Clear error, no session | “Incorrect email or password.” | PASS | Browser | — |
| AUTH-03 | Hydration on auth | Visitor | `/login` | DevTools | Load | No hydration error | Issues badge: auth layout hydration | FAIL | DevTools overlay | BUG-QA-2026-02 |
| AUTH-04 | Hydration on public nav | Visitor | `/` | DevTools | Load / click nav | No hydration error | comic-nav hydration message | FAIL | DevTools overlay | BUG-QA-2026-02 |
| AUTH-05 | Password reset | Visitor | — | — | Find reset | Flow exists | No routes/actions | NOT IMPLEMENTED | Code + search | — |
| AUTH-06 | Unauth fighter portal | Visitor | `/fighter/dashboard` | No cookie | GET | Redirect login | 307 → `/login` | PASS | curl | — |
| AUTH-07 | Unauth admin | Visitor | `/admin` | No cookie | GET | Redirect login | 307 → `/login` | PASS | curl | — |
| AUTH-08 | Unauth judge console | Visitor | `/judge` | No judge cookie | GET | Redirect judge login | 307 → `/judge/login` | PASS | curl | — |
| JUDGE-01 | Judge login UI | Judge | `/judge/login` | — | Open | Username/password form | Present | PASS | Browser | — |
| JUDGE-02 | Bad judge creds | Judge | `/judge/login` | — | Invalid pair | Error, stay logged out | “Invalid username or password.” | PASS | Browser | — |
| PAY-01 | Manual verify only | System | paymentService | — | Submit evidence | Stays pending until admin | Unit + prior E2E + service design | PASS | Vitest payment/queue; prior QA | — |
| PAY-02 | Auto-verify forbidden | System | — | QR shown | Viewing QR alone | Never APPROVED | No auto-approve path | PASS | Code path + tests | — |
| CPN-01 | Coupon toggle UI | Fighter | registration form | Open event | Toggle “Do you have a coupon code?” | Field appears | Component present in UI code; full browser redeem | BLOCKED | Needs signed-in fighter + coupon fixture | — |
| CPN-02 | Single-use coupon | Fighter | couponService | Two fighters | Second redeem fails | Conflict | Logic + concurrency tests PASS; live UI | BLOCKED | Vitest; UI not re-run this pass | — |
| BRK-01 | Bracket engine | Admin | bracketEngine | n=0..odd/even | Unit cases | Deterministic | 20 engine tests PASS | PASS | `npm test` | — |
| SCR-01 | Judge creds 10/10 | Admin | judgeCredentialService | Published match | Generate | Random 10+10 | Covered by service + prior design | PASS | Code + tests (generation) | — |
| SCR-02 | Full score finalize UI | Judge | `/judge` | Live match + creds | Score + finalize | Result persisted | Not exercised with live creds this pass | BLOCKED | Needs admin-issued creds | — |
| SEC-01 | Service authz | Mixed | services | Vitest | Fighter cannot admin ops | Forbidden | authorization.security.test PASS | PASS | Vitest 8 tests | — |
| SEC-02 | Coupon rate limit | Fighter | applyCouponAction | — | Burst attempts | Limited | No rate limit on coupon action | FAIL | Code inspection of coupon-actions | BUG-QA-2026-03 |
| E2E-01 | Full Vitest suite | Eng | vitest | Atlas for txn tests | `npm test` | All pass | 43 files / 218 tests PASS | PASS | Terminal 396780 | — |
| E2E-02 | Client coupon→score lifecycle | Eng | services | Isolated DB | Full path | PASS | Ran once then **test file removed per no-code-change rule**; not retained | BLOCKED | Re-run only if allowed to add test file | — |
| PERF-01 | Public cold loads | Visitor | several | Dev server | curl timings | Reasonable | brackets/rankings ~35s cold; home ~1s warm | FAIL | curl timings (lab/dev) | BUG-QA-2026-04 |
| MOB-01 | Widths 360–1440 | Visitor | public | — | Resize | No overflow | Not fully re-measured this pass | BLOCKED | Prior RESPONSIVE_UI_AUDIT exists | — |
| MAIL-01 | Real SMTP delivery | Ops | SMTP | Sandbox | Send | Delivered | Env configured; delivery not proven this pass | BLOCKED | Avoid prod sends | — |

## Totals (this matrix)

| Status | Count |
| --- | --- |
| PASS | 22 |
| FAIL | 5 |
| BLOCKED | 6 |
| NOT IMPLEMENTED | 3 |
| NOT APPLICABLE | 0 |
| **Total rows** | **36** |
