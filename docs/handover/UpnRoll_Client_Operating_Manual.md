# Up 'n Roll — Client Operating Manual

| Field | Value |
|-------|--------|
| Prepared by | **Dimensity Labs** |
| Document | Client Operating Manual |
| Version | 1.0.0 |
| Date | 2026-11-27 |
| Git commit | `4ffb794` |
| Audience | Client administrators (non-technical) |

**Screenshots:** Not captured for this pack. Use the exact paths below during training and add images to `docs/handover/screenshots/` if needed.

**Important naming:** Athlete accounts use the **Grappler** portal at `/grappler`. Older `/fighter` links redirect automatically. Use `/grappler` in all new instructions.

---

## 1. What this system does

Up 'n Roll helps you run a combat sports tournament end to end:

1. Create an event and open registration  
2. Collect grappler entries and UPI payment proofs  
3. Confirm payments  
4. Build brackets and schedule mats  
5. Let judges score (or record results yourself)  
6. Publish results and rankings  
7. Keep the public website content up to date  

You work mainly in the **Admin** area. Grapplers use their own portal. Judges use a separate login for the mat console.

---

## 2. Roles at a glance

| Who | Where they work | What they can do |
|-----|-----------------|------------------|
| **Admin** | `/admin` | Everything operational: events, payments, brackets, content, settings |
| **Grappler** | `/grappler` | Profile, register, pay, see matches, submit cancel/transfer requests |
| **Judge** | `/judge` | Score one assigned match (shared username/password you issue) |

There is **no separate “verifier” role**. Only admins can approve payments and requests.

---

## 3. How to access Admin

1. Open your site and go to **`/login`**.  
2. Sign in with the admin email and password (created by your technical team with the create-admin script — not via public sign-up).  
3. You should land on **`/admin`** (Admin Desk).  
4. If you land on the grappler dashboard instead, that account is not an Admin. Ask your technical contact to promote it.

**Left nav (Admin):** Desk · Events · Grapplers · Payments · Requests · Rankings · Content · Settings · Media · Outbox · Audit.

Sign out from the account control in the portal when finished.

---

## 4. Create a tournament (event)

### 4.1 Create the event

1. Go to **`/admin/events`**.  
2. Fill **Create event**:  
   - Name  
   - Slug (lowercase letters, numbers, hyphens — used in public URLs)  
   - Venue  
   - Start date  
   - Registration opens / closes  
   - Fee amount and currency (default INR)  
   - Number of mats  
3. Submit. The event is created as **DRAFT**.  
4. Click the event row to open the **Event hub** at **`/admin/events/[id]`**.

You cannot delete an event from the UI. Plan names carefully.

### 4.2 Configure the event hub

On **`/admin/events/[id]`**:

| Task | What to do |
|------|------------|
| Overview | Edit name, description, venue, dates, fee |
| Status | Set `DRAFT` → `REGISTRATION_OPEN` when ready to accept entries; later `REGISTRATION_CLOSED`; finally `COMPLETED` |
| Mats | Set mat count (must be at least 1) |
| Default payment QR | Upload the UPI/QR image grapplers will scan |
| Doors (deep pages) | Divisions · Brackets · Matches · Fees & coupons · Scoring rules |

**Status is manual.** Opening and closing registration does not happen automatically by calendar.

### 4.3 Divisions

1. Open **`/admin/events/[id]/divisions`**.  
2. Optionally click **Seed** to create the Road-to-Super-Fight grid (gender × weight × experience).  
3. Or **Create division** with name, discipline, and capacity.  
4. Return to the event hub to adjust names/capacity if needed.

There is no delete-division button in the UI.

### 4.4 Scoring rules (before fight day)

1. Open **`/admin/events/[id]/scoring-rules`**.  
2. Edit the JSON rules so `configured` is true and outcomes (and points, if you use score wins) are set.  
3. Save.

Judges cannot score live until rules are ready. Prefer finishing this before you issue judge logins.

---

## 5. Configure registration & fees

### 5.1 Open registration

On the event hub, set status to **`REGISTRATION_OPEN`**. Grapplers can then enter from public event pages or **`/grappler/registrations/new`**.

Registration only works when:

- Status is `REGISTRATION_OPEN`  
- Current time is between registration opens and closes  
- The chosen division still has capacity  

