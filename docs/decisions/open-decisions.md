# Open Decisions Log — Up 'n Roll

Tracks everything still pending client approval. Nothing here is to be treated as an approved requirement or implemented as a production default. Preview fixtures in `/ui-preview` must use clearly-labeled fictional data for every item below, not a guessed real value.

| ID | Decision needed | Why it's open | Blocks |
|---|---|---|---|
| OD-001 | Actual combat discipline(s) run by Up 'n Roll (MMA only? grappling/submission too? mixed events?) | Part C explicitly forbids assuming MMA-only or UFC-style disciplines | Division taxonomy, fighter profile "discipline" field, rules content |
| OD-002 | Weight classes / age/eligibility categories | No UFC-style weight classes may be assumed | Division model, registration eligibility checks |
| OD-003 | Bracket format(s) to support (single elimination confirmed as baseline; others?) | Part N: only approved formats get implemented | Bracket engine scope, PFL-style standings-table view (research doc §3) |
| OD-004 | Ranking methodology | Part N forbids assuming any existing promotion's formula | Ranking engine, `/rankings`, fighter profile ranking display |
| OD-005 | Registration fee amounts per event/division | Needed for payment-instruction screens | QR payment UI copy, `divisions.fee` field values |
| OD-005a | Real UTR/transaction-reference format (bank/UPI reference conventions) | Phase 3 shipped a conservative generic placeholder validator (alphanumeric, 6-30 chars, `src/features/payments/schemas.ts`) since the real format wasn't specified | Payment submission validation accuracy |
| OD-006 | Client-supplied payment QR artwork | Required for the real QR payment screen; placeholder used in `/ui-preview` and the real Phase 3 payment page | Payment submission flow visuals |
| OD-007 | Cancellation/transfer policy specifics (windows, eligibility, fees) | Part D §10 requires "client-approved policy enforcement" | `registration_requests` business rules |
| OD-008 | Refund handling detail (manual, off-platform confirmed; exact admin workflow TBD) | Part D §8/E explicitly excludes automated refunds | Admin requests UI copy |
| OD-009 | Email templates/copy for registration, payment, and status-change notifications | Part D §7 | Notification service content |
| OD-010 | Content approval process for FAQs/policies/announcements | Part D §9/§10 | Content management workflow, chatbot's approved-FAQ source |
| OD-011 | Data retention policy for payment screenshots and PII generally | Part E security requirements | Storage lifecycle rules, audit log retention |
| OD-012 | Hosting/infra and third-party integration approvals (object storage provider, email provider, auth provider choice) | Part F / Part M | Phase 2 infra setup |
| OD-013 | Whether `middleware.ts` should become `proxy.ts` under Next 16 | Technical, not client-facing, but affects Phase 2 auth wiring | Phase 2 proxy/auth implementation |
| OD-014 | Brand asset set (logo, approved photography license) | Part B §3 — existing TechBlitz imagery is unlicensed for this use | `/ui-preview` Brand Foundation chapter uses placeholders until resolved |

## Resolution process

Each item resolves via explicit client sign-off recorded here with a date and the resolved value, then promoted into the relevant architecture doc (data model, route map, etc.) and the requirements matrix in `docs/product/scope-matrix.md`. No item is closed by an engineering assumption.

## Resolved decisions (log)

| ID | Decision | Resolved | Date |
|---|---|---|---|
| RD-001 | Visual theme: light editorial palette (white/near-white background, black halftone dots, hard black panel borders/shadows — the TechBlitz background/structure technique), not the dark-charcoal palette originally proposed in Part O. TechBlitz content, copy, and imagery are still fully excluded — only the background/structure technique is reused, confirmed as owned by the client. | Confirmed by client in-session | 2026-10-31 |
| RD-002 | TechBlitz photography/certificate assets (`hero.png`, `judges.png`, `prizes.png`, etc.) ownership is clear (client-owned), but they remain unused in Up 'n Roll — thematically hackathon-specific, not combat-sports content. `/ui-preview` continues using placeholders pending OD-014 (an actual Up 'n Roll brand asset set). | Confirmed by client in-session | 2026-10-31 |

OD-014 narrows as a result of RD-002: the open question is now specifically the Up 'n Roll logo/wordmark and approved fighter/event photography, not a licensing concern.
