# Up 'n Roll — Handover Checklist

| Field | Value |
|-------|-------|
| Prepared by | **Dimensity Labs** |
| Document version | **v1.0.0** |
| Date | **2026-11-27** |
| Git commit | **`4ffb794`** |
| Audience | Client stakeholders, technical owners, Dimensity Labs |

**How to use this checklist**

| Mark | Meaning |
|------|---------|
| ☐ | Open / not done |
| ☑ | Done (initial when complete) |
| **Verified** | Confirmable from repository at `4ffb794` |
| **Requires confirmation** | Not verifiable from the repo alone; owner/ops must confirm |

**Credentials transfer:** Do **not** put passwords, API keys, SMTP credentials, Mongo URIs with credentials, OAuth secrets, or `SESSION_SECRET` / `CRON_SECRET` values in this document, email, or chat. Transfer secrets via a **secure channel separately** (password manager share, encrypted vault, or agreed offline handoff). Confirm receipt out-of-band.

---

## 1. Repository access

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 1.1 | Source repository URL shared with client | **Requires confirmation** | ☐ |
| 1.2 | Client (or nominated maintainer) has clone / org access | **Requires confirmation** | ☐ |
| 1.3 | Branch protection / required CI checks agreed | **Requires confirmation** | CI workflow **Verified** in `.github/workflows/ci.yml` |
| 1.4 | Handover pack present at `docs/handover/` for commit `4ffb794` | **Verified** | ☐ Confirm client received pack |
| 1.5 | GitHub (or host) billing / org ownership transferred or retained | **Requires confirmation** | ☐ |

---

## 2. Deployment

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 2.1 | Production deploy procedure understood ([Deployment Guide](./UpnRoll_Deployment_Guide.md)) | **Verified** (docs) | ☐ Walkthrough done |
| 2.2 | Staging environment distinct from production (env vars) | **Requires confirmation** | ☐ |
| 2.3 | Production build succeeds on target host | **Requires confirmation** | CI build path **Verified** |
| 2.4 | Rollback procedure agreed (prior deploy SHA) | **Requires confirmation** | ☐ |
| 2.5 | `create-admin` / seed scripts used only on intended DB | **Requires confirmation** | ☐ |

---

## 3. Hosting

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 3.1 | Hosting provider selected and approved (OD-012) | **Requires confirmation** | `vercel.json` **Verified** in repo; provider choice open |
| 3.2 | Project linked / team access granted | **Requires confirmation** | ☐ |
| 3.3 | Single- vs multi-instance topology decided | **Requires confirmation** | Affects storage + rate limits |
| 3.4 | Runtime monitoring / uptime alerts | **Requires confirmation** | No Sentry/OTel in-repo (**Verified** absence) |
| 3.5 | Billing ownership for host | **Requires confirmation** | ☐ |

---

## 4. Domain & DNS

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 4.1 | Production domain chosen | **Requires confirmation** | ☐ |
| 4.2 | DNS / TLS configured to host | **Requires confirmation** | ☐ |
| 4.3 | `NEXT_PUBLIC_SITE_URL` set to canonical HTTPS origin | **Requires confirmation** | Variable **Verified** in `.env.example` |
| 4.4 | Google OAuth redirect URI matches production origin (if used) | **Requires confirmation** | `{origin}/api/auth/google/callback` |

---

## 5. Database

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 5.1 | Production MongoDB (e.g. Atlas) provisioned | **Requires confirmation** | ☐ |
| 5.2 | `MONGODB_URI` includes **database name** in path | **Verified** (requirement) | ☐ Applied in prod secrets |
| 5.3 | Network access / IP allowlist / auth for DB | **Requires confirmation** | ☐ |
| 5.4 | Staging DB separate from production | **Requires confirmation** | ☐ |
| 5.5 | Occupancy backfill assessed if divisions lack `filledCount` | **Requires confirmation** | Script exists; historical “not run” |

---

## 6. Backups

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 6.1 | Backup method documented (`mongodump` / Atlas) | **Verified** (docs) | See Deployment Guide §9 |
| 6.2 | Backup **owner** named | **Requires confirmation** | OD-011 |
| 6.3 | Retention window agreed | **Requires confirmation** | OD-011 |
| 6.4 | Restore drill performed (non-prod) | **Requires confirmation** | ☐ |
| 6.5 | Local-disk private files included in backup plan if `STORAGE_DRIVER=local` | **Verified** (not in mongodump) | Prefer `gridfs` on multi-instance |
| 6.6 | Atlas continuous backup enabled (if Atlas) | **Requires confirmation** | ☐ |

---

