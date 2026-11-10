import Link from "next/link";
import type { ReactNode } from "react";

export type FighterHypeCardData = {
  displayName: string;
  slug: string;
  gym?: string;
  academy?: string;
  discipline?: string;
  beltRank?: string;
  weightDivision?: string;
  hasPhoto?: boolean;
  wins?: number;
  losses?: number;
  points?: number;
  rank?: number | null;
  featured?: boolean;
  houseLabel?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Vertical trading / playing card.
 * `compact` = dense board face for rankings (many fighters).
 */
export function FighterHypeCard({
  fighter,
  href,
  footer,
  compact = false,
}: {
  fighter: FighterHypeCardData;
  href?: string;
  footer?: ReactNode;
  compact?: boolean;
}) {
  const team = fighter.academy?.trim() || fighter.gym?.trim() || "Independent";
  const line = [fighter.beltRank, fighter.weightDivision].filter(Boolean).join(" · ");
  const wins = fighter.wins ?? 0;
  const losses = fighter.losses ?? 0;
  const photoSrc = fighter.hasPhoto && fighter.slug ? `/api/v1/public/fighters/${fighter.slug}/photo` : null;
  const house = fighter.houseLabel ?? "Up 'n Roll";

  const body = compact ? (
    <article
      className={[
        "fighter-playing-card relative flex w-full flex-col overflow-hidden border-2 border-black bg-white text-black shadow-[3px_3px_0_0_#000] transition-[transform,box-shadow] duration-150 ease-out",
        "hover:-translate-y-1 hover:shadow-[5px_5px_0_0_#c8102e]",
        fighter.featured ? "ring-2 ring-brand-red ring-offset-1" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-1 border-b border-black bg-black px-1.5 py-0.5 text-white">
        <span className="truncate text-[8px] font-semibold uppercase tracking-[0.14em] text-brand-red">{house}</span>
        <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.12em] text-white/65">
          {fighter.rank ? `#${fighter.rank}` : "Card"}
        </span>
      </div>

      <div className="relative aspect-[5/4] overflow-hidden bg-[#e8e2d8]">
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt=""
            width={320}
            height={256}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-display text-xl font-semibold text-black/25">{initials(fighter.displayName) || "UR"}</span>
          </div>
        )}
      </div>

      <div className="border-t border-black bg-white px-1.5 py-1.5">
        <h3 className="text-display truncate text-[0.8rem] font-semibold leading-none tracking-tight">{fighter.displayName}</h3>
        <p className="mt-0.5 truncate text-[9px] leading-snug text-muted-foreground">{team}</p>
        {line ? <p className="truncate text-[8px] leading-snug text-muted-foreground">{line}</p> : null}
        <div className="mt-1.5 flex items-baseline justify-between gap-1 border-t border-black/15 pt-1">
          <span className="text-display text-sm font-semibold leading-none">
            {wins}-{losses}
          </span>
          {typeof fighter.points === "number" && fighter.points > 0 ? (
            <span className="text-display text-sm font-semibold leading-none text-brand-red">{fighter.points}</span>
          ) : null}
        </div>
      </div>
      {footer ? <div className="border-t border-black bg-[#f7f4ef] px-1.5 py-1.5">{footer}</div> : null}
    </article>
  ) : (
    <article
      className={[
        "fighter-playing-card relative mx-auto flex w-[14.5rem] flex-col overflow-hidden border-2 border-black bg-white text-black shadow-[5px_5px_0_0_#000] transition-[transform,box-shadow] duration-200 ease-out",
        "hover:-translate-y-2 hover:shadow-[8px_8px_0_0_#c8102e]",
        fighter.featured ? "ring-2 ring-brand-red ring-offset-2" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 border-b-2 border-black bg-black px-2.5 py-1 text-white">
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-red">{house}</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/65">
          {fighter.rank ? `#${fighter.rank}` : "Card"}
        </span>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e2d8]">
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt=""
            width={232}
            height={290}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 border-b border-black/5">
            <span className="text-display text-3xl font-semibold tracking-tight text-black/25">
              {initials(fighter.displayName) || "UR"}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-black/40">Photo soon</span>
          </div>
        )}
      </div>

      <div className="border-t-2 border-black bg-white px-2.5 pb-2.5 pt-2">
        <h3 className="text-display truncate text-[1.05rem] font-semibold leading-none tracking-tight">
          {fighter.displayName}
        </h3>
        <p className="mt-1 truncate text-[11px] leading-snug text-muted-foreground">{team}</p>
        {line ? <p className="mt-0.5 truncate text-[10px] leading-snug text-muted-foreground">{line}</p> : null}

        <div className="mt-2.5 flex items-end justify-between gap-2 border-t-2 border-black pt-2">
          <div>
            <p className="text-display text-lg font-semibold leading-none">
              {wins}-{losses}
            </p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-black/45">Record</p>
          </div>
          {typeof fighter.points === "number" && fighter.points > 0 ? (
            <div className="text-right">
              <p className="text-display text-lg font-semibold leading-none text-brand-red">{fighter.points}</p>
              <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-black/45">Points</p>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/logo-mark.png" alt="" className="mb-0.5 h-5 w-5 object-contain opacity-70" />
          )}
        </div>
      </div>

      <div className="checker-strip h-1.5 border-t-2 border-black" aria-hidden="true" />
      {footer ? <div className="border-t-2 border-black bg-[#f7f4ef] px-2 py-2">{footer}</div> : null}
    </article>
  );

  if (!href) return body;

  return (
    <Link
      href={href}
      className={[
        "block max-w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black",
        compact ? "w-full" : "w-fit",
      ].join(" ")}
    >
      {body}
    </Link>
  );
}
