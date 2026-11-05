# Up 'n Roll

Combat sports tournament management platform. Next.js 16 (App Router), TypeScript, Tailwind CSS v4.

Built by DimensityLabs. Originally scaffolded from the VCET NSDC TechBlitz-26 project's shadcn/ui component set (MIT) — see `docs/legal/THIRD_PARTY_NOTICES.md` and `docs/phases/00-repository-audit.md` for the full provenance and audit trail.

## Status

Phase 1 — design foundation. The only shipped route is the interactive design showroom at `/ui-preview`. No production backend, authentication, or database integration exists yet.

## Getting started

```bash
npm install --prefix frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The UI is in `frontend/`. The server code is in `backend/`. They are already connected.

## Documentation

See `docs/`:
- `docs/phases/00-repository-audit.md` — repository audit and reuse matrix
- `docs/research/combat-sports-reference-analysis.md` — domain research
- `docs/architecture/` — system overview, folder structure, route map, data model
- `docs/api/api-contract.md` — proposed API contract (not yet implemented)
- `docs/decisions/open-decisions.md` — everything pending client approval
- `docs/product/scope-matrix.md` — requirements matrix
