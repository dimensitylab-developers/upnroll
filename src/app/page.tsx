import Link from "next/link";

/**
 * Placeholder root route. The production public homepage is built in a later
 * phase (see docs/architecture/route-map.md). Phase 1 ships only /ui-preview.
 */
export default function RootPlaceholder() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 halftone-bg">
      <div className="manga-panel p-10 max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-3">
          Phase 1 — Design Foundation
        </p>
        <h1 className="text-display text-4xl font-semibold mb-4">Up &apos;n Roll</h1>
        <p className="text-muted-foreground mb-6">
          The production homepage has not been built yet. The current deliverable is the
          interactive design showroom.
        </p>
        <Link
          href="/ui-preview"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Open /ui-preview
        </Link>
      </div>
    </main>
  );
}
