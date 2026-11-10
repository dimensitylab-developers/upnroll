/**
 * In-flow loading placeholder for public navigations.
 * Keeps header/footer visible — never covers the shell with a fixed overlay.
 */
export function RouteSkeleton({ label = "Loading page" }: { label?: string }) {
  return (
    <div
      className="route-enter mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8"
      role="status"
      aria-live="polite"
      aria-label={label}
      data-nav-pending="true"
    >
      <div className="mb-8 h-3 w-24 bg-brand-red/30" />
      <div className="mb-4 h-10 w-2/3 max-w-md bg-black/10" />
      <div className="mb-10 h-4 w-full max-w-xl bg-black/8" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-h-40 border-2 border-black/15 bg-white/70" />
        <div className="min-h-40 border-2 border-black/15 bg-white/70" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
