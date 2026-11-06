import Link from "next/link";

export type PosterDivision = {
  id: string;
  name: string;
  discipline: string;
  capacity: number;
};

const DOORS = [
  {
    key: "brackets",
    title: "Brackets",
    label: "Open brackets",
    path: "brackets",
    body: "Every round, from the first fight to the final. Winners move on. If someone is out, that side of the card keeps going.",
  },
  {
    key: "schedule",
    title: "Schedule",
    label: "Open schedule",
    path: "schedule",
    body: "When you are called. Your own list shows the mat you are on.",
  },
  {
    key: "results",
    title: "Results",
    label: "Open results",
    path: "results",
    body: "Who won, once the match is over. A win, a loss, or a stoppage.",
  },
] as const;

export function EventPoster({
  name,
  slug,
  date,
  line,
  venue,
  statusLine,
  registerUntil,
  matCount,
  divisions,
  canRegister,
}: {
  name: string;
  slug: string;
  date: string;
  line?: string;
  venue: string;
  statusLine: string;
  registerUntil: string | null;
  matCount: number;
  divisions: PosterDivision[];
  canRegister: boolean;
}) {
  const mats = matCount === 1 ? "1 mat" : `${matCount} mats`;

  return (
    <article className="border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
      <div className="bg-black px-6 py-8 text-white sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Next card</p>
        <p className="text-display mt-4 text-2xl font-semibold sm:text-3xl">{date}</p>
        <h2 className="text-display mt-2 max-w-3xl text-4xl font-semibold leading-[0.95] sm:text-6xl">{name}</h2>
        {line && <p className="mt-4 text-sm text-white/80">{line}</p>}
        {venue && <p className="mt-4 text-sm text-white/80">{venue}</p>}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <p className="max-w-md text-sm leading-relaxed">{statusLine}</p>
          {registerUntil && <p className="mt-2 text-sm">Registration closes {registerUntil}.</p>}

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Divisions</p>
          {divisions.length > 0 ? (
            <ul className="mt-3 divide-y divide-black/10 border-y border-black/10">
              {divisions.map((division) => (
                <li key={division.id} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-semibold">{division.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {division.discipline} · {division.capacity} spots
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm">Divisions will be listed here when they are set.</p>
          )}
          <p className="mt-3 text-sm">{mats} on the floor. Open matches are split across them.</p>

          {canRegister && (
            <Link href="/register" className="mt-8 inline-flex border-2 border-black bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-[4px_4px_0_0_#000]">
              Register to compete
            </Link>
          )}
        </div>

        <div className="border-t-2 border-black lg:border-t-0 lg:border-l-2">
          {DOORS.map((door) => (
            <Link
              key={door.key}
              href={`/events/${slug}/${door.path}`}
              className="block border-b-2 border-black px-6 py-6 last:border-b-0 hover:bg-black/[0.03] sm:px-8"
            >
              <span className="text-display text-2xl font-semibold">{door.title}</span>
              <p className="mt-2 max-w-sm text-sm leading-relaxed">{door.body}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-red">{door.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