### 5.2 What grapplers do (for your awareness)

Typical grappler path:

1. Register at `/register` → confirm email at `/verify` → login  
2. Complete profile at `/grappler/profile` (photo, identity proof; parental consent if under 18; waiver)  
3. Register for a division  
4. Pay via UPI outside the app using your QR  
5. Upload UTR + screenshot at `/grappler/registrations/[id]/payment`  
6. Wait for admin approval  

**Email `/verify` is account confirmation only.** It is not payment verification.

---

## 6. Payment QR & fee tiers

1. Go to **`/admin/events/[id]/payments`** (also available as a panel on the event hub).  
2. Add or edit **payment options** (tiers): label, amount, active, default.  
3. Upload a **QR image per option** (or use the default QR on the hub).  
4. Mark one option as default for normal registrations.

Coupons always point at a payment option (alternate price/QR). They are **not** percentage discounts.

There is **no card gateway**. Money moves outside the app (UPI/bank). The platform stores proof and your decision.

---

## 7. Coupons

On the same Fees & coupons page:

1. Choose a payment option.  
2. **Generate coupon** (optional custom code and expiry).  
3. **Copy the code immediately** — it is shown once after create.  
4. Share the code with the grappler.  
5. If needed: **Disable** an unused code, or **Release** a redeemed code (reason required). Released codes become disabled; they are not reused automatically.

Grapplers can apply a coupon during registration or on the payment desk.

---

## 8. Manage participants

### 8.1 From the event hub

On **`/admin/events/[id]`**, review the registrations list (status, grappler link). You can **Withdraw** an active registration when needed (releases the seat).

### 8.2 Grappler roster & sheets

1. **`/admin/grapplers`** — searchable list (name, email, academy, city).  
2. Open **`/admin/grapplers/[userId]`** for the full registration sheet (personal, competition, medical, terms; identity / consent images).  

Admin sheets are **read-only**. Grapplers edit their own profiles.

### 8.3 Cancel / transfer requests

1. Grapplers submit requests at `/grappler/requests`.  
2. Admins decide at **`/admin/requests`**.  
3. Approve or reject with a note.  

**Cancellation:** seat released; system records a refund **percent** (50% if ≥30 days before event start, otherwise 0%). This does **not** send money — you refund out of band if policy says so.  

**Transfer:** moves the seat to another division in the same event (if capacity allows).

### 8.4 Export

**Not implemented.** There is no CSV/Excel download for participants, payments, or results in the admin UI. Use the on-screen lists and screenshots, or ask engineering for a future export if required.

---

## 9. Verify payments

1. Go to **`/admin/payments`** (pending items also appear on `/admin`).  
2. Filter by status, event, search, or dates if needed.  
3. Open **Review** on a pending row.  
4. Check the screenshot and UTR against your bank/UPI app.  
   - A **duplicate UTR** badge is a warning only — it does not block you.  
5. **Approve** (optional note) → registration becomes **CONFIRMED** (bracket-eligible).  
6. **Reject** (reason required) → grappler can resubmit payment.

Queue listing is capped (about 200 rows). Only **ADMIN** can decide. Approvals and rejections email the grappler when mail is configured.

---

## 10. Generate brackets

Do this after enough registrations are **CONFIRMED**.

1. Optionally set event status to **`REGISTRATION_CLOSED`**.  
2. Open **`/admin/events/[id]/brackets`**.  
3. For each division:  
   - Reorder confirmed participants (manual seeding), **or** use random with a seed.  
   - **Generate** a draft single-elimination bracket (byes are handled automatically).  
   - Preview the bracket.  
   - When ready, **Publish**.  

**Publish is one-way.** You cannot unpublish. You cannot regenerate after publish. Double-check the order before publishing.

Published brackets appear on the public site (`/events/[slug]/brackets`, live boards).

---

## 11. Schedule matches

1. Open **`/admin/events/[id]/matches`**.  
2. Use **Upcoming** / **Completed** tabs.  
3. For matches with both competitors: set **scheduled time** and **mat**.  
4. If the system warns about a clash (same mat or same grappler overlapping), either change the plan or confirm override if your process allows it.

Mats are also pre-assigned when brackets generate; scheduling refines fight-day timing.

---

