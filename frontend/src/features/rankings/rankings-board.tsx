import Link from "next/link";

export type RankingsBoardEntry = {
  gender: "MALE" | "FEMALE";
  weightBand: string;
  level: "BEGINNER" | "INTERMEDIATE";
  displayName: string;
  slug: string;
  academy: string;
  wins: number;
  losses: number;
  points: number;
};

export type RankingsLevel = "BEGINNER" | "INTERMEDIATE";

/** Approved weight grid: women -55 / 55-65 / +65, men -55 / 55-65 / 65-75 / 75-85 / +85. */
const GROUPS: { gender: "FEMALE" | "MALE"; title: string; bands: { weightBand: string; label: string }[] }[] = [
  {
    gender: "FEMALE",
    title: "Women",
    bands: [
      { weightBand: "-55", label: "-55 kg" },
      { weightBand: "55-65", label: "55-65 kg" },
      { weightBand: "+65", label: "+65 kg" },
    ],
  },
  {
    gender: "MALE",
    title: "Men",
    bands: [
      { weightBand: "-55", label: "-55 kg" },
      { weightBand: "55-65", label: "55-65 kg" },
      { weightBand: "65-75", label: "65-75 kg" },
      { weightBand: "75-85", label: "75-85 kg" },
      { weightBand: "+85", label: "+85 kg" },
    ],
  },
];

const LEVEL_LABEL: Record<RankingsLevel, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate" };

function pad(points: number) {
  return String(points).padStart(2, "0");
}

function DivisionCard({
  title,
  label,
  entries,
}: {
  title: string;
  label: string;
  entries: RankingsBoardEntry[];
}) {
  // Ranks 1, 2, 3... only start once a match in this division has been decided.
  const ranked = entries.some((entry) => entry.wins + entry.losses > 0);
  const rows = [...entries].sort((a, b) =>
    ranked
      ? b.points - a.points || b.wins - a.wins || a.displayName.localeCompare(b.displayName)
      : a.displayName.localeCompare(b.displayName)
  );

  return (
    <article className="flex min-w-0 flex-col border-2 border-black bg-white shadow-[5px_5px_0_0_#000]">
      <header className="flex items-start justify-between gap-3 border-b-2 border-black bg-black px-4 py-3 text-white">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-red">{title}</p>
          <h3 className="text-display text-2xl font-semibold uppercase leading-none tracking-wide">{label}</h3>
        </div>
        <p className="shrink-0 border border-white/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
          {entries.length} entered
        </p>
      </header>

      {rows.length > 0 ? (
        <ol className="divide-y divide-black/10">
          {rows.map((entry, index) => {
            const top = ranked && index === 0;
            return (
              <li
                key={`${entry.slug}-${index}`}
                className={`flex items-center gap-3 px-4 py-3 ${top ? "bg-brand-red/10" : ""}`}
              >
                <span
                  className={`flex size-7 shrink-0 items-center justify-center text-sm font-bold tabular-nums ${
                    ranked
                      ? top
                        ? "bg-brand-red text-white"
                        : "border-2 border-black"
                      : "text-brand-red"
                  }`}
                  aria-label={ranked ? `Rank ${index + 1}` : "Not ranked yet"}
                >
                  {ranked ? index + 1 : <span className="size-2.5 rotate-45 bg-brand-red" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  {entry.slug ? (
                    <Link
                      href={`/grapplers/${entry.slug}`}
                      className="block truncate text-sm font-semibold hover:text-brand-red"
                    >
                      {entry.displayName}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-semibold">{entry.displayName}</p>
                  )}
                  {entry.academy ? (
                    <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                      {entry.academy}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-display text-xl font-semibold tabular-nums">
                  {pad(entry.points)}
                  <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    pts
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="divide-y divide-black/10" aria-label="Waiting for entries">
          {[0, 1, 2].map((slot) => (
            <li key={slot} className="flex items-center gap-3 px-4 py-3 text-muted-foreground/70">
              <span className="flex size-7 shrink-0 items-center justify-center">
                <span className="size-2.5 rotate-45 bg-black/15" aria-hidden="true" />
              </span>
              <p className="flex-1 text-sm font-medium">Waiting for entries</p>
              <p className="text-display text-xl font-semibold tabular-nums">00</p>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export function RankingsBoard({
  entries,
  level,
}: {
  entries: RankingsBoardEntry[];
  level: RankingsLevel;
}) {
  const inLevel = entries.filter((entry) => entry.level === level);
  const anyRanked = inLevel.some((entry) => entry.wins + entry.losses > 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Division level" className="flex gap-2">
          {(Object.keys(LEVEL_LABEL) as RankingsLevel[]).map((key) => {
            const active = key === level;
            return (
              <Link
                key={key}
                href={`/rankings?level=${key.toLowerCase()}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`border-2 border-black px-4 py-2 text-xs font-semibold uppercase tracking-wider shadow-[3px_3px_0_0_#000] transition-colors ${
                  active ? "bg-brand-red text-white" : "bg-white hover:bg-brand-red/10"
                }`}
              >
                {LEVEL_LABEL[key]}
              </Link>
            );
          })}
        </nav>
        <p className="bg-white/80 px-2 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {anyRanked ? "Ranked by points" : "Ranks start when matches are decided"}
        </p>
      </div>

      <div className="mt-8 space-y-10">
        {GROUPS.map((group) => (
          <section key={group.gender} aria-label={`${group.title} divisions`}>
            <h2 className="text-display mb-4 text-3xl font-semibold uppercase tracking-wide">
              {group.title}
              <span className="ml-3 text-base text-brand-red">{LEVEL_LABEL[level]}</span>
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.bands.map((band) => (
                <DivisionCard
                  key={band.weightBand}
                  title={`${group.title} · ${LEVEL_LABEL[level]}`}
                  label={band.label}
                  entries={inLevel.filter(
                    (entry) => entry.gender === group.gender && entry.weightBand === band.weightBand
                  )}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
