# Form Validation Audit

| Form | Required/empty | Invalid input | Success path | Notes | Status |
|------|----------------|---------------|--------------|-------|--------|
| Login | Empty submit focuses first required field | Not deeply fuzzed | Not with known password this pass (used verify path) | Generic error path exists in code | PARTIAL |
| Register | HTML required attrs | Password rules documented in UI | New account created → redirect verify | Console email code captured in server log | PASS |
| Verify | Required code | Not fuzzed with wrong code this pass | Correct code → fighter dashboard + Welcome email | Slow cold redirect | PASS |
| Fighter profile | Many required fields | — | Not submitted | Avoided fabricating Aadhaar/photo | NOT TESTABLE |
| New registration | Continue disabled until complete | — | Incomplete path verified | Full payment path not completed | PARTIAL |
| Admin forms | — | — | — | No admin session | BLOCKED |
| Payment submit | — | — | — | Requires completed registration | BLOCKED |
| Content/media/brackets | — | — | — | Admin only | BLOCKED |

## Safe submissions performed

1. Fighter registration (throwaway `qa.audit.*@example.com`)
2. Email verification with console-adapter code

No real UTRs, payment screenshots, or production user documents were used.
