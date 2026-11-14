import Link from "next/link";
import { FighterPhoto } from "@/features/fighters/fighter-photo";
import { WEIGHT_CLASSES, type WeightClassId } from "@/features/rankings/weight-classes";

export type DivisionRankedFighter = {
  rank: number;
  displayName: string;
  slug: string | null;
  wins: number;
  losses: number;
  points: number;
  hasPhoto?: boolean;
  academy?: string;
  weightClassId: WeightClassId;
};

function ChampionPortrait({
  slug,
  displayName,
  hasPhoto,
}: {
  slug: string | null;
  displayName: string;
  hasPhoto?: boolean;
}) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative mx-auto mt-4 w-full max-w-[12rem] border-2 border-black bg-[#f3f1ec]">
      <div className="relative aspect-[3/4] overflow-hidden">
        {hasPhoto && slug ? (
          <FighterPhoto
            slug={slug}
            displayName={displayName}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-3">
            <div
              className="flex h-20 w-20 items-center justify-center border-2 border-black/15 bg-white text-display text-2xl font-semibold text-black/35"
              aria-hidden="true"
            >
              {initials || "?"}
            </div>
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Photo soon
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
}

function DivisionColumn({
  label,
  fighters,
}: {
  label: string;
  fighters: DivisionRankedFighter[];
}) {
  const champion = fighters[0] ?? null;
  const contenders = fighters.slice(1, 11);

  return (
    <article className="min-w-0 border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] sm:p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-red">{label}</p>

      {champion ? (
        <div className="mt-3">
          {champion.slug ? (
            <Link href={`/fighters/${champion.slug}`} className="block hover:text-brand-red">
              <h3 className="text-display text-xl font-semibold uppercase leading-[0.95] tracking-wide sm:text-2xl">
                {champion.displayName}
              </h3>
            </Link>
          ) : (
            <h3 className="text-display text-xl font-semibold uppercase leading-[0.95] tracking-wide sm:text-2xl">
              {champion.displayName}
            </h3>
          )}
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Champion
          </p>
          <ChampionPortrait
            slug={champion.slug}
            displayName={champion.displayName}
            hasPhoto={champion.hasPhoto}
          />
          <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide">
            {champion.wins}-{champion.losses}
            <span className="mx-1.5 text-black/25">·</span>
            {champion.points} pts
          </p>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-display text-xl font-semibold uppercase text-muted-foreground">Open</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Champion
          </p>
          <ChampionPortrait slug={null} displayName="TBD" hasPhoto={false} />
        </div>
      )}

      {contenders.length > 0 ? (
        <ol className="mt-5 border-t border-black/10 pt-1">
          {contenders.map((fighter, index) => (
            <li
              key={fighter.slug ?? `${fighter.weightClassId}-${fighter.rank}`}
              className="flex items-baseline gap-3 border-b border-black/5 py-2.5"
            >
              <span className="w-5 shrink-0 text-sm font-semibold tabular-nums">{index + 2}</span>
              <div className="min-w-0 flex-1">
                {fighter.slug ? (
                  <Link
                    href={`/fighters/${fighter.slug}`}
                    className="block truncate text-sm font-medium hover:text-brand-red"
                  >
                    {fighter.displayName}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-medium">{fighter.displayName}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}

export function RankingsDivisionBoard({
  byClass,
}: {
  byClass: Record<WeightClassId, DivisionRankedFighter[]>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {WEIGHT_CLASSES.map((band) => (
        <DivisionColumn key={band.id} label={band.label} fighters={byClass[band.id] ?? []} />
      ))}
    </div>
  );
}
