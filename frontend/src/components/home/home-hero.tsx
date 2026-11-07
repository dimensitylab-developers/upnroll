import Link from "next/link";
import { FunkyHeadline } from "./funky-headline";
import { HeroFightTape } from "./hero-fight-tape";
import { MatEmojis } from "./mat-emojis";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-black">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-black lg:block" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-8 right-[28%] hidden w-3 -skew-x-12 bg-brand-red lg:block" aria-hidden="true" />
      <MatEmojis className="absolute inset-0 z-[1] opacity-80" />

      <div className="relative mx-auto grid max-w-6xl items-end gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:px-8 lg:py-16">
        <div className="relative z-10">
          <div className="hero-stamp mb-6 inline-flex -skew-x-12 items-stretch shadow-[5px_5px_0_0_#000]">
            <span className="w-3 bg-black" aria-hidden="true" />
            <span className="bg-brand-red px-4 py-2 text-display text-xs font-semibold uppercase tracking-[0.22em] text-white sm:text-sm">
              <span className="inline-block skew-x-12">Earn your role</span>
            </span>
            <span className="w-6 bg-black" aria-hidden="true" />
          </div>

          <div className="hero-mark relative border-2 border-black bg-white p-5 shadow-[10px_10px_0_0_#000] sm:p-7">
            <div className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 border-2 border-black bg-brand-red" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-2 left-8 h-3 w-24 -skew-x-12 bg-black" aria-hidden="true" />
            <h1 id="home-wordmark" className="max-w-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-wordmark.png" alt="Up 'n Roll" className="h-auto w-full" />
            </h1>
          </div>

          <ul className="mt-6 space-y-3">
            <li className="hero-line-1 max-w-lg">
              <p className="hero-chip -rotate-1 border-2 border-black bg-white px-3 py-2.5 shadow-[4px_4px_0_0_#000] sm:px-4 sm:py-3">
                <FunkyHeadline id="built-for-grapplers" trailing={<span className="text-lg sm:text-xl">🇮🇳</span>} />
              </p>
            </li>
            <li className="hero-line-2 max-w-md">
              <p className="hero-chip hero-chip-dark rotate-1 border-2 border-black bg-black px-3 py-2.5 shadow-[4px_4px_0_0_#c8102e] sm:px-4 sm:py-3">
                <FunkyHeadline id="brazilian-jiu-jitsu-platform" tone="white" />
              </p>
            </li>
            <li className="hero-line-3 max-w-lg">
              <p className="hero-speech manga-speech-bubble px-3 py-2.5 sm:px-4 sm:py-3">
                <FunkyHeadline id="real-fights-real-pay-real-rankings" />
              </p>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="hero-cta inline-flex -skew-x-12 items-center border-2 border-black bg-brand-red px-7 py-3 text-display text-sm font-semibold uppercase tracking-wider text-white shadow-[6px_6px_0_0_#000]"
            >
              <span className="inline-block skew-x-12">Sign up</span>
            </Link>
            <p className="hero-aside max-w-[12rem] bg-white px-2 text-xs uppercase tracking-[0.18em] text-foreground">
              Step on the card
            </p>
          </div>
        </div>

        <HeroFightTape />
      </div>
    </section>
  );
}
