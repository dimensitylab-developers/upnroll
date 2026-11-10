# Implementation Changelog — Production Hardening

Branch: `suraj`  
Window: 2026-11-09

## Phase 0
- Added remediation checklist and commit log.

## Phase 1 — Security
- `listRegistrationsForEvent(actor, eventId)` + `assertAdmin`
- Session cookie rotation on `createSession`
- Rate limits on verify/resend
- ObjectId schemas + service guards
- Google OAuth HttpOnly state cookie; DISABLED rejection
- `requireActor("FIGHTER")` on fighter mutations
- Transfer invite `tokenHash` + transactional claim
- HSTS + Permissions-Policy

## Phase 2 — Database integrity
- Payment queue filter + limit 200; detected content-type on put
- Transfer rewrites `PaymentSubmission.userId`
- Bracket duplicate-key → ConflictError
- Indexes: payment status/createdAt, transfer registration/claimedAt, match eventId/status

## Phase 3 — File storage
- Stream private downloads via `open` + abort-aware web stream
- Upload metadata purpose/owner
- File storage security report

## Phase 4 — Backend quality
- WhatsApp notifier port (mock)
- Match ObjectId validation

## Phase 5 — Next.js
- Fighter new-registration page passes fighter actor to open-division listing

## Phase 6 — Integrations
- SMTP connection/greeting/socket timeouts
- Google OAuth vars in `.env.example`

## Phase 7 — Errors / logging
- CastError → ValidationError
- Structured JSON logger with redaction; route `fail()` logs server-side

## Phase 8 — Cleanup / docs
- Hardening reports, security reports, commit log, manual verification checklist
- No aggressive dead-code deletion without path verification
