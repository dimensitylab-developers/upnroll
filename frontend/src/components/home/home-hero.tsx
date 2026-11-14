import Link from "next/link";
import { FunkyHeadline } from "./funky-headline";
import { HeroFightTape } from "./hero-fight-tape";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-black">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-black lg:block" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-8 right-[28%] hidden w-3 -skew-x-12 bg-brand-red lg:block" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-end gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:px-8 lg:py-16">
        <div className="relative z-10 order-1">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red sm:mb-5 sm:text-xs">
            Made by an athlete for an athlete
          </p>

          <div className="relative border-2 border-black bg-white p-4 shadow-[8px_8px_0_0_#000] sm:p-7 sm:shadow-[10px_10px_0_0_#000]">
            <div className="pointer-events-none absolute -right-2 -top-2 h-8 w-8 border-2 border-black bg-brand-red sm:-right-3 sm:-top-3 sm:h-10 sm:w-10" aria-hidden="true" />
            <h1 id="home-wordmark" className="max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-auto w-full" width={640} height={160} />
            </h1>
          </div>

          <div className="mt-5 sm:mt-7">
            <Link
              href="/register?from=%2F"
              className="inline-flex min-h-11 -skew-x-12 items-center border-2 border-black bg-brand-red px-6 py-3 text-display text-sm font-semibold uppercase tracking-wider text-white shadow-[6px_6px_0_0_#000] sm:px-7"
            >
              <span className="inline-block skew-x-12">Sign up</span>
            </Link>
          </div>

          <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
            <li className="max-w-lg">
              <p className="-rotate-1 border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0_#000] sm:px-4 sm:py-3">
                <FunkyHeadline id="built-for-grapplers" />
              </p>
            </li>
            <li className="max-w-md">
              <p className="rotate-1 border-2 border-black bg-black px-3 py-2 shadow-[4px_4px_0_0_#c8102e] sm:px-4 sm:py-3">
                <FunkyHeadline id="real-fights-real-pay-real-rankings" tone="white" />
              </p>
            </li>
          </ul>
        </div>

        <div className="relative z-10 order-2 mx-auto w-full max-w-[220px] sm:max-w-[300px] lg:mr-2 lg:justify-self-end">
          <HeroFightTape />
        </div>
      </div>
    </section>
  );
}