## 7. Environment & secrets

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 7.1 | Full env table reviewed ([Deployment Guide](./UpnRoll_Deployment_Guide.md)) | **Verified** (names in repo) | ☐ |
| 7.2 | Production secrets set on host (not in git) | **Requires confirmation** | ☐ |
| 7.3 | `SESSION_SECRET` ≥32 chars; rotation impact understood | **Verified** (behaviour) | ☐ |
| 7.4 | All five `SMTP_*` set for production | **Requires confirmation** | Asserted at prod runtime |
| 7.5 | `STORAGE_DRIVER` set explicitly in production | **Verified** (required) | ☐ Value chosen |
| 7.6 | `CRON_SECRET` set and matched to cron callers | **Requires confirmation** | ☐ |
| 7.7 | `UI_PREVIEW_ENABLED` not `true` on real production | **Verified** (guidance) | ☐ |
| 7.8 | `ADMIN_SEED_*` not left on public runtime env unless intentional | **Verified** (CLI-only intent) | ☐ |
| 7.9 | Secrets transferred via **secure channel separately** | **Requires confirmation** | ☐ Confirm receipt |

---

## 8. External accounts

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 8.1 | SMTP / email provider account ownership | **Requires confirmation** | Nodemailer SMTP; no Resend/SendGrid SDK |
| 8.2 | MongoDB Atlas (or host) account ownership | **Requires confirmation** | ☐ |
| 8.3 | Google Cloud OAuth client (optional) | **Requires confirmation** | Soft-fail if unset |
| 8.4 | Vercel (or host) account ownership | **Requires confirmation** | ☐ |
| 8.5 | GitHub org / Actions secrets (`CRON_OUTBOX_URL`, `CRON_SECRET`) | **Requires confirmation** | Workflow **Verified** |
| 8.6 | WhatsApp Business | N/A (mock only) | **Verified** — not live delivery |
| 8.7 | Payment gateway (Stripe/Razorpay/etc.) | N/A | **Verified** — manual UTR + screenshot only |

---

## 9. Admin access

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 9.1 | At least one production `ADMIN` user provisioned | **Requires confirmation** | `npm run create-admin` **Verified** |
| 9.2 | Admin credentials transferred securely (not in this pack) | **Requires confirmation** | ☐ |
| 9.3 | Client can access `/admin` after login | **Requires confirmation** | Layout role gate **Verified** |
| 9.4 | Password reset flow | N/A until implemented | **Verified** — not implemented |
| 9.5 | Judge accounts / scopes understood if used | **Requires confirmation** | Judge session tests exist |

---

## 10. Documentation

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 10.1 | Handover README index received | **Verified** | `docs/handover/README.md` |
| 10.2 | Deployment Guide received | **Verified** | This pack |
| 10.3 | Testing Report received | **Verified** | This pack |
| 10.4 | This checklist received | **Verified** | This pack |
| 10.5 | Additional pack docs (technical / API / DB / operating manual) as listed in README | **Requires confirmation** | Confirm full pack delivery |
| 10.6 | Client knows where open decisions live (`docs/decisions/open-decisions.md`) | **Verified** (path) | ☐ Walkthrough |

---

## 11. Training

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 11.1 | Admin portal walkthrough (events, payments, brackets, rankings, content) | **Requires confirmation** | ☐ |
| 11.2 | Fighter / grappler registration & payment flow walkthrough | **Requires confirmation** | ☐ |
| 11.3 | Judge scoring walkthrough (if in scope) | **Requires confirmation** | ☐ |
| 11.4 | Cron / outbox / email behaviour explained | **Requires confirmation** | Docs **Verified** |
| 11.5 | Support / escalation path agreed | **Requires confirmation** | ☐ |

---

## 12. Testing

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 12.1 | Automated suite inventory (50 test files) recorded | **Verified** | [Testing Report](./UpnRoll_Testing_Report.md) |
| 12.2 | Fresh `npm test` run recorded for go-live SHA | **Requires confirmation** | Not re-run for this research pack |
| 12.3 | Staging smoke: register → pay → approve → bracket → score → public | **Requires confirmation** | ☐ |
| 12.4 | SMTP delivery verified to real inbox | **Requires confirmation** | ☐ |
| 12.5 | Storage upload/download round-trip on chosen driver | **Requires confirmation** | ☐ |
| 12.6 | Client UAT checklist completed | **Requires confirmation** | `docs/qa/CLIENT_UAT_CHECKLIST.md` |
| 12.7 | Historical Phase 6 / E2E treated as non-current | **Verified** (caveat) | Do not use as sole sign-off |

---

## 13. Maintenance

| # | Item | Status | Notes / owner |
|---|------|--------|---------------|
| 13.1 | Who runs deploys after handover | **Requires confirmation** | ☐ |
| 13.2 | Who monitors cron / outbox failures | **Requires confirmation** | ☐ |
| 13.3 | Dependency / Node upgrade policy | **Requires confirmation** | CI Node 22 **Verified** |
| 13.4 | GitHub Actions outbox workflow enabled only when needed | **Requires confirmation** | Disable between tournaments |
| 13.5 | Rate-limit limitation understood (in-memory; not shared) | **Verified** (code) | Multi-instance → **Requires confirmation** mitigation |
| 13.6 | CSP remains Report-Only until nonce/hash strategy | **Verified** | Do not flip to enforce casually |

---

## 14. Known issues & open decisions

