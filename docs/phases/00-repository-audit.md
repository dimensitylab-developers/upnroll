# Phase 0 — Repository Audit

Date: 2026-10-31
Scope: `D:\upnrol` as handed over (TechBlitz 26 source, not currently a git repository).

## 1. Repository state

- `D:\upnrol` is **not a git repository** (`git status` fails with "not a git repository"). No commit history, no branches.
- `node_modules` and `.next` are both absent — dependencies have never been installed in this environment; no prior build artifact exists here.
- The directory already contains two leftover planning documents from the TechBlitz project that must **not** travel into Up 'n Roll:
  - `plan.md` — a judge-portal implementation plan containing ~75 **real hackathon participants' full names, team names, and lab assignments** hardcoded as seed data.
  - `PROMPT.MD` — the original AI build prompt for TechBlitz's registration/certificate/admin system, including literal placeholder credential patterns (`ADMIN_PASSWORD=techblitz@2026`, `ADMIN_SECRET=supersecrettoken123`) and real event naming ("TechBlitz26").
- `scripts/seed.ts` and `scripts/partseed.ts` (605 and 618 lines respectively) hardcode the same ~75 real participant/team records referenced above. **This is real PII committed to source**, not demo fixtures.

**Action required before any further work:** `plan.md`, `PROMPT.MD`, `scripts/seed.ts`, and `scripts/partseed.ts` must be excluded from the Up 'n Roll repository (do not copy them into whatever becomes the permanent git history) per the directive's Part B §3 ("Never copy participant data, credentials, secrets, or real operational records from the old project"). Flagging now; no deletion performed without your confirmation since this is a destructive/irreversible-in-history action once committed.

## 2. Current folder tree (actual, not aspirational)

```
D:\upnrol\
├── .github/
├── public/
│   ├── certificate.png (4.3MB, hackathon-specific)
│   ├── favicon.png (10.7MB — oversized for a favicon)
│   ├── opengraph.jpg
│   ├── images/{hero,judges,prizes,ai-domain,uiux,vibeathon}.png (event-specific)
│   └── {file,globe,next,vercel,window}.svg (Next.js boilerplate)
├── scripts/
│   ├── seed.ts            — PII, remove
│   ├── partseed.ts         — PII, remove
│   └── (singleseed.ts referenced by package.json but absent on disk — stale script entry)
├── src/
│   ├── actions/            — scores.ts, teams.ts (judge-portal server actions)
│   ├── app/
│   │   ├── page.tsx (marketing homepage, "use client")
│   │   ├── register/
│   │   ├── problem-statement/{page,submit/page,reveal/page}.tsx
│   │   ├── certificates/page.tsx
│   │   ├── admin/{page.tsx, dashboard/page.tsx}
│   │   ├── judge-portal/page.tsx + (portal)/{lab, leaderboard, final}/...
│   │   ├── api/{register, teams, team/[teamName], certificate/save, admin/*, judge-portal/*}/route.ts
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/ (50+ shadcn/Radix primitives)
│   │   ├── judge/ (ScoringForm, Leaderboard, LogoutButton)
│   │   └── root-level feature sections (HeroSection, TracksSection, PrizesSection, JudgesSection, SponsorsSection, RulesSection, FaqSection, GallerySection, CommunitySection, RegistrationCta, Navbar, Footer, RegisterForm, CertificateCanvas)
│   ├── hooks/ (use-mobile.tsx, use-toast.ts)
│   └── lib/
│       ├── utils.ts, queryClient.ts
│       ├── mongodb.ts, db.ts
│       ├── adminAuth.ts, judgeAuth.ts
│       ├── problemStatements.ts
│       └── models/{Team.ts, JudgeTeam.ts, Score.ts}
├── middleware.ts
├── next.config.ts, tsconfig.json, components.json, eslint.config.mjs, postcss.config.mjs
├── package.json / package-lock.json
└── plan.md, PROMPT.MD  — remove (see above)
```

126 files total under `src/`.

## 3. Dependency audit (`package.json`)

