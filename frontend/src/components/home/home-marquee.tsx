/**
 * Tilted white sponsor tape — large, even logos, clear ratios.
 */

type Logo = {
  name: string;
  src: string;
  /** Optical size — height drives scale; width follows the asset ratio. */
  className: string;
};

const LOGOS: Logo[] = [
  {
    name: "Up 'n Roll",
    src: "/logo-wordmark.png",
    className: "h-9 w-auto sm:h-11",
  },
  {
    name: "The Perspective Box",
    src: "/sponsors/perspective-box.png?v=2",
    className: "h-10 w-auto sm:h-12",
  },
  {
    name: "Partner marks",
    src: "/sponsors/eye.png?v=3",
    className: "h-10 w-auto sm:h-12",
  },
  {
    name: "Clutch Hydration",
    src: "/sponsors/hydration.png?v=3",
    className: "h-10 w-auto sm:h-12",
  },
];

const RIBBON = [...LOGOS, ...LOGOS, ...LOGOS];

function Separator() {
  return (
    <span className="mx-7 inline-flex shrink-0 items-center sm:mx-10" aria-hidden="true">
      <span className="h-1.5 w-1.5 rotate-45 bg-brand-red sm:h-2 sm:w-2" />
    </span>
  );
}

function LogoSlot({ logo }: { logo: Logo }) {
  return (
    <span className="inline-flex h-12 shrink-0 items-center justify-center sm:h-14">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.name}
        className={`max-w-none object-contain object-center ${logo.className}`}
      />
    </span>
  );
}

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex w-max items-center px-6" aria-hidden={ariaHidden || undefined}>
      {RIBBON.map((logo, index) => (
        <span key={`${logo.name}-${index}`} className="inline-flex items-center">
          <LogoSlot logo={logo} />
          <Separator />
        </span>
      ))}
    </div>
  );
}

/** Slightly tilted manga tape — narrower band, logos still clear and broad. */
export function HomeMarquee() {
  return (
    <section className="home-marquee relative z-10 py-4 sm:py-5" aria-label="Sponsors">
      <p className="sr-only">Up &apos;n Roll sponsors</p>
      <div className="relative overflow-hidden">
        <div className="origin-center -rotate-1 border-y-2 border-black bg-white shadow-[0_4px_0_0_#c8102e] sm:-rotate-[1.25deg]">
          <div className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16"
              aria-hidden="true"
            />
            <div className="home-marquee-row overflow-hidden py-1 sm:py-1.5">
              <div className="home-marquee-track flex w-max will-change-transform">
                <Track />
                <Track ariaHidden />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
