# Handover diagrams

Mermaid (`.mmd`) sources for the Up 'n Roll handover pack. Render with any Mermaid-compatible viewer (VS Code Mermaid preview, mermaid.live, or docs that embed Mermaid).

**Conventions:** flowchart / sequenceDiagram / erDiagram only; no spaces in node IDs; labels with special characters are quoted; no `style` / `classDef` colors; no `click` events.

| File | Diagram | Type | Source research |
|------|---------|------|-----------------|
| [01-system-architecture.mmd](./01-system-architecture.mmd) | High-level system architecture (Next.js + backend services + Mongo/storage/SMTP) | flowchart | [`_research/01-architecture-stats.md`](../_research/01-architecture-stats.md) |
| [02-website-sitemap.mmd](./02-website-sitemap.mmd) | Public, auth, grappler, admin, and judge route map | flowchart | [`_research/01-architecture-stats.md`](../_research/01-architecture-stats.md) |
| [03-roles-access.mmd](./03-roles-access.mmd) | User roles vs separate judge credential plane | flowchart | [`_research/06-auth-security-rbac.md`](../_research/06-auth-security-rbac.md) |
| [04-authentication-flow.mmd](./04-authentication-flow.mmd) | Register / login / Google / judge session paths | flowchart | [`_research/06-auth-security-rbac.md`](../_research/06-auth-security-rbac.md) |
| [05-grappler-registration.mmd](./05-grappler-registration.mmd) | Grappler journey from signup through confirmed seat | flowchart | [`_research/03-grappler-lifecycle.md`](../_research/03-grappler-lifecycle.md) |
| [06-payment-coupon.mmd](./06-payment-coupon.mmd) | Manual UPI proof + coupon apply + admin decide | sequenceDiagram | [`_research/03-payment-coupon.md`](../_research/03-payment-coupon.md) |
| [07-verification.mmd](./07-verification.mmd) | Admin payment/registration verification desk (not `/verify` email OTP) | flowchart | [`_research/02-verification.md`](../_research/02-verification.md) |
| [08-admin-tournament.mmd](./08-admin-tournament.mmd) | Admin event hub, divisions, brackets, matches, fees | flowchart | [`_research/02-admin-complete.md`](../_research/02-admin-complete.md) |
| [09-tournament-lifecycle.mmd](./09-tournament-lifecycle.mmd) | End-to-end 20-step tournament lifecycle | flowchart | [`_research/04-tournament-lifecycle.md`](../_research/04-tournament-lifecycle.md) |
| [10-bracket-progression.mmd](./10-bracket-progression.mmd) | Generate → publish → result → advance winners | flowchart | [`_research/04-brackets-rankings.md`](../_research/04-brackets-rankings.md) |
| [11-judge-authentication.mmd](./11-judge-authentication.mmd) | Per-match judge credentials and session cookie | sequenceDiagram | [`_research/04-judge-panel.md`](../_research/04-judge-panel.md) |
| [12-match-scoring.mmd](./12-match-scoring.mmd) | Live scoring console: points, undo, finalize | sequenceDiagram | [`_research/04-judge-panel.md`](../_research/04-judge-panel.md) |
| [13-ranking-update.mmd](./13-ranking-update.mmd) | Rankings recalc via outbox/cron and admin button | flowchart | [`_research/04-brackets-rankings.md`](../_research/04-brackets-rankings.md) |
| [14-database-erd.mmd](./14-database-erd.mmd) | Core Mongoose collections ERD | erDiagram | [`_research/05-database.md`](../_research/05-database.md) |
| [15-api-request-lifecycle.mmd](./15-api-request-lifecycle.mmd) | Server Actions / REST / cron request path | flowchart | [`_research/05-api-actions.md`](../_research/05-api-actions.md) |
| [16-deployment-architecture.mmd](./16-deployment-architecture.mmd) | Vercel + MongoDB + SMTP + cron deployment | flowchart | [`_research/07-deployment.md`](../_research/07-deployment.md) |
