import { GrapplingEmoji, type GrapplingEmojiName } from "@/components/ui/grappling-emoji";

type MarqueeBit =
  | { kind: "stamp"; label: string; tone: "red" | "white" | "ink" | "gold"; tilt?: string }
  | { kind: "shout"; label: string }
  | { kind: "emoji"; name: GrapplingEmojiName; tilt?: string };

const MAIN_BITS: MarqueeBit[] = [
  { kind: "stamp", label: "UP 'N ROLL", tone: "red", tilt: "-rotate-1" },
  { kind: "emoji", name: "double-leg-takedown", tilt: "rotate-6" },
  { kind: "stamp", label: "MUMBAI", tone: "white", tilt: "rotate-1" },
  { kind: "shout", label: "NO-GI" },
  { kind: "emoji", name: "armbar", tilt: "-rotate-8" },
  { kind: "stamp", label: "REAL FIGHTS", tone: "ink", tilt: "-rotate-[0.5deg]" },
  { kind: "stamp", label: "REAL PAY", tone: "gold", tilt: "rotate-1" },
  { kind: "emoji", name: "hip-throw", tilt: "rotate-3" },
  { kind: "stamp", label: "REAL RANKINGS", tone: "white", tilt: "-rotate-1" },
  { kind: "shout", label: "SUPERFIGHT" },
  { kind: "emoji", name: "triangle-choke", tilt: "-rotate-6" },
  { kind: "stamp", label: "GRAPPLING WAVE", tone: "red", tilt: "rotate-[0.75deg]" },
  { kind: "emoji", name: "rear-naked-choke", tilt: "rotate-12" },
  { kind: "stamp", label: "EARN YOUR ROLE", tone: "ink", tilt: "-rotate-1" },
];

const PUNCH_BITS: MarqueeBit[] = [
  { kind: "stamp", label: "SLAM", tone: "white", tilt: "rotate-2" },
  { kind: "shout", label: "LOCK" },
  { kind: "emoji", name: "mount", tilt: "-rotate-10" },
  { kind: "stamp", label: "CHOKE", tone: "red", tilt: "-rotate-1" },
  { kind: "stamp", label: "SWEEP", tone: "gold", tilt: "rotate-1" },
  { kind: "emoji", name: "knee-slice", tilt: "rotate-8" },
  { kind: "shout", label: "TAP" },
  { kind: "stamp", label: "INDIA", tone: "ink", tilt: "-rotate-[0.75deg]" },
  { kind: "stamp", label: "STEP ON THE CARD", tone: "white", tilt: "rotate-1" },
  { kind: "emoji", name: "clinch-collar-tie", tilt: "-rotate-4" },
];

function Bit({ bit }: { bit: MarqueeBit }) {
  if (bit.kind === "emoji") {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center border-2 border-black bg-white p-1 shadow-[3px_3px_0_0_#000] ${bit.tilt ?? ""}`}
      >
        <GrapplingEmoji name={bit.name} size={26} />
      </span>
    );
  }

  if (bit.kind === "shout") {
    return (
      <span className="text-funky shrink-0 whitespace-nowrap px-1 text-xl text-white drop-shadow-[2px_2px_0_#000] sm:text-2xl">
        {bit.label}!
      </span>
    );
  }

  const tone =
    bit.tone === "red"
      ? "bg-brand-red text-white"
      : bit.tone === "ink"
        ? "bg-black text-white"
        : bit.tone === "gold"
          ? "bg-[#F5C518] text-black"
          : "bg-white text-black";

  return (
    <span
      className={`inline-flex shrink-0 -skew-x-12 items-center border-2 border-black px-3 py-1 shadow-[3px_3px_0_0_#000] ${tone} ${bit.tilt ?? ""}`}
    >
      <span className="inline-block skew-x-12 text-display text-[11px] font-semibold uppercase tracking-[0.16em] sm:text-xs">
        {bit.label}
      </span>
    </span>
  );
}

function Track({
  bits,
  ariaHidden,
  className,
}: {
  bits: MarqueeBit[];
  ariaHidden?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex w-max items-center gap-4 px-3 sm:gap-5 ${className ?? ""}`} aria-hidden={ariaHidden || undefined}>
      {bits.map((bit, index) => (
        <Bit key={`${bit.kind}-${"label" in bit ? bit.label : bit.name}-${index}`} bit={bit} />
      ))}
    </div>
  );
}

/** Comic fight-card ticker — mixed stamps, shouts, and stickers in dual opposing loops. */
export function HomeMarquee() {
  return (
    <section
      className="home-marquee relative z-10 overflow-hidden border-y-[3px] border-black bg-black"
      aria-label="Up 'n Roll highlights"
    >
      <p className="sr-only">
        Up &apos;n Roll. Mumbai. No-Gi. Real fights, real pay, real rankings. Superfight. Grappling
        wave.
      </p>

      <div className="checker-strip h-2 border-b-2 border-black" aria-hidden="true" />

      <div className="home-marquee-row overflow-hidden py-3 sm:py-3.5">
        <div className="home-marquee-track flex w-max">
          <Track bits={MAIN_BITS} />
          <Track bits={MAIN_BITS} ariaHidden />
        </div>
      </div>

      <div className="overflow-hidden border-t-2 border-black bg-brand-red py-2.5 sm:py-3">
        <div className="home-marquee-track home-marquee-track-reverse flex w-max">
          <Track bits={PUNCH_BITS} />
          <Track bits={PUNCH_BITS} ariaHidden />
        </div>
      </div>
    </section>
  );
}