## 12. Judge credentials

Still on **`/admin/events/[id]/matches`**:

1. Bracket for that division must be **Published**.  
2. Match must have both competitors.  
3. **Generate** judge credentials.  
4. **Copy username and password immediately** — the password is shown once.  
5. Give them to the mat official.  
6. **Regenerate** if lost (old logins stop working). **Revoke** to cut access without issuing a new pair.

Judges are not full user accounts. Each credential is for **one match**.

---

## 13. Operate the Judge panel

1. Official opens **`/judge/login`**.  
2. Enters the username and password you issued.  
3. Lands on **`/judge`** scoring console for that match.  
4. Records points / penalties from your event scoring rules; can undo the last reversible action.  
5. **Finalize** with the correct outcome when the bout ends.  
6. Signs out when done.

**Admin alternative:** On the matches page, you can **Record result** for a scheduled match (winner + method) without live scoring. Prefer **one path per match** (either judge finalize **or** admin record) so results stay consistent.

After a result, winners advance automatically in the bracket. Admin can **Correct** a completed result only if the next match is not already decided.

---

## 14. Review results

| View | Path |
|------|------|
| Admin matches | `/admin/events/[id]/matches` (Completed tab) |
| Public results | `/events/[slug]/results` |
| Public schedule | `/events/[slug]/schedule` |
| Live brackets hub | `/brackets` |

Grapplers see their own bouts at `/grappler/matches`.

---

## 15. Rankings

1. Open **`/admin/rankings`**.  
2. After matches finish, click **Recalculate** (or rely on background jobs if your host runs the outbox cron).  
3. You may add **manual ranking** rows for desk use.  

**Public board note:** The public page **`/rankings`** currently builds from confirmed registrations and computed win/loss points. Manual ranking entries on the admin page are **not yet shown** on the public board. Treat public points as provisional until product signs off a final ranking formula.

---

## 16. Website content & settings

| Task | Path | Steps |
|------|------|-------|
| FAQ / announcements / policies | `/admin/content` | Create or edit → Publish / Unpublish. Published FAQ also feeds the on-site help chatbot (keyword matching, not AI). |
| Media gallery links | `/admin/media` | Add caption + external URL. Create only (no edit/delete UI). |
| House name & public contact | `/admin/settings` | Save display name; Instagram, email, phone, city for the public footer. |
| Failed email/reminder jobs | `/admin/notifications` (nav: **Outbox**) | Fix SMTP/config if needed → Retry failed jobs. |
| Audit trail | `/admin/audit` | Read-only recent admin/user actions. |

Public pages that reflect this work include `/faq`, `/announcements`, `/policies`, and footer contact.

---

## 17. Complete the tournament

Suggested close-out checklist:

1. All matches decided (judge finalize or admin record).  
2. Recalculate rankings; spot-check `/rankings`.  
3. Review public results / brackets for the event slug.  
4. Decide remaining cancel/transfer requests on `/admin/requests`.  
5. On the event hub, set status to **`COMPLETED`**.  
6. Optionally unpublish outdated announcements; leave historical event content as needed.  
7. Retry any failed Outbox jobs.  
8. Confirm ops refunds for approved cancellations (outside the app).  

There is no automatic “archive event” button beyond setting **COMPLETED**.

---

## 18. Day-of quick reference

| Need | Go to |
|------|--------|
| Desk overview | `/admin` |
| Pending money | `/admin/payments` |
| Pending cancel/transfer | `/admin/requests` |
| Event control | `/admin/events/[id]` |
| Brackets | `/admin/events/[id]/brackets` |
| Mats / judges / results | `/admin/events/[id]/matches` |
| Judge console | `/judge` (after `/judge/login`) |
| Public live board | `/brackets` |

---

## 19. Limits you should expect

- No payment auto-capture — admin review only  
- No bank refund automation — percent is recorded for ops  
- No participant CSV export  
- No event or division delete  
- Bracket publish cannot be undone  
- Store and Seminars public pages are “Coming soon”  
- Password reset for accounts is not available in the product UI  

For engineering detail, see **UpnRoll_Technical_Documentation.md** in this folder.

---

*Dimensity Labs · Up 'n Roll Client Operating Manual · v1.0.0 · 2026-11-27 · commit `4ffb794`*
