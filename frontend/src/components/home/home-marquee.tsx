/**
 * Theme-fit sponsor ribbon — white tape, black edge, logos first.
 * Partner marks are punched for a white strip so black plates disappear.
 */

type Item =
  | { kind: "logo"; name: string; src: string; className: string }
  | { kind: "mark"; name: string; src: string; className: string }
  | { kind: "word"; text: string };

const ITEMS: Item[] = [
  { kind: "mark", name: "Up 'n Roll", src: "/logo-mark.png", className: "h-9 w-9 sm:h-10 sm:w-10" },
  { kind: "logo", name: "Up 'n Roll", src: "/logo-wordmark.png", className: "h-7 w-auto sm:h-8" },
  { kind: "logo", name: "The Perspective Box", src: "/sponsors/perspective-box.png", className: "h-11 w-auto sm:h-12" },
  { kind: "logo", name: "Partner", src: "/sponsors/eye.png", className: "h-10 w-auto sm:h-11" },
  { kind: "logo", name: "Hydration", src: "/sponsors/hydration.png", className: "h-4 w-auto min-w-[9rem] sm:h-5 sm:min-w-[11rem]" },
  { kind: "word", text: "OSS" },
];

/** Dense enough that wide screens still feel continuous. */
const RIBBON: Item[] = [...ITEMS, ...ITEMS, ...ITEMS];

function Diamond() {
  return (
    <span
      className="mx-1 inline-block h-1.5 w-1.5 rotate-45 bg-brand-red sm:mx-1.5 sm:h-2 sm:w-2"
      aria-hidden="true"
    />
  );
}

function Slot({ item }: { item: Item }) {
  if (item.kind === "word") {
    return (
      <span className="inline-flex items-center gap-3 px-2 sm:gap-4 sm:px-3">
        <Diamond />
        <span className="text-display text-[11px] font-semibold uppercase tracking-[0.22em] text-black sm:text-xs">
          {item.text}
        </span>
        <Diamond />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3 px-2 sm:gap-4 sm:px-3">
      <Diamond />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.src}
        alt={item.name}
        className={`max-w-[12rem] object-contain object-center sm:max-w-[15rem] ${item.className}`}
      />
    </span>
  );
}

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex w-max items-center" aria-hidden={ariaHidden || undefined}>
      {RIBBON.map((item, index) => (
        <Slot
          key={`${item.kind}-${"src" in item ? item.src : item.text}-${index}`}
          item={item}
        />
      ))}
    </div>
  );
}

/** White manga-tape sponsor strip — logos lead, light motion, theme edges. */
export function HomeMarquee() {
  return (
    <section className="home-marquee relative z-10 overflow-hidden" aria-label="Sponsors">
      <p className="sr-only">Up &apos;n Roll sponsors</p>
      <div className="border-y-2 border-black bg-white">
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent sm:w-16"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent sm:w-16"
            aria-hidden="true"
          />
          <div className="home-marquee-row overflow-hidden py-3 sm:py-4">
            <div className="home-marquee-track flex w-max will-change-transform">
              <Track />
              <Track ariaHidden />
            </div>
          </div>
        </div>
      </div>
      <div className="h-1 bg-brand-red" aria-hidden="true" />
    </section>
  );
}