Declared and consistent with the brief's "verified public-repository context": Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind v4, GSAP 3.14 + `@gsap/react`, Framer Motion 12.34, Mongoose 9.3, TanStack Query 5.90, React Hook Form 7.71 + `@hookform/resolvers`, Zod 4.3, full Radix primitive set + `shadcn` CLI, `recharts`, `canvas-confetti`, `jspdf`, `sonner`, `next-themes`, `embla-carousel-react`, `cmdk`, `vaul`, `input-otp`, `react-day-picker`, `react-resizable-panels`.

Everything declared is actually imported somewhere in `src/` (confirmed via the source audit) — no obviously dead dependencies observed, though a full dependency-usage pass should be re-run once PII-bearing files are removed, since `jspdf`/`canvas-confetti` are used only by the certificate-generation feature which is itself Category D (remove).

`package.json` scripts include `seed`, `partseed`, `singleseed` — the last points at a file that doesn't exist (`scripts/singleseed.ts` absent). Stale entry.

No `.env.example` exists in the repo. No hardcoded secret *values* were found in `src/` or `scripts/` — all sensitive config is read via `process.env.*` — but see §5 on the auth design itself, which is a deeper problem than a leaked literal.

## 4. Build/lint status

Not run. `node_modules` is absent in this environment, and installing dependencies plus running a full build was judged out of scope for a read-only Phase 0 audit (next.config.ts has no custom build settings that would otherwise affect this assessment). **This must be the first action in Phase 1** before any new code is added, so a true baseline (does the inherited code even build/lint clean) is established before Up 'n Roll adds to it.

## 5. Security findings (material to Part M and Part D)

- **Admin auth (`src/lib/adminAuth.ts`):** the `adminToken` cookie's value is the literal `process.env.ADMIN_SECRET` string — a static shared secret stored client-side, not a signed or expiring session token. Anyone who exfiltrates the cookie has standing admin access until the env var is rotated. Not viable for Up 'n Roll's admin portal (Category C — rebuild entirely with a real auth provider per Part M).
- **Judge auth (`src/lib/judgeAuth.ts`):** a hand-rolled integer hash of a single shared `JUDGE_PASSCODE`, explicitly commented in source as "not for security, just obfuscation." Every judge receives an identical token regardless of name — there is no actual per-user identity, only a shared knock-knock password. Not reusable for Up 'n Roll's fighter/admin roles.
- **`middleware.ts` matcher gap:** the middleware function body checks both `/admin/dashboard` and `/admin/judge-portal`, but `config.matcher` only lists `/admin/dashboard/:path*`. Next.js only invokes middleware for paths matching `config.matcher`, so `/admin/judge-portal/*` is very likely **not actually protected at the edge** in production — the inline check is dead code for that path. This is a correctness bug in the existing system, not just a design weakness; worth independent note since it's the kind of bug Up 'n Roll's Phase 2 auth/proxy work must specifically test against (an authenticated-route matcher that silently fails to match is exactly how a private admin page becomes public).
- No rate limiting, no CSRF token beyond `sameSite: strict`, no RBAC — binary passcode gates only. Confirms Part M's instruction to choose an actively-maintained, real session-based auth provider rather than adapting this code.

## 6. Reuse matrix

