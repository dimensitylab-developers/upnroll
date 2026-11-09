# Manual Verification Summary — Runtime Audit

**Final classification: PARTIALLY VERIFIED**

The app was started and exercised in a real browser. Critical startup failures were fixed and retested. Admin and full payment/tournament paths were **not** claimed working.

## Numbers (honest)

| Metric | Count / note |
|--------|----------------|
| Routes discovered (`page.tsx`) | 42 |
| Routes successfully loaded this pass | ~30 public/auth/fighter core |
| Routes with startup errors (before fix) | Public set via `force-dynamic` |
| Routes blocked | Admin suite; Google OAuth; transfer without token |
| Interactive elements inventoried | 80+ on home; 30+ on fighter forms |
| Buttons clicked/exercised | ~15–20 |
| Broken buttons | 1 confirmed (Shuffle hit target) |
| Forms inspected | Login, register, verify, profile, new registration |
| Forms successfully submitted | Register + verify |
| Commits this audit | `902a3a1`, `5d9e3e4`, `f951b63` (+ docs commit) |
| Pushed | No |

## Owner follow-ups

1. Provide a **non-production admin** test account to complete admin/payment/bracket audits.
2. Configure Google OAuth locally if social login must be verified.
3. Manually retest home Shuffle / polaroid stacking hit targets.
4. Re-check hydration on register/verify without browser automation fills.
5. Run the same smoke on `next build && next start` before calling production ready.

## Related docs

- `APPLICATION_RUNTIME_AUDIT.md`
- `PAGE_BY_PAGE_AUDIT.md`
- `BUTTON_INTERACTION_AUDIT.md`
- `FORM_VALIDATION_AUDIT.md`
- `AUTHENTICATION_ROLE_AUDIT.md`
- `BUSINESS_WORKFLOW_AUDIT.md`
- `RESPONSIVE_UI_AUDIT.md`
- `BROWSER_CONSOLE_NETWORK_AUDIT.md`
- `PERFORMANCE_OBSERVATIONS.md`
- `BUG_FIX_REPORT.md`
