import Link from "next/link";
import { FighterPhoto } from "@/features/fighters/fighter-photo";

export type PodiumFighter = {
  rank: number;
  displayName: string;
  slug: string | null;
  wins: number;
  losses: number;
  points: number;
  hasPhoto?: boolean;
  academy?: string;
};

const PLACE = {
  1: {
    medal: "Gold",
    tag: "Champ",
    order: "order-2",
    delay: "podium-rise-1",
    step: "h-[7.5rem] sm:h-40",
    crown: "text-4xl sm:text-5xl",
    photo: "h-28 w-28 sm:h-36 sm:w-36",
    tilt: "rotate-0",
    face: "bg-[#fff4c2]",
    stepFace: "bg-[#f5c518]",
    stamp: "bg-brand-red text-white",
    shadow: "shadow-[6px_6px_0_0_#c8102e]",
  },
  2: {
    medal: "Silver",
    tag: "Contender",
    order: "order-1",
    delay: "podium-rise-2",
    step: "h-24 sm:h-[7.5rem]",
    crown: "text-3xl sm:text-4xl",
    photo: "h-24 w-24 sm:h-28 sm:w-28",
    tilt: "-rotate-2",
    face: "bg-[#eceff3]",
    stepFace: "bg-[#c5ccd6]",
    stamp: "bg-black text-white",
    shadow: "shadow-[5px_5px_0_0_#000]",
  },
  3: {
    medal: "Bronze",
    tag: "Threat",
    order: "order-3",
    delay: "podium-rise-3",
    step: "h-16 sm:h-24",
    crown: "text-3xl sm:text-4xl",
    photo: "h-24 w-24 sm:h-28 sm:w-28",
    tilt: "rotate-2",
    face: "bg-[#f3e0c8]",
    stepFace: "bg-[#c47a3a]",
    stamp: "bg-black text-white",
    shadow: "shadow-[5px_5px_0_0_#000]",
  },
} as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PodiumSlot({ fighter }: { fighter: PodiumFighter }) {
  const place = PLACE[fighter.rank as 1 | 2 | 3];
  if (!place) return null;

  const photoSrc = fighter.hasPhoto && fighter.slug ? `/api/v1/public/fighters/${fighter.slug}/photo` : null;
  const face = (
    <div className={`podium-slot group flex w-full flex-col items-center ${place.delay}`}>
      {/* Photo plate */}
      <div className={`relative ${place.tilt} transition-transform duration-200 group-hover:-translate-y-1`}>
        {fighter.rank === 1 ? (
          <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 border-2 border-black bg-brand-red px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-[2px_2px_0_0_#000]">
            #1 on the card
          </span>
        ) : null}
        <div className={`relative overflow-hidden border-2 border-black ${place.face} ${place.photo} ${place.shadow}`}>
          {photoSrc && fighter.slug ? (
            <FighterPhoto
              slug={fighter.slug}
              displayName={fighter.displayName}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1">
              <span className="text-display text-3xl font-semibold text-black/20 sm:text-4xl">
                {initials(fighter.displayName)}
              </span>
            </div>
          )}
          <span
            className={`absolute bottom-0 left-0 right-0 border-t-2 border-black px-1 py-1 text-center text-[9px] font-semibold uppercase tracking-[0.16em] ${place.stamp}`}
          >
            {place.medal}
          </span>
        </div>
        <span className="absolute -right-2 -top-2 border-2 border-black bg-white px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] shadow-[2px_2px_0_0_#000]">
          {place.tag}
        </span>
      </div>

      {/* Identity */}
      <div className="relative z-10 mt-4 w-full max-w-[11rem] text-center sm:max-w-[13rem]">
        <p className={`text-display font-semibold leading-none tracking-tight ${place.crown}`}>
          <span className={fighter.rank === 1 ? "text-brand-red" : "text-black"}>{fighter.rank}</span>
        </p>
        <p className="text-display mt-2 truncate text-base font-semibold leading-tight sm:text-lg">{fighter.displayName}</p>
        {fighter.academy ? (
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-[11px]">{fighter.academy}</p>
        ) : null}
        <div className="mt-2 inline-flex items-center gap-2 border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0_0_#000]">
          <span className="text-display text-sm font-semibold leading-none">
            {fighter.wins}-{fighter.losses}
          </span>
          <span className="h-3 w-px bg-black/20" aria-hidden="true" />
          <span className="text-display text-sm font-semibold leading-none text-brand-red">{fighter.points}</span>
          <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-black/45">pts</span>
        </div>
      </div>

      {/* Pedestal */}
      <div
        className={`relative mt-4 w-full overflow-hidden border-2 border-black border-b-0 ${place.stepFace} ${place.step}`}
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute inset-0 speed-lines opacity-40" />
        <div className="absolute inset-x-0 top-0 checker-strip h-2 border-b-2 border-black" />
        <p className="absolute inset-0 flex items-center justify-center text-display text-[4.5rem] font-semibold leading-none text-black/10 sm:text-[5.5rem]">
          {fighter.rank}
        </p>
        {fighter.rank === 1 ? (
          <div className="absolute inset-x-3 bottom-3 border-2 border-black bg-black px-2 py-1 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-red">
            House peak
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!fighter.slug) {
    return <li className={`min-w-0 flex-1 ${place.order}`}>{face}</li>;
  }

  return (
    <li className={`min-w-0 flex-1 ${place.order}`}>
      <Link
        href={`/fighters/${fighter.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        {face}
      </Link>
    </li>
  );
}

/** Triangle podium — 2 · 1 · 3 — fight-night stage energy. */
export function RankingsPodium({ top }: { top: PodiumFighter[] }) {
  const slots = [1, 2, 3]
    .map((rank) => top.find((fighter) => fighter.rank === rank))
    .filter((fighter): fighter is PodiumFighter => Boolean(fighter));

  if (slots.length === 0) return null;

  return (
    <div className="podium-stage relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 speed-lines opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-red/10 to-transparent" aria-hidden="true" />
      <p className="relative mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-red">
        Tonight&apos;s peak · Gold · Silver · Bronze
      </p>
      <ol className="relative flex items-end justify-center gap-2 sm:gap-5" aria-label="Podium">
        {slots.map((fighter) => (
          <PodiumSlot key={fighter.rank} fighter={fighter} />
        ))}
      </ol>
      <div className="checker-strip relative h-3 border-t-2 border-black" aria-hidden="true" />
    </div>
  );
}
