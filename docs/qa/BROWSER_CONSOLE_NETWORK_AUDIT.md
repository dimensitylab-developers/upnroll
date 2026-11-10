# Browser Console & Network Audit

## Server logs (dev terminal)

| Signal | Classification |
|--------|----------------|
| `force-dynamic` incompatible with `cacheComponents` | Defect — fixed (`902a3a1`) |
| `next-prerender-current-time` in `SiteHeader` | Defect — fixed (`5d9e3e4`) |
| Webpack pack cache ENOENT rename warnings | Noise / local cache race — not user-facing |
| `ForbiddenError` when fighter hit `/admin` before/during layout race | Expected authz; mitigated (`f951b63`) |
| `[dev email — not sent]` verification + welcome | Expected console adapter |
| Cold compile durations 5–30s+ | Dev performance, not product 500s |

## Browser

| Signal | Classification |
|--------|----------------|
| Next.js Dev Tools “Issues” on register/verify during automation fills | Likely hydration mismatch from tool-driven input before hydrate; **clean on fresh register load** |
| Google OAuth soft-fail redirect | Expected without credentials |
| Auth redirects 307 for protected routes | Expected |

## Network

- Public GETs returned 200 after fixes.
- Protected routes returned 307 to `/login` without session cookie.
- No CORS failures observed.
- Failed image/font audits not exhaustively run.

Secrets and SMTP passwords were not captured into these reports.
