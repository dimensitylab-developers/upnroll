# Performance Observations (Dev Runtime)

Not a load test. Observations from Next.js 16 webpack dev server only.

| Observation | Impact |
|-------------|--------|
| Cold route compile 3–30s | Slow first navigation in audit; warm hits ~100–900ms |
| `POST /register` ~10s | Includes DB + console email |
| `POST /verify` ~21s including first `/fighter/dashboard` compile | Feels stuck on “Checking…” until compile finishes |
| Large home page many client interactive media controls | Acceptable for marketing surface; watch bundle growth |
| Admin/fighter first compile expensive | Expected in webpack cacheComponents mode |

## Recommendations (non-blocking)

- Prefer production `next start` for any timing judgments.
- Consider loading indicators that mention “first load may take a moment” for verify redirect — optional UX, not required.
