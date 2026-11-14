import Image from "next/image";
import Link from "next/link";

const EVENT_BANNERS: Record<string, string> = {
  "up-n-roll-superfight-series": "/banners/up-n-roll-no-gi-2.jpg",
};

export function EventPoster({
  name,
  slug,
  date,
  line,
  venue,
  statusLine,
  registerUntil,
  canRegister,
}: {
  name: string;
  slug: string;
  date: string;
  line?: string;
  venue: string;
  statusLine: string;
  registerUntil: string | null;
  canRegister: boolean;
}) {
  const banner = EVENT_BANNERS[slug] ?? null;

  return (
    <article className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
      {banner ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-black bg-black sm:aspect-[21/9]">
          <Image
            src={banner}
            alt={`${name} event banner`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 72rem"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 py-6 text-white sm:px-10 sm:py-8">
            {slug === "up-n-roll-superfight-series" ? (
              <div className="flex flex-wrap items-end gap-3">
                <span className="-rotate-2 border-2 border-black bg-brand-red px-2.5 py-1 text-display text-xl font-semibold shadow-[3px_3px_0_0_#000]">
                  #2
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Next card · Match</p>
              </div>
            ) : (
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Next card</p>
            )}
            <p className="text-display mt-2 text-xl font-semibold sm:text-2xl">{date}</p>
            <h2 className="text-display mt-1 max-w-3xl text-3xl font-semibold leading-[0.95] sm:text-5xl">{name}</h2>
            {line && <p className="mt-3 text-sm text-white/85">{line}</p>}
            <p className="mt-2 text-sm text-white/80">
              {venue || (slug === "up-n-roll-superfight-series" ? "Mumbai" : "")}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-black px-6 py-8 text-white sm:px-10 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Next card</p>
          <p className="text-display mt-4 text-2xl font-semibold sm:text-3xl">{date}</p>
          <h2 className="text-display mt-2 max-w-3xl text-4xl font-semibold leading-[0.95] sm:text-6xl">{name}</h2>
          {line && <p className="mt-4 text-sm text-white/80">{line}</p>}
          {venue && <p className="mt-4 text-sm text-white/80">{venue}</p>}
        </div>
      )}

      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <p className="max-w-xl text-sm leading-relaxed">{statusLine}</p>
        {registerUntil && <p className="mt-2 text-sm">Registration closes {registerUntil}.</p>}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/events/${slug}`}
            prefetch
            className="inline-flex border-2 border-black bg-white px-4 py-2 text-sm font-semibold shadow-[4px_4px_0_0_#000] transition-colors active:bg-brand-red/10"
          >
            Open full card
          </Link>
          {canRegister ? (
            <Link
              href="/fighter/registrations/new"
              className="inline-flex border-2 border-black bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-[4px_4px_0_0_#000]"
            >
              Register to compete
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
