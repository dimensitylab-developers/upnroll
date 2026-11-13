# Client Demo Script — Up 'n Roll

**Purpose:** Reproducible walkthrough for a client demonstration.  
**Rule:** Do not put real passwords, judge secrets, or PII into chat logs or commits. Keep credentials in a private operator note.

**Suggested environment:** Staging or a dedicated demo database — **not** production writes.  
**Prep time:** 20–30 minutes before the call.

## Accounts (synthetic — fill privately)

| Role | Email / ID placeholder | Starting state |
| --- | --- | --- |
| Admin | `ADMIN_DEMO_EMAIL` | Active admin session available |
| Fighter A (coupon) | `FIGHTER_A_EMAIL` | Verified email, profile complete |
| Fighter B (standard fee) | `FIGHTER_B_EMAIL` | Verified email, profile complete |
| Fighter C / D | as needed for bracket size | Confirmed registrations |
| Judge | Issued at step 7 | No personal account |

**Private operator pad (not committed):** passwords, coupon code, judge username/password, QR image files.

## Reset instructions (end of demo)

1. Disable or leave redeemed demo coupons documented.  
2. Do not delete real client fighters. Prefer a dedicated demo event slug (`demo-*`).  
3. Revoke judge credentials after the scoring step.  
4. Clear browser judge cookie / logout admin and fighters.

---

## Step 1 — Public tournament page

- **Start:** Logged out browser (or incognito).  
- **Do:** Open `/` → **Events** → open Superfight / demo event.  
- **Expect:** Branding, date, divisions, **Register to compete**, links to brackets/schedule/results.  
- **Reset:** N/A.

## Step 2 — Fighter registration

- **Account:** Fighter A.  
- **Do:** Register (if new) → verify email → login → **New registration** → pick open division → tick Consent + Agreement.  
- **Expect:** Registration created as awaiting payment (not confirmed).  
- **Reset:** Use a fresh synthetic email if repeating.

## Step 3 — Single-use coupon and discounted QR

- **Account:** Fighter A; Admin has created coupon bound to discounted payment option.  
- **Do:** Toggle **Do you have a coupon code?** → apply valid code.  
- **Expect:** Discounted amount + discounted QR shown.  
- **Negative (optional):** Fighter B tries same code → refused.  
- **Reset:** Admin may need a new coupon for a second full dry-run.

## Step 4 — Payment evidence submission

- **Account:** Fighter A (and B for standard fee).  
- **Do:** Pay via shown QR offline (or simulate) → upload screenshot + UTR → submit.  
- **Expect:** Status pending review; **not** auto-verified.  
- **Reset:** N/A.

## Step 5 — Admin verification

- **Account:** Admin.  
- **Do:** `/admin/payments` (or event payments) → open submission → approve A; optionally reject then resubmit B.  
- **Expect:** Approved → confirmed; rejected shows reason; fighter views match admin.  
- **Reset:** Prefer demo event only.

## Step 6 — Bracket / match assignment

- **Account:** Admin.  
- **Do:** Event → divisions → generate bracket (manual or seeded) → publish → open matches.  
- **Expect:** Pairings without duplicates; byes if odd count.  
- **Reset:** Do not regenerate over completed matches in a live client card without agreement.

## Step 7 — Match-specific judge login

- **Account:** Admin then Judge.  
- **Do:** Generate judge credentials for one published match → copy once to private pad → open `/judge/login` → sign in.  
- **Expect:** 10-character username and password; console shows only that match.  
- **Reset:** Regenerate/revoke after demo; old password must stop working.

## Step 8 — Scoring and result finalization

- **Account:** Judge (or admin scoring if used).  
- **Do:** Apply points per configured rules → finalize with allowed outcome.  
- **Expect:** Winner set; further scoring blocked as designed; public results update after refresh/tag invalidation.  
- **Reset:** Corrections only via approved admin correction path.

## Step 9 — Fighter history / ranking update

- **Account:** Fighter winner + Admin rankings if needed.  
- **Do:** Open fighter dashboard / public fighter card / `/rankings`.  
- **Expect:** Win reflected; rankings show placeholder 3 pts/win labeling.  
- **Client note:** Official formula still pending (OD-004).

## Step 10 — Public results and admin overview

- **Account:** Visitor + Admin.  
- **Do:** Public event results + admin dashboard totals.  
- **Expect:** Same winner; admin overview coherent with DB for the demo event.  
- **Reset:** End session; revoke judge access.

---

## Demo risk callouts (say out loud)

1. Store/Seminars are coming soon.  
2. Rankings formula is temporary.  
3. Payments are manual QR + organizer review — never automatic.  
4. Warm the slow pages once before the call (`/brackets`, `/rankings`).  
5. Missing URLs may show a 404 page with HTTP 200 in current Next cache mode — cosmetic for demo, fix before SEO go-live.