| Category | Path(s) | Reasoning |
|---|---|---|
| **A — Reuse directly** | `src/components/ui/*` (50+ shadcn/Radix primitives); `src/hooks/use-mobile.tsx`, `use-toast.ts`; `src/lib/utils.ts` (cn helper); `src/lib/queryClient.ts` (TanStack config) | Generic, headless, framework-level primitives with no hackathon-specific logic or content. |
| **B — Adapt** | `src/app/layout.tsx` (font-loading + Providers pattern, swap fonts/brand); `src/lib/mongodb.ts` / `db.ts` (connection-singleton pattern is sound, needs env/config rename); `src/app/globals.css` custom utilities (`.manga-panel`, `.manga-speech-bubble`, `.speed-lines`, `.halftone-bg`, `.jagged-edge`) — the *technique* is reusable, the literal black/white high-contrast palette and `--radius: 0` must shift to the deep-charcoal palette Part O specifies; root-level marketing section components (`HeroSection`, `Navbar`, `Footer`, etc.) — layout/composition pattern adaptable, all copy and imagery must be replaced. | Structurally sound patterns whose content, palette, or naming is TechBlitz-specific. |
| **C — Rebuild** | `src/lib/adminAuth.ts`, `src/lib/judgeAuth.ts`; `src/lib/models/{Team,JudgeTeam,Score}.ts`; `middleware.ts` | Either an insecure design (auth) or a domain model with zero overlap with combat-sports concepts (fighters/events/divisions/brackets/matches). Rebuilding from scratch per Part M/L is faster and safer than adapting. |
| **D — Remove** | `plan.md`, `PROMPT.MD`, `scripts/seed.ts`, `scripts/partseed.ts` (PII); `src/lib/problemStatements.ts`, `src/components/CertificateCanvas.tsx`, `src/components/judge/*`, `src/actions/scores.ts`, `src/actions/teams.ts`, all `judge-portal`/`problem-statement`/`certificates` routes and their API routes; `public/certificate.png`, `public/favicon.png` (oversized + branded), `public/images/*` (event-specific photography — also unconfirmed licensing per Part B §3) | Hackathon-specific business logic, real participant data, or branding with no path to reuse in a combat-sports platform. |

## 7. Build status note

Not attempted (see §4). Flag for Phase 1 kickoff: run `npm install && npm run lint && npm run build` on the *current, unmodified* source first, as a baseline, before any Up 'n Roll-specific changes land — so regressions can be attributed correctly.

## 8. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| PII in `plan.md`/`PROMPT.MD`/`seed.ts`/`partseed.ts` | High — real names must never enter the new product's history | Exclude from the new repository entirely; do not copy-then-delete (preserves PII in git history) |
| No git history at all | Medium — no provenance/attribution tracking yet | Initialize a fresh Up 'n Roll repo (not a TechBlitz fork) once content is cleaned |
| Admin/judge auth insecure by design | High if reused as-is | Rebuild with a real session-based provider in Phase 2; do not reuse any part of `adminAuth.ts`/`judgeAuth.ts` |
| Middleware matcher gap (dead protection on one path) | High (demonstrates how silent auth gaps happen) | Treat as a cautionary test case for Phase 2 authorization test suite |
| Unlicensed event photography in `public/images/*` | Medium — legal exposure if reused | Do not reuse; source new/placeholder imagery for Up 'n Roll |
| No build/lint baseline established | Low-medium — can't yet tell if inherited code is healthy | Run `npm install && lint && build` as first Phase 1 action |

## 9. Unresolved decisions surfaced by this audit

See `docs/decisions/open-decisions.md` for the full list; the audit specifically surfaces:
- Whether to keep Mongoose/MongoDB (inherited, declared suitable per directive) vs. any alternative — **recommendation: keep**, no architectural reason found to change it, and it satisfies Part F's baseline.
- Whether `middleware.ts` should be renamed to `proxy.ts` for Next.js 16 — **recommendation: yes**, confirm via Next 16 docs during Phase 2 setup since the inherited file uses the older convention.

## 10. Planned first implementation changes (Phase 1 only)

Per the execution boundary, Phase 1 is the `/ui-preview` design-foundation build only. Planned first changes:
1. Initialize a clean Up 'n Roll project structure under `src/` per `docs/architecture/folder-structure.md`, carrying forward only Category A/B assets (cleaned of TechBlitz content).
2. Do **not** copy `plan.md`, `PROMPT.MD`, `scripts/seed.ts`, `scripts/partseed.ts`, or any PII into the new structure.
3. Rebuild `globals.css` tokens to the Part O palette while preserving the manga-panel/speed-lines/halftone *technique*.
4. Build `/ui-preview` using fictional, clearly-labeled fixtures only.

No production backend, auth, or database work begins in Phase 1.
