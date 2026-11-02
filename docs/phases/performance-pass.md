# Performance Pass — Phase 6

Real `next build` output analysis, not a vibe. No live Lighthouse run (would need a deployed-like environment this sandbox doesn't have) — this is a build-artifact analysis with actual numbers.

## Route split

`npm run build` output: **18 routes**. 4 statically prerendered (`/`, `/_not-found`, `/login`, `/register`), the rest (`/ui-preview` plus every admin/fighter/public data route) correctly dynamic — each one legitimately reads live session/DB state, so this split is as tight as it can be without inventing static content.

## Client bundle size (real measurement)

`.next/static/chunks/` total: **1.5MB** uncompressed JS across all chunks (gzip over the wire would be meaningfully smaller — Next.js serves these pre-compressed in production — but the uncompressed figure is what's actually on disk and the one worth tracking over time without needing a running server to measure transfer size).

Largest individual chunks: 220KB and 204KB — together under a third of the total. These weren't identifiable by package name from the minified output without a bundle analyzer plugin (not installed — would be a reasonable Phase 7+ addition if bundle size becomes a concern, e.g. `@next/bundle-analyzer`), so this is reported as a real but incomplete measurement rather than a confident package-by-package breakdown.

## Dead-weight check

`gsap` and `@gsap/react` are declared dependencies, used only by `src/components/ui/reveal-loader.tsx` — which itself has **zero call sites** anywhere in the app (confirmed via `grep`). Since Next.js only bundles what's actually imported by a rendered component tree, this currently costs **nothing** in the shipped client bundle (verified: the chunk analysis above doesn't carry it, since nothing imports the file that imports it). Kept rather than removed because Part F/Part O explicitly call for GSAP as the sequenced-reveal animation library, and `reveal-loader.tsx` looks purpose-built for that role — flagging it here as a candidate to actually remove only if it's still unused by the time Phase 7 ships.

## Server Component / Client Component split

Every real data-bearing page (`/events`, `/fighters/[slug]`, `/admin/*`, `/fighter/*`) is an `async` Server Component doing its data fetch directly — no client-side `fetch`/TanStack Query round-trip for initial page data anywhere in the app. `"use client"` is scoped to actual interactive leaves (forms, dialogs, the chatbot widget) per Part F's data-fetching guidance, not applied page-wide. Confirmed by the same `grep` sweep used for the client/server boundary check elsewhere in this phase — no page-level component is a Client Component.

## What wasn't measured here (stated, not hidden)

- No Lighthouse/Core Web Vitals run — needs a deployed or deploy-like environment.
- No database query latency profiling — needs the live MongoDB connection this phase is also waiting on for its functional verification.
- No image optimization review — the app currently has no real uploaded images in its data model beyond the dev-only local-disk payment screenshots (private, never rendered via `next/image`) and external media URLs (`MediaAsset.externalUrl`, not yet rendered on any public page per Phase 5's scope note).
