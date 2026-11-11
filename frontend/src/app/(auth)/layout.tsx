import Link from "next/link";
import { BrandMark, BuiltBy, FounderCredit, SiteCopyright } from "@/components/layout/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh justify-center overflow-hidden bg-[#f4f1ea] px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0 halftone-bg opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 speed-lines opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-16 h-56 w-56 rounded-full border-[10px] border-brand-red/15" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-10 bottom-24 h-40 w-40 -rotate-6 border-2 border-black/10 bg-brand-red/10" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg sm:max-w-5xl">
        <Link
          href="/"
          className="mb-5 flex min-h-11 items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:mb-8 sm:justify-start"
        >
          <BrandMark className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="text-display text-xl font-semibold sm:text-2xl">Up &apos;n Roll</span>
        </Link>

        <div className="overflow-hidden border-2 border-black bg-white shadow-[8px_8px_0_0_#000] sm:grid sm:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative hidden overflow-hidden border-b-2 border-black bg-black text-white sm:block sm:border-b-0 sm:border-r-2">
            <div className="pointer-events-none absolute inset-0 auth-gate-speed opacity-60" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 auth-gate-halftone opacity-30" aria-hidden="true" />
            <div className="relative flex h-full flex-col justify-between p-7 lg:p-9">
              <div>
                <span className="inline-flex -skew-x-12 items-stretch shadow-[4px_4px_0_0_#c8102e]">
                  <span className="w-2 bg-white" aria-hidden="true" />
                  <span className="bg-brand-red px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                    <span className="inline-block skew-x-12">Mat gate</span>
                  </span>
                </span>
                <h2 className="text-display mt-6 text-3xl font-semibold leading-none lg:text-4xl">
                  Step on
                  <br />
                  the card.
                </h2>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
                  Sign in to your desk — fighter sheet, payments, matches, and the house board.
                </p>
              </div>
              <div>
                <div className="checker-strip h-2 border-y border-white/30" aria-hidden="true" />
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-red">
                  Earn your role
                </p>
              </div>
            </div>
          </aside>

          <div className="p-5 sm:p-8 lg:p-10">{children}</div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-1 sm:items-start">
          <SiteCopyright />
          <FounderCredit />
          <BuiltBy />
        </div>
      </div>
    </main>
  );
}