Summarized from handover research / `docs/decisions/open-decisions.md`. Engineering must not close OD rows by assumption.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 14.1 | Hosting / integrations approvals (OD-012) | P0 | **Requires confirmation** ☐ |
| 14.2 | SMTP delivery unproven as standing guarantee | P0 | **Requires confirmation** ☐ |
| 14.3 | Backup ownership + retention (OD-011) | P0 | **Requires confirmation** ☐ |
| 14.4 | Multi-instance + local disk / in-memory rate limit | P0 | **Requires confirmation** ☐ |
| 14.5 | GridFS production readiness / key persistence | P0 | **Requires confirmation** ☐ |
| 14.6 | Occupancy backfill if needed | P0 | **Requires confirmation** ☐ |
| 14.7 | Formats beyond single-elim (OD-003); RR for n=3 | P1 | Open — **Requires confirmation** |
| 14.8 | Ranking methodology (OD-004); public `/rankings` vs manual | P1 | Open — **Requires confirmation** |
| 14.9 | Fee amounts / UTR policy (OD-005); payment QR art (OD-006) | P1 | **Requires confirmation** |
| 14.10 | Cancel/transfer/refund policy (OD-007/008) | P1 | Workflow exists; policy open |
| 14.11 | Store / Seminars are ComingSoon stubs | P1 | **Verified** |
| 14.12 | Password reset not implemented | P1 | **Verified** |
| 14.13 | WhatsApp real send not implemented | P2 | **Verified** (mock) |
| 14.14 | Client deferred list (RR picker, season locks, brand assets, etc.) | P1/P2 | **Requires confirmation** |

---

## 15. Pending deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| 15.1 | Final production host + domain live | **Requires confirmation** ☐ |
| 15.2 | Production secrets + admin account handoff (secure channel) | **Requires confirmation** ☐ |
| 15.3 | Fresh automated + staging UAT evidence attached to go-live SHA | **Requires confirmation** ☐ |
| 15.4 | Client-approved email copy / brand assets (OD-009, OD-014) | **Requires confirmation** ☐ |
| 15.5 | Remaining handover pack documents per README (if not already delivered) | **Requires confirmation** ☐ |
| 15.6 | Training sessions completed | **Requires confirmation** ☐ |

---

## 16. Ownership transfer

| # | Asset | From | To | Confirmed |
|---|-------|------|-----|-----------|
| 16.1 | Source code repository | Dimensity Labs / prior owner | ________________ | ☐ **Requires confirmation** |
| 16.2 | Hosting project | ________________ | ________________ | ☐ **Requires confirmation** |
| 16.3 | Domain / DNS | ________________ | ________________ | ☐ **Requires confirmation** |
| 16.4 | MongoDB / Atlas project | ________________ | ________________ | ☐ **Requires confirmation** |
| 16.5 | SMTP / email provider | ________________ | ________________ | ☐ **Requires confirmation** |
| 16.6 | Google OAuth client (if any) | ________________ | ________________ | ☐ **Requires confirmation** |
| 16.7 | GitHub Actions / cron secrets | ________________ | ________________ | ☐ **Requires confirmation** |
| 16.8 | Production admin accounts | ________________ | ________________ | ☐ **Requires confirmation** |
| 16.9 | Documentation & handover pack | Dimensity Labs | ________________ | ☐ **Requires confirmation** |
| 16.10 | Ongoing maintenance responsibility | ________________ | ________________ | ☐ **Requires confirmation** |

---

## 17. Credentials transfer note

| Rule | Detail |
|------|--------|
| What to transfer | `MONGODB_URI`, `SESSION_SECRET`, all `SMTP_*`, `CRON_SECRET`, `GOOGLE_*` (if used), host tokens, admin passwords, DB console access |
| How | Secure channel **separately** from this checklist (e.g. 1Password / Bitwarden share, encrypted vault, or in-person) |
| What never to do | Paste live secrets into git, this Markdown pack, tickets, or unencrypted email |
| After transfer | Recipient rotates any shared temporary secrets; confirm old access revoked where appropriate |

Recipient acknowledgement: ☐ Secrets received via secure channel on __________ (date) — **Requires confirmation**

---

## 18. Sign-off

### Dimensity Labs (delivering party)

| Field | Value |
|-------|-------|
| Name | ______________________________ |
| Role | ______________________________ |
| Signature | ______________________________ |
| Date | ______________________________ |

I confirm that the handover pack for commit **`4ffb794`** has been prepared and that items marked **Verified** reflect the repository state as of that commit. Items marked **Requires confirmation** remain the receiving party’s operational responsibility until closed.

### Receiving party (client / owner)

| Field | Value |
|-------|-------|
| Name | ______________________________ |
| Organisation | ______________________________ |
| Role | ______________________________ |
| Signature | ______________________________ |
| Date | ______________________________ |

I confirm receipt of repository access (or agreed alternative), documentation, and that credentials (if any) were transferred via a **secure channel separately**. I understand known issues and open decisions listed above and accept ownership of items marked **Requires confirmation**.

### Optional technical witness

| Field | Value |
|-------|-------|
| Name | ______________________________ |
| Role | ______________________________ |
| Signature | ______________________________ |
| Date | ______________________________ |

---

*End of Handover Checklist — Dimensity Labs · v1.0.0 · 2026-11-27 · `4ffb794`*
