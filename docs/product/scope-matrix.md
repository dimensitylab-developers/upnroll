# Requirements Matrix — Up 'n Roll

Status column reflects what is actually approved vs. pending per the Phase 1 agreement (Part D) and the manual-payment update (Part E). Extend this table as scope is confirmed; do not mark anything "Approved" without an actual client decision.

| ID | Requirement | Origin | Status | Phase |
|---|---|---|---|---|
| WEB-001 | Responsive public event website | Agreement | Approved | 1 (design), later (build) |
| WEB-002 | Anime/manga-inspired visual identity | Agreement | Approved | 1 |
| WEB-003 | Public schedules, brackets, published results | Agreement | Approved | 4 |
| REG-001 | Fighter registration forms | Agreement | Approved — built in Phase 3 (event/division selection, duplicate-registration prevention) | 3 |
| REG-002 | Admin access to participant records | Agreement | Approved — admin payment queue built in Phase 3; full athlete-record admin view is Phase 4+ | 3 |
| BRK-001 | Manual matchmaking | Agreement | Approved | 4 |
| BRK-002 | Automated bracket generation | Agreement | Rules pending (OD-003) | 4 |
| BRK-003 | Bracket modifications, match assignment | Agreement | Approved | 4 |
| RNK-001 | Fighter rankings | Agreement | Methodology pending (OD-004) | 5 |
| FTR-001 | Fighter login + private dashboard | Agreement | Approved — auth/session/guarded shell built in Phase 2, dashboard content pending Phase 3 | 2–3 |
| ADM-001 | Tournament/athlete/match/result/registration/content admin | Agreement | Approved — role-gated admin shell built in Phase 2, feature content pending Phase 3–5 | 2–5 |
| NOT-001 | Registration acknowledgement/confirmation emails | Agreement | Approved — wired through the Phase 2 ConsoleEmailAdapter (logged, not delivered) in Phase 3; real delivery and templates pending OD-009/OD-012 | 3 |
| NOT-002 | Agreed status-change notifications | Agreement | Approved, scope of "agreed" pending | 3–5 |
| PAY-001 | Client QR payment instructions | Agreement | Approved — amount/currency shown from real Event/Division data in Phase 3; QR artwork itself still a placeholder (OD-006) | 3 |
| PAY-002 | Screenshot + UTR submission | User change (Part E) | Built in Phase 3 — private local-disk storage, admin-only authorized viewing route, type/size validation | 3 |
| PAY-003 | Manual admin verification (no auto-approval) | User change (Part E) | Built in Phase 3 — idempotent approve/reject, duplicate-UTR flagging, required rejection reason, full audit trail | 3 |
| PAY-004 | No payment gateway integration | Agreement (explicit exclusion) | Confirmed excluded | N/A |
| CHB-001 | Tournament-specific chatbot, bounded FAQ scope | Agreement | Approved | 5 |
| REQ-001 | Cancellation/transfer requests + admin review | Agreement | Approved, policy pending (OD-007) | 5 |
| REQ-002 | Manual refund processing (off-platform) | Agreement | Confirmed | 5 |
| EXC-001 | No payment gateways, no automatic bank verification, no automatic refunds, no e-commerce, no native mobile, no unapproved integrations | Agreement (explicit exclusion) | Confirmed excluded | N/A |

## Not yet on this matrix (tracked in `open-decisions.md` only, not scope-approved)

Multi-organization tenancy, live scoring hardware, biometric weigh-ins, third-party ranking integrations — explicitly flagged in Part D as future possibilities, not Phase 1 commitments. Do not add rows for these without a client decision first.
