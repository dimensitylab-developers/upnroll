import type { ReactNode } from "react";

export function ComingSoon({
  title,
  line,
  stamp,
  children,
}: {
  title: string;
  line: string;
  stamp: string;
  children: ReactNode;
}) {
  return (
    <main className="halftone-bg px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="checker-strip h-3 border-2 border-b-0 border-black" aria-hidden="true" />
        <article className="overflow-hidden border-2 border-black bg-white shadow-[10px_10px_0_0_#000]">
          <header className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]">
            <div className="relative bg-black px-6 py-10 text-white sm:px-10 sm:py-14">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background:
                    "repeating-linear-gradient(100deg, transparent, transparent 18px, rgba(255,255,255,0.18) 18px, rgba(255,255,255,0.18) 19px)",
                }}
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-red">Coming soon</p>
                <h1 className="text-display mt-3 text-5xl font-semibold leading-[0.92] sm:text-7xl">{title}</h1>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{line}</p>
              </div>
            </div>
            <div className="relative flex min-h-52 items-center justify-center overflow-hidden bg-brand-red px-6 py-10">
              <span
                className="absolute inset-6 border-2 border-dashed border-white/50"
                aria-hidden="true"
              />
              <p className="text-display relative rotate-[-8deg] border-4 border-white px-4 py-3 text-center text-4xl font-semibold uppercase leading-none tracking-wide text-white sm:text-5xl">
                {stamp}
              </p>
            </div>
          </header>
          <div className="border-t-2 border-black px-6 py-8 sm:px-10 sm:py-10">{children}</div>
        </article>
      </div>
    </main>
  );
}
