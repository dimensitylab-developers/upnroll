import Link from "next/link";

const COLUMNS = [
  { label: "Round 1", slots: 4 },
  { label: "Semis", slots: 2 },
  { label: "Final", slots: 1 },
];

const PROMISES = [
  { n: "01", title: "The draw", body: "Every division's bracket is published here." },
  { n: "02", title: "On the mat", body: "See who is called up next, as it happens." },
  { n: "03", title: "The result", body: "Winners move up the bracket the moment a match ends." },
];

function GhostBracket() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-5" aria-hidden="true">
      {COLUMNS.map((column, columnIndex) => (
        <div key={column.label} className="flex flex-col">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
            {column.label}
          </p>
          <div className="flex flex-1 flex-col justify-around gap-3">
            {Array.from({ length: column.slots }).map((_, slot) => (
              <div
                key={slot}
                className={`relative border-2 border-dashed px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] sm:py-4 sm:text-xs ${
                  columnIndex === 2
                    ? "border-brand-red bg-brand-red/15 text-white"
                    : "border-white/30 text-white/45"
                }`}
              >
                {columnIndex === 2 ? "Champion" : "TBD"}
                {columnIndex < 2 ? (
                  <span className="absolute -right-3 top-1/2 hidden h-0.5 w-3 bg-white/25 sm:-right-5 sm:block sm:w-5" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shown before any bracket is published, so the page keeps its energy until event day. */
export function PreEventBoard({
  eventName,
  eventDate,
  eventHref,
}: {
  eventName: string;
  eventDate: string;
  eventHref: string;
}) {
  return (
    <div className="mt-6 space-y-8">
      <section className="relative overflow-hidden border-2 border-black bg-black text-white shadow-[8px_8px_0_0_#c8102e]">
        <div className="pointer-events-none absolute inset-0 auth-gate-speed opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 auth-gate-halftone opacity-25" aria-hidden="true" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex -skew-x-12 items-stretch shadow-[4px_4px_0_0_#c8102e]">
              <span className="w-2 bg-white" aria-hidden="true" />
              <span className="bg-brand-red px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <span className="live-pulse mr-2 inline-block size-1.5 rounded-full bg-white align-middle" />
                <span className="inline-block skew-x-12">Coming on event day</span>
              </span>
            </span>
            <h2 className="text-display mt-6 text-4xl font-semibold uppercase leading-[0.95] sm:text-6xl">
              It will be live
              <br />
              on the event day.
            </h2>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
              {eventName} · {eventDate}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={eventHref}
                className="inline-flex border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black shadow-[4px_4px_0_0_#c8102e] transition-colors active:bg-brand-red/10"
              >
                Event page
              </Link>
              <Link
                href="/rankings"
                className="inline-flex border-2 border-white px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
              >
                Rankings
              </Link>
            </div>
          </div>
          <GhostBracket />
        </div>
      </section>

      <ol className="grid gap-3 sm:grid-cols-3">
        {PROMISES.map((item) => (
          <li key={item.n} className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
            <p className="text-display text-3xl font-semibold leading-none text-brand-red">{item.n}</p>
            <h3 className="mt-3 text-display text-xl font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed">{item.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
