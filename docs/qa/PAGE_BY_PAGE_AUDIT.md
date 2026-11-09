# Page-by-Page Audit

Observed via browser and/or HTTP status on 2026-11-09.  
Statuses: PASS | FAIL | REDIRECT | BLOCKED | PARTIAL

| Route | Loads | Content | Navigation | Interactions | Responsive | Status |
|-------|-------|---------|------------|--------------|------------|--------|
| `/` | Yes | Hero, manga panels, fighting gallery, happy stack, about, footer | Header/footer links present | Pitch dismiss, gallery, chat inventoried; Shuffle click intercepted by overlay | Spot-checked | PASS (after `902a3a1`) |
| `/events` | Yes | Upcoming + held cards, how-a-fight-runs | Links to brackets/schedule/results/held | Event cards clickable | Not fully matrixed | PASS |
| `/events/up-n-roll-superfight-series` | Yes (HTTP 200) | Superfight landing | — | Spot HTTP only | — | PASS |
| `/events/phase3-qa-trials-1793805696744` | Yes (HTTP 200) | QA trial event | — | Spot HTTP | — | PASS |
| `/events/held/no-gi-12-july-2026` | Yes | Held archive record | — | Spot browser/HTTP | — | PASS |
| `/brackets` | Yes (HTTP 200) | Live brackets board | — | Spot HTTP | — | PASS |
| `/rankings` | Yes | Rankings + athlete cards | Fighter profile links | Spot | — | PASS |
| `/rankings/demo` | Yes (HTTP 200) | Demo rankings | — | Spot HTTP | — | PASS |
| `/faq` | Yes (HTTP 200) | FAQ board | — | Spot HTTP | — | PASS |
| `/about` | Yes (HTTP 200) | About story | — | Spot HTTP | — | PASS |
| `/store` | Yes | Coming soon | — | — | — | PASS (placeholder) |
| `/seminars` | Yes | Coming soon | — | — | — | PASS (placeholder) |
| `/announcements` | Yes (HTTP 200) | Content list | — | Spot HTTP | — | PASS |
| `/policies` | Yes (HTTP 200) | Policies | — | Spot HTTP | — | PASS |
| `/fighters` | Yes (HTTP 200) | Redirects/rankings behavior | — | Spot HTTP | — | PASS |
| `/fighters/suketu` | Yes (HTTP 200) | Public profile | — | Spot HTTP | — | PASS |
| `/login` | Yes | Email/password + Google link | Register link | Empty submit HTML5 validation | — | PASS |
| `/register` | Yes | Signup form | Login link | Full signup → verify | — | PASS |
| `/verify` | Yes | Code entry | Resend | Code confirm → session | — | PASS |
| `/fighter/dashboard` | Yes | Welcome + empty sections | Fighter nav | Register now / View all | Mobile header OK | PASS |
| `/fighter/profile` | Yes | Full grappler form | Nav | Save not fully submitted (no fake Aadhaar/photo) | — | PARTIAL |
| `/fighter/registrations` | Not deeply opened after list | — | Nav exists | — | — | PARTIAL |
| `/fighter/registrations/new` | Yes | Division + full form; Continue disabled until complete | Nav | Incomplete submit blocked | — | PASS |
| `/fighter/matches` | Not browser-walked | — | Nav | — | — | NOT FULLY TESTED |
| `/fighter/requests` | Not browser-walked | — | Nav | — | — | NOT FULLY TESTED |
| `/fighter/transfer/[token]` | Not tested | Needs invite token | — | — | — | NOT TESTABLE |
| `/admin` (+ all admin children) | Unauth → login; Fighter → fighter dashboard (after fix) | Admin UI | — | — | — | BLOCKED (no admin creds) |
| `/ui-preview` | HTTP 200 local | Preview | — | Spot HTTP | — | PASS (dev) |
| `/api/health` | 200 | `{ok:true}` expected | — | — | — | PASS |
| `/api/auth/google` | 307 unavailable | Soft-fail | — | — | — | BLOCKED (config) |

## Totals

- Discovered app `page.tsx` routes: **42**
- HTTP/browser loaded successfully in this pass: **public + auth + fighter core ~30**
- With errors before fixes: home/public `force-dynamic` 500s
- Admin product pages: **not functionally exercised** (blocked)
