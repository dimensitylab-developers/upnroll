# Performance Report — Lab measurements 2026-11-12

**Environment:** Windows, `next dev --webpack`, localhost:3000, Atlas MongoDB, GridFS  
**Network:** Lab LAN; not throttled  
**Sample:** Single sequential curl timings (cold/compiling bias)  
**Limitation:** These are **not** real-user metrics. Dev compile dominates first hits. Production `next start` not re-measured in this no-code-change pass.

## Route timings (curl total seconds)

| Route | HTTP | Time (s) | Notes |
| --- | --- | --- | --- |
| `/` | 200 | 1.14 | Warm-ish |
| `/events` | 200 | 1.91 | |
| `/events/up-n-roll-superfight-series` | 200 | 4.39 | |
| `/brackets` | 200 | 37.00 | Cold/compile |
| `/rankings` | 200 | 34.75 | Cold/compile |
| `/faq` | 200 | 19.14 | |
| `/about` | 200 | 6.27 | |
| `/policies` | 200 | 11.22 | |
| `/announcements` | 200 | 7.06 | |
| `/store` | 200 | 16.91 | |
| `/seminars` | 200 | 8.68 | |
| `/fighters` | 200 | 5.25 | |
| `/login` | 200 | 22.98 | |
| `/register` | 200 | 22.81 | |
| `/judge/login` | 200 | 16.85 | |
| `/api/health` | 200 | 14.51 | Later sample ~0.2s warm |

Earlier isolated samples: health warm ~0.19–2.7s; missing-event UI path can exceed 8s on first compile.

## Interaction notes

- Judge invalid login server action previously logged ~7s wall time under load (scrypt + Atlas).  
- Homepage still carousel / media heavy; LCP/CLS not instrumented with Lighthouse this pass.

## Sub-200 ms target

**Not claimed** for full page loads. Warm client navigations may be faster after compile; not measured with RUM.

## Recommendations (documentation only)

1. Measure with `npm run build` + `npm start` before client demo.  
2. Prefetch/warm critical demo routes once before the walkthrough.  
3. Treat first-hit 30s+ routes as demo risk, not as production SLO proof.
