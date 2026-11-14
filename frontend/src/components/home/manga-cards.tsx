import Image from "next/image";

interface MangaCardItem {
  title: string;
  sfx: string;
  image: string;
  line: string;
  tilt: string;
}

/** Source art is ~896×1200 (3:4). Keep every panel locked to that ratio. */
const CARDS: MangaCardItem[] = [
  {
    title: "TAKEDOWN",
    sfx: "SLAM!",
    image: "/manga/takedown.jpg",
    line: "Level change. Drive through. Finish on top.",
    tilt: "-rotate-1",
  },
  {
    title: "CLINCH",
    sfx: "CLINCH!",
    image: "/manga/clinch.jpg",
    line: "Collar tie. Dig underhooks. Break the base.",
    tilt: "rotate-1",
  },
  {
    title: "FLYING ARMBAR",
    sfx: "LOCK!",
    image: "/manga/guard.jpg",
    line: "Catch the posture. Launch. Tap.",
    tilt: "-rotate-[0.5deg]",
  },
  {
    title: "SCRAMBLE",
    sfx: "SWEEP!",
    image: "/manga/scramble.jpg",
    line: "Off-balance. Reverse. Hunt the back.",
    tilt: "rotate-[1.5deg]",
  },
  {
    title: "REAR CHOKE",
    sfx: "CHOKE!",
    image: "/manga/choke.jpg",
    line: "Take the back. Sink the choke. Finish.",
    tilt: "-rotate-1",
  },
];

function MangaPanel({ card, featured = false }: { card: MangaCardItem; featured?: boolean }) {
  return (
    <article
      className={`group relative overflow-hidden border-2 border-black bg-black shadow-[7px_7px_0_0_#000] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#c8102e] ${card.tilt}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes={featured ? "(max-width: 1024px) 100vw, 40vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 22vw"}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          priority={featured}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

        <span className="absolute left-2.5 top-2.5 border-2 border-black bg-brand-red px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-[2px_2px_0_0_#000] sm:text-xs">
          {card.title}
        </span>
        <span className="absolute right-2.5 top-2.5 -rotate-6 border-2 border-black bg-white px-2 py-0.5 text-display text-xs font-bold tracking-wider text-brand-red shadow-[2px_2px_0_0_#000] sm:text-sm">
          {card.sfx}
        </span>

        <div className="absolute bottom-2.5 left-2.5 right-2.5">
          <p className="max-w-[14rem] bg-white px-2 py-1 text-[10px] font-semibold uppercase leading-snug tracking-wide text-black sm:text-xs">
            {card.line}
          </p>
        </div>
      </div>
    </article>
  );
}

export function MangaCards() {
  const [hero, ...rest] = CARDS;

  return (
    <div className="relative">
      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)] lg:gap-6">
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
          <MangaPanel card={hero} featured />
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-2">
          {rest.map((card) => (
            <li key={card.title} className="min-w-0">
              <MangaPanel card={card} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Soft manga watermark for empty homepage atmosphere — does not fight the content. */
export function MangaBackdrop({
  src = "/manga/scramble.jpg",
  className = "",
}: {
  src?: string;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute -right-16 top-1/2 w-[min(52vw,28rem)] -translate-y-1/2 rotate-3 opacity-[0.07] grayscale sm:opacity-[0.09]">
        <div className="relative aspect-[3/4] w-full border-2 border-black">
          <Image src={src} alt="" fill sizes="28rem" className="object-cover" />
        </div>
      </div>
      <div className="absolute -left-20 bottom-0 w-[min(40vw,20rem)] -rotate-6 opacity-[0.05] grayscale">
        <div className="relative aspect-[3/4] w-full border-2 border-black">
          <Image src="/manga/takedown.jpg" alt="" fill sizes="20rem" className="object-cover" />
        </div>
      </div>
    </div>
  );
}
