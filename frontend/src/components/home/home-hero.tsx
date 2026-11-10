import Link from "next/link";
import { FunkyHeadline } from "./funky-headline";
import { HeroFightTape } from "./hero-fight-tape";
import { MatEmojis } from "./mat-emojis";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-black">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-black lg:block" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-8 right-[28%] hidden w-3 -skew-x-12 bg-brand-red lg:block" aria-hidden="true" />
      <MatEmojis className="pointer-events-none absolute inset-0 z-[1] opacity-35 sm:opacity-60 lg:opacity-80" />

      <div className="relative mx-auto grid max-w-6xl items-end gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:px-8 lg:py-16">
        <div className="relative z-10 order-1">
          <div className="hero-stamp mb-4 inline-flex -skew-x-12 items-stretch shadow-[5px_5px_0_0_#000] sm:mb-6">
            <span className="w-3 bg-black" aria-hidden="true" />
            <span className="bg-brand-red px-3 py-2 text-display text-[11px] font-semibold uppercase tracking-[0.22em] text-white sm:px-4 sm:text-sm">
              <span className="inline-block skew-x-12">Earn your role</span>
            </span>
            <span className="w-6 bg-black" aria-hidden="true" />
          </div>

          <div className="hero-mark relative border-2 border-black bg-white p-4 shadow-[8px_8px_0_0_#000] sm:p-7 sm:shadow-[10px_10px_0_0_#000]">
            <div className="pointer-events-none absolute -right-2 -top-2 h-8 w-8 border-2 border-black bg-brand-red sm:-right-3 sm:-top-3 sm:h-10 sm:w-10" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-2 left-6 h-3 w-16 -skew-x-12 bg-black sm:left-8 sm:w-24" aria-hidden="true" />
            <h1 id="home-wordmark" className="max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-auto w-full" width={640} height={160} />
            </h1>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
            <Link
              href="/register?from=%2F"
              className="hero-cta inline-flex min-h-11 -skew-x-12 items-center border-2 border-black bg-brand-red px-6 py-3 text-display text-sm font-semibold uppercase tracking-wider text-white shadow-[6px_6px_0_0_#000] sm:px-7"
            >
              <span className="inline-block skew-x-12">Sign up</span>
            </Link>
            <p className="hero-aside max-w-[10rem] bg-white px-2 text-[10px] uppercase tracking-[0.18em] text-foreground sm:max-w-[12rem] sm:text-xs">
              Step on the card
            </p>
          </div>

          <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
            <li className="hero-line-1 max-w-lg">
              <p className="hero-chip -rotate-1 border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0_#000] sm:px-4 sm:py-3">
                <FunkyHeadline id="built-for-grapplers" trailing={<span className="text-lg sm:text-xl">🇮🇳</span>} />
              </p>
            </li>
            <li className="hero-line-2 max-w-md">
              <p className="hero-chip hero-chip-dark rotate-1 border-2 border-black bg-black px-3 py-2 shadow-[4px_4px_0_0_#c8102e] sm:px-4 sm:py-3">
                <FunkyHeadline id="brazilian-jiu-jitsu-platform" tone="white" />
              </p>
            </li>
            <li className="hero-line-3 hidden max-w-lg sm:block">
              <p className="hero-speech manga-speech-bubble px-3 py-2.5 sm:px-4 sm:py-3">
                <FunkyHeadline id="real-fights-real-pay-real-rankings" />
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
