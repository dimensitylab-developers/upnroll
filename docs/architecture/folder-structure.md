# Target Folder Structure — Up 'n Roll

This mirrors Part G of the directive, annotated with what already exists (audited in Phase 0) vs. what Phase 1 actually creates. Modules are created when their implementation phase begins — this is not a scaffold-everything-now instruction.

## Status legend
- **[existing→reuse]** present in audited source, Category A, usable as-is after relocation
- **[existing→adapt]** present, Category B, needs content/palette/naming changes
- **[new — Phase 1]** created now for `/ui-preview`
- **[new — later phase]** created in Phase 2+, not touched now

```text
up-n-roll/
├── public/
│   ├── brand/                      [new — Phase 1, empty until assets approved]
│   ├── images/{events,fighters,artwork,placeholders}/  [new — Phase 1, fixtures only]
│   └── icons/, textures/           [new — Phase 1 as needed by design tokens]
│
├── src/
│   ├── app/
│   │   ├── (public)/               [new — later phase, real routes]
│   │   ├── (auth)/                 [new — later phase]
│   │   ├── (fighter)/              [new — later phase]
│   │   ├── (admin)/                [new — later phase]
│   │   ├── (preview)/ui-preview/   [new — Phase 1, THIS phase's deliverable]
│   │   ├── api/v1/                 [new — later phase]
│   │   ├── layout.tsx              [existing→adapt: font-loading + Providers pattern]
│   │   ├── globals.css             [existing→adapt: keep manga-panel/speed-lines/halftone technique, new palette]
│   │   ├── not-found.tsx           [existing→reuse, re-skin only]
│   │   └── error.tsx, loading.tsx  [new — Phase 1]
│   │
│   ├── components/
│   │   ├── ui/                     [existing→reuse: 50+ shadcn/Radix primitives, copied as-is]
│   │   ├── layout/, navigation/    [new — Phase 1, built from existing Navbar/Footer pattern]
│   │   ├── motion/                 [new — Phase 1, shared GSAP/Framer wrappers — did not exist before]
│   │   ├── brand/, feedback/       [new — Phase 1]
│   │   └── preview/                [new — Phase 1, /ui-preview-only scaffolding components]
│   │
│   ├── features/                   [new — later phases, populated per-domain as each phase begins]
│   ├── server/                     [new — Phase 2 only, NOT created in Phase 1]
│   ├── lib/
│   │   ├── utils.ts                [existing→reuse: cn() helper]
│   │   ├── constants.ts, config.ts [new — Phase 1, design tokens + preview fixture flags]
│   │   └── formatting/, validation/ [new — later phase]
│   │
│   ├── hooks/                      [existing→reuse: use-mobile.tsx, use-toast.ts]
│   ├── types/                      [new — Phase 1, preview fixture types only]
│   ├── styles/                     [new — Phase 1, token source files if split out of globals.css]
│   ├── config/                     [new — later phase]
│   ├── test/                       [new — later phase]
│   └── proxy.ts                    [new — Phase 2, replaces legacy middleware.ts — Next 16 naming]
│
├── scripts/seed-demo.ts            [new — later phase; NEVER the inherited seed.ts/partseed.ts]
├── docs/                           [Phase 0 deliverable — this audit]
├── tests/{unit,integration,e2e}/   [new — later phase]
└── root config files               [existing→reuse: next.config.ts, tsconfig.json, components.json, eslint.config.mjs, postcss.config.mjs, package.json — adapt name/scripts]
```

## Explicit exclusions from the new structure

Not copied forward under any category: `plan.md`, `PROMPT.MD`, `scripts/seed.ts`, `scripts/partseed.ts`, `src/lib/adminAuth.ts`, `src/lib/judgeAuth.ts`, `src/lib/models/{Team,JudgeTeam,Score}.ts`, `src/lib/problemStatements.ts`, `src/components/CertificateCanvas.tsx`, `src/components/judge/*`, `src/actions/*`, all `judge-portal`/`problem-statement`/`certificates`/`register` routes and their `api/` handlers, `middleware.ts` (replaced, not ported), `public/certificate.png`, `public/favicon.png`, `public/images/*` (event photography).

## Structure rules reaffirmed

- No `src/pages/`. No standalone backend directory. No Redux/GraphQL/message brokers without justification (none exists).
- `src/server/**` is not created until Phase 2 — Phase 1's `/ui-preview` uses only `src/lib` fixtures, never a real database call.
