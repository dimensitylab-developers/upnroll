/**
 * Single-direction sponsor / brand strip.
 * Client sends logos later; until then show Up 'n Roll + placeholder sponsor slots.
 */

const SPONSORS = [
  { label: "Up 'n Roll", tone: "red" as const },
  { label: "Title sponsor", tone: "white" as const },
  { label: "Sponsor", tone: "ink" as const },
  { label: "Sponsor", tone: "gold" as const },
  { label: "Up 'n Roll", tone: "red" as const },
  { label: "Sponsor", tone: "white" as const },
];

function Chip({ label, tone }: { label: string; tone: "red" | "white" | "ink" | "gold" }) {
  const toneClass =
    tone === "red"
      ? "bg-brand-red text-white"
      : tone === "ink"
        ? "bg-black text-white"
        : tone === "gold"
          ? "bg-[#F5C518] text-black"
          : "bg-white text-black";

  return (
    <span
      className={`inline-flex shrink-0 items-center border-2 border-black px-4 py-2 shadow-[3px_3px_0_0_#000] ${toneClass}`}
    >
      <span className="text-display text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs">
        {label}
      </span>
    </span>
  );
}

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex w-max items-center gap-4 px-3 sm:gap-5" aria-hidden={ariaHidden || undefined}>
      {SPONSORS.map((item, index) => (
        <Chip key={`${item.label}-${index}`} label={item.label} tone={item.tone} />
      ))}
    </div>
  );
}

/** Single-direction brand / sponsor ticker. */
export function HomeMarquee() {
  return (
    <section
      className="home-marquee relative z-10 overflow-hidden border-y-[3px] border-black bg-black"
      aria-label="Sponsors"
    >
      <p className="sr-only">Up &apos;n Roll sponsors</p>
      <div className="home-marquee-row overflow-hidden py-3 sm:py-3.5">
        <div className="home-marquee-track flex w-max">
          <Track />
          <Track ariaHidden />
        </div>
      </div>
    </section>
  );
}
