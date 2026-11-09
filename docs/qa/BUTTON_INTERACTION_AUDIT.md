# Button & Interactive Element Audit

Not every decorative control on every page was clicked. Elements below were **observed in live snapshots** and interacted with where marked.

| Page | Element | Expected Action | Actual Result | Status |
|------|---------|-----------------|---------------|--------|
| `/` | Nav Events/Seminars/Brackets/Rankings/FAQ/About/Store | Navigate | Links present; Events verified | WORKING |
| `/` | Login / Sign up / Dashboard | Auth portals | Dashboard shown when fighter logged in | WORKING |
| `/` | Dismiss pitch | Close popup | Worked earlier in session | WORKING |
| `/` | Fighting Prev/Next / Still N / sound | Gallery control | Present; not all clicked | PARTIALLY WORKING |
| `/` | Shuffle | Reshuffle polaroids | Click intercepted by overlapping span | BROKEN / DEAD HIT TARGET |
| `/` | Happy moment 1–13 | Lift card | Present; not all clicked | PARTIALLY WORKING |
| `/` | Open support chat | Open chatbot | Present collapsed | NOT FULLY TESTED |
| `/` | Full story / Next card | Navigate | Links present | WORKING |
| `/login` | Sign in | Submit credentials | Empty → browser required validation | WORKING |
| `/login` | Continue with Google | OAuth | Redirects unavailable without env | BLOCKED BY MISSING CONFIGURATION |
| `/login` | Register | Go to signup | Link works | WORKING |
| `/register` | Sign up | Create account | Created test fighter; pending state shown | WORKING |
| `/verify` | Confirm | Verify email | Succeeded; created session | WORKING |
| `/verify` | Send a new code | Resend | Present; not retested after success | NOT FULLY TESTED |
| Fighter nav | Dashboard/Profile/Registrations/Matches/Requests | Route change | Profile + new registration verified | WORKING |
| Fighter | Sign out | Logout | Present; not clicked this pass (preserve session) | NOT TESTED |
| Fighter dashboard | Register now / View all | Navigate | Links present | WORKING |
| `/fighter/registrations/new` | Division combobox | Select division | Present collapsed | WORKING (UI) |
| `/fighter/registrations/new` | Continue to payment | Submit | Correctly **disabled** until form complete | WORKING |
| `/fighter/profile` | Save profile | Persist | Not submitted (would need full PII + photo) | NOT TESTABLE safely |
| Admin actions | All | Admin ops | No admin session | BLOCKED |

## Counts (this pass)

- Interactive elements inventoried from key pages: **~80+** on home alone; fighter profile ~35 controls
- Clicked/exercised safely: **~15–20**
- Broken hit targets found: **1** (home Shuffle overlap)
- Dead controls: none confirmed beyond placeholders (Store/Seminars are intentional coming-soon pages)
- Blocked: Google OAuth, admin suite, full registration payment (needs photo + complete form + admin review)
