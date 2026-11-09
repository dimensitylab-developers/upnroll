import Link from "next/link";

export type HeldPhoto = { src: string; alt: string };
export type HeldVideo = { src: string; caption: string };
export type HeldWinner = { name: string; division: string; photo: string | null };
export type HeldRanking = { name: string; note: string };

export type HeldRecordData = {
  name: string;
  date: string;
  summary: string;
  photos: HeldPhoto[];
  videos: HeldVideo[];
  winners: HeldWinner[];
  divisions: { name: string; detail: string }[];
  rounds: { label: string; detail: string }[];
  scoringNote: string;
  scoring: { name: string; points: string }[];
  rules: { title: string; lines: string[] }[];
  bracket: string;
  bracketHref: string | null;
  rankingsNote: string;
  rankings: HeldRanking[];
  ending: string[];
  endingNote: string;
};

const SECTIONS = [
  ["photos", "Photographs"],
  ["video", "Video"],
  ["winner", "Winner"],
  ["rounds", "The rounds"],
  ["bracket", "The bracket"],
  ["rankings", "Rankings"],
  ["ending", "How it ended"],
] as const;

function Empty({ children }: { children: string }) {
  return <p className="border border-black/15 bg-white px-4 py-6 text-sm leading-relaxed">{children}</p>;
}

function Heading({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-display scroll-mt-24 text-3xl font-semibold">
      {children}
    </h2>
  );
}

export function HeldRecord({ record }: { record: HeldRecordData }) {
  return (
    <article>
      <header className="border-2 border-black bg-black px-6 py-8 text-white shadow-[8px_8px_0_0_#000] sm:px-10 sm:py-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Held</p>
        <p className="text-display mt-4 text-2xl font-semibold sm:text-3xl">{record.date}</p>
        <h1 className="text-display mt-2 max-w-3xl text-4xl font-semibold leading-[0.95] sm:text-6xl">{record.name}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">{record.summary}</p>
      </header>

      <div className="mt-10 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="Record" className="mb-8 flex flex-wrap gap-x-4 gap-y-2 lg:sticky lg:top-24 lg:mb-0 lg:block lg:space-y-2">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block text-sm hover:text-brand-red">
              {label}
            </a>
          ))}
        </nav>

        <div className="space-y-14">
          <section>
            <Heading id="photos">Photographs</Heading>
            {record.photos.length > 0 ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {record.photos.map((photo) => (
                  <li key={photo.src} className="border-2 border-black bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src} alt={photo.alt} className="h-auto w-full" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <Empty>Photographs from this card have not been posted yet. The next card can add them here.</Empty>
              </div>
            )}
          </section>

          <section>
            <Heading id="video">Video</Heading>
            {record.videos.length > 0 ? (
              <ul className="mt-4 space-y-4">
                {record.videos.map((video) => (
                  <li key={video.src}>
                    <video controls preload="metadata" className="w-full max-w-xs border-2 border-black bg-black" src={video.src} />
                    <p className="mt-2 text-sm">{video.caption}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <Empty>No video has been posted for this card yet.</Empty>
              </div>
            )}
          </section>

          <section>
            <Heading id="winner">Winner</Heading>
            {record.winners.length > 0 ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {record.winners.map((winner) => (
                  <li key={`${winner.division}-${winner.name}`} className="flex gap-4 border-2 border-black bg-white p-4">
                    <div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center border-2 border-black bg-[#f7f6f4]">
                      {winner.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={winner.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="px-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">No photograph</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">{winner.division}</p>
                      <p className="text-display mt-1 text-2xl font-semibold">{winner.name}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <Empty>The winner has not been posted for this card, and neither has a winner’s photograph.</Empty>
              </div>
            )}
          </section>

          <section>
            <Heading id="rounds">The rounds</Heading>
            {record.divisions.length > 0 && (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {record.divisions.map((division) => (
                  <li key={division.name} className="border-t-2 border-black pt-3">
                    <p className="font-semibold">{division.name}</p>
                    <p className="mt-1 text-sm">{division.detail}</p>
                  </li>
                ))}
              </ul>
            )}
            <dl className="mt-6 max-w-2xl divide-y divide-black/10 border-y border-black/10">
              {record.rounds.map((round) => (
                <div key={round.label} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-6">
                  <dt className="text-display font-semibold text-brand-red">{round.label}</dt>
                  <dd className="text-sm">{round.detail}</dd>
                </div>
              ))}
            </dl>
            {record.scoring.length > 0 && (
              <div className="mt-6">
                <p className="text-sm leading-relaxed">{record.scoringNote}</p>
                <dl className="mt-3 grid max-w-2xl gap-x-10 sm:grid-cols-2">
                  {record.scoring.map((item) => (
                    <div key={item.name} className="flex items-baseline justify-between border-b border-black/10 py-2">
                      <dt className="text-sm">{item.name}</dt>
                      <dd className="text-display font-semibold text-brand-red">{item.points}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {record.rules.length > 0 && (
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                {record.rules.map((rule) => (
                  <div key={rule.title}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-red">{rule.title}</p>
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {rule.lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <Heading id="bracket">The bracket</Heading>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed">{record.bracket}</p>
            {record.bracketHref && (
              <Link href={record.bracketHref} className="mt-4 inline-block text-sm font-semibold text-brand-red">
                Open the bracket
              </Link>
            )}
          </section>

          <section>
            <Heading id="rankings">Rankings</Heading>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed">{record.rankingsNote}</p>
            {record.rankings.length > 0 && (
              <ol className="mt-4 max-w-2xl divide-y divide-black/10 border-y border-black/10">
                {record.rankings.map((row, index) => (
                  <li key={`${row.name}-${index}`} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="font-semibold">{row.name}</span>
                    <span className="text-sm text-muted-foreground">{row.note}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <Heading id="ending">How it ended</Heading>
            <ul className="mt-4 max-w-2xl space-y-1.5 text-sm">
              {record.ending.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed">{record.endingNote}</p>
          </section>
        </div>
      </div>
    </article>
  );
}
