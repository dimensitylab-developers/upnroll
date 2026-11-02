# Client Acceptance Checklist — Up 'n Roll

Phase 6. Plain-language summary of what's built, what's been verified live against a real database (not just unit-tested), and what's still blocked on a client decision. Written to be read without needing to open the codebase.

## What's built and verified live (Phase 6, against a real MongoDB)

The full fighter-to-admin lifecycle was actually run end to end against a real database this phase, not just unit-tested:

- ✅ A fighter can register for a division, submit a duplicate registration and have it correctly rejected
- ✅ Payment submission (UTR + screenshot), admin approval, and double-approval correctly rejected (no double-charging/double-confirming)
- ✅ Bracket generation, publishing, and recording a real match result with the winner correctly persisted
- ✅ Ranking recalculation producing a real win/loss record from real match data
- ✅ A published FAQ is correctly found by the chatbot for a related real question
- ✅ A cancellation request, admin approval, and the registration actually ending up `CANCELLED`

All test data created during this verification was deleted afterward — the database contains only what you put there (the admin account from `create-admin.ts` and the demo event from `seed-demo.ts`, if you ran those).

## What's built but only unit-tested (not yet exercised live)

Everything else in Phases 2–5 — admin event/division management UI, the match-result correction flow, cancellations beyond the one case above, content/media management, the public pages — is covered by 93 passing unit/logic tests but hasn't been clicked through in a browser against live data by a human. Worth a manual walkthrough before go-live, not because anything is known to be broken, but because this is the honest distinction between "the logic is correct" and "a person has used it."

## What is explicitly simulated or incomplete, by design

- **Payment verification is manual, always** — a fighter's UTR and screenshot are claims, never auto-verified. This is the approved design (Part E), not a shortcut.
- **Payment screenshots are stored on local disk**, not a real cloud storage service — works for a single server, not for a scaled-out deployment. See `docs/deployment/deployment-guide.md`.
- **Emails are logged to the server console, not actually sent** — every email the app would send (registration confirmation, payment decisions, request decisions) is visible in server logs but doesn't reach anyone's inbox yet. Needs a real email provider (your choice — not picked for you).
- **The ranking point formula is a placeholder** (3 points per win) — not a real ranking system, clearly labeled everywhere it appears. Needs your approved methodology.
- **The chatbot only answers from FAQs you publish** — it does not use AI/an external service, and it says so honestly when it doesn't know an answer rather than guessing.
- **Media (photos/video links) are external URLs you provide**, not an upload feature — no file storage is wired up yet.
- **The public homepage doesn't exist yet** — `/ui-preview` is the design reference; the real homepage with your actual event photography/branding hasn't been built. It's also now locked out of any real production deployment by default (see below).

## Decisions still needed from you before this can go further

These are tracked in detail in `docs/decisions/open-decisions.md` — the short version:

- What combat discipline(s) and weight classes/divisions you actually run (the system currently accepts free-text division names rather than assuming MMA/UFC-style categories)
- Registration fees per event/division, and your actual payment QR code image
- A real UTR/transaction-reference format to validate against (currently a generic placeholder)
- Cancellation/transfer policy specifics — windows, fees, eligibility
- Your approved ranking formula
- Hosting, object storage, and email provider choices
- Your brand assets (logo, approved photography) — everything visual right now is built around the manga-panel/halftone look with placeholder content, not final branding

## Security posture (Phase 6 additions)

- Rate limiting on login/registration (single-server; needs upgrading if this ever runs on multiple servers at once)
- Confirmed Next.js's built-in CSRF protection covers every form submission in the app (checked the framework source directly, not assumed)
- `/ui-preview` is now locked out of any real deployment by default — it only works in local development unless someone deliberately turns it on for a review environment
- A security pass (OWASP-style review of the actual code) is documented separately — see `docs/phases/06-production-hardening.md`

## Before a real production launch

See `docs/deployment/deployment-guide.md` for the full list — the two that matter most: a real database connection (this phase proved the app works with one — now it needs to be the production one, not a temporary review database), and the storage/email provider decisions above.
