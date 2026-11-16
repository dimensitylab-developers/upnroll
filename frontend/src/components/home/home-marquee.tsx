/**
 * Full-bleed sponsor tape: edge to edge, full red lining, no end caps.
 */

type Logo = {
  name: string;
  src: string;
  /** Optical size: height drives scale; width follows the asset ratio. */
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
    <div className="flex w-max items-center" aria-hidden={ariaHidden || undefined}>
      {RIBBON.map((logo, index) => (
        <span key={`${logo.name}-${index}`} className="inline-flex items-center">
          <LogoSlot logo={logo} />
          <Separator />
        </span>
      ))}
    </div>
  );
}

/** Edge-to-edge sponsor tape with a complete red lining under the full width. */
export function HomeMarquee() {
  return (
    <section className="home-marquee relative z-10 w-full overflow-x-clip py-8 sm:py-10" aria-label="Sponsors">
      <p className="sr-only">Up &apos;n Roll sponsors</p>

      {/* Room for tilt so the lining stays fully visible */}
      <div className="relative w-full py-3 sm:py-4">
        <div className="relative w-[110%] origin-center -translate-x-[5%] -rotate-1 sm:-rotate-[1.15deg]">
          {/* Full red lining: continuous under the whole tape */}
          <div className="absolute inset-x-0 -bottom-2.5 top-2.5 bg-brand-red sm:-bottom-3 sm:top-3" aria-hidden="true" />

          <div className="relative border-y-[3px] border-black bg-white">
            <div
              className="pointer-events-none absolute inset-x-0 top-1.5 border-t border-dashed border-black/20"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-1.5 border-b border-dashed border-black/20"
              aria-hidden="true"
            />

            <div className="relative overflow-hidden">
              <div className="home-marquee-row overflow-hidden py-2 sm:py-2.5">
                <div className="home-marquee-track flex w-max will-change-transform">
                  <Track />
                  <Track ariaHidden />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
