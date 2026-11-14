export function ComingSoon() {
  return (
    <main className="relative flex min-h-[min(70vh,40rem)] items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
      <div className="pointer-events-none absolute inset-0 halftone-bg opacity-[0.35]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-red/10 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/[0.04] to-transparent"
        aria-hidden="true"
      />

      <div className="coming-soon-enter relative">
        <div className="border-2 border-black bg-white px-8 py-10 shadow-[8px_8px_0_0_#000] sm:px-14 sm:py-14">
          <h1 className="text-display text-center text-4xl font-semibold uppercase leading-none tracking-[0.08em] text-brand-red sm:text-6xl md:text-7xl">
            Coming Soon
          </h1>
        </div>
      </div>
    </main>
  );
}
