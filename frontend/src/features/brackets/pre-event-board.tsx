import Link from "next/link";

const R1_Y = [30, 90, 150, 210];
const SEMI_Y = [60, 180];
const FINAL_Y = 120;

/** Decorative empty bracket: dashed slots joined by connector lines. */
function GhostBracket() {
  const line = "rgba(255,255,255,0.35)";
  const box = { w: 96, h: 40 };
  return (
    <svg viewBox="0 0 400 252" className="mx-auto w-full max-w-md" role="img" aria-label="Empty bracket waiting for the draw">
      {[
        ["ROUND 1", 48],
        ["SEMIS", 200],
        ["FINAL", 352],
      ].map(([label, x]) => (
        <text key={label} x={x} y={10} textAnchor="middle" fontSize="9" letterSpacing="2.5" fill="rgba(255,255,255,0.5)" fontWeight="600">
          {label}
        </text>
      ))}

      {/* connectors: round 1 to semis */}
      {[0, 1].map((i) => (
        <path
          key={`a${i}`}
          d={`M96 ${R1_Y[i * 2] + 14} H120 V${R1_Y[i * 2 + 1] + 14} H96 M120 ${SEMI_Y[i] + 14} H152`}
          fill="none"
          stroke={line}
          strokeWidth="2"
        />
      ))}
      {/* connectors: semis to final */}
      <path
        d={`M248 ${SEMI_Y[0] + 14} H272 V${SEMI_Y[1] + 14} H248 M272 ${FINAL_Y + 14} H304`}
        fill="none"
        stroke={line}
        strokeWidth="2"
      />

      {R1_Y.map((y) => (
        <g key={`r${y}`}>
          <rect x={0} y={y - 6} width={box.w} height={box.h} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="5 4" />
          <text x={48} y={y + 19} textAnchor="middle" fontSize="10" letterSpacing="2" fill="rgba(255,255,255,0.45)" fontWeight="600">
            TBD
          </text>
        </g>
      ))}
      {SEMI_Y.map((y) => (
        <g key={`s${y}`}>
          <rect x={152} y={y - 6} width={box.w} height={box.h} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="5 4" />
          <text x={200} y={y + 19} textAnchor="middle" fontSize="10" letterSpacing="2" fill="rgba(255,255,255,0.45)" fontWeight="600">
            TBD
          </text>
        </g>
      ))}
      <g>
        <rect x={304} y={FINAL_Y - 6} width={box.w} height={box.h} fill="rgba(200,16,46,0.2)" stroke="#c8102e" strokeWidth="2" strokeDasharray="5 4" />
        <text x={352} y={FINAL_Y + 19} textAnchor="middle" fontSize="10" letterSpacing="2" fill="#fff" fontWeight="700">
          CHAMPION
        </text>
      </g>
    </svg>
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
    <section className="mt-8 overflow-hidden border-2 border-black bg-black text-white shadow-[8px_8px_0_0_#c8102e]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 auth-gate-speed opacity-40" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 auth-gate-halftone opacity-20" aria-hidden="true" />
        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
          <div>
            <span className="inline-flex -skew-x-12 items-stretch shadow-[4px_4px_0_0_#c8102e]">
              <span className="w-2 bg-white" aria-hidden="true" />
              <span className="bg-brand-red px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                <span className="inline-block skew-x-12">Brackets</span>
              </span>
            </span>
            <h1 className="text-display mt-5 text-5xl font-semibold uppercase leading-[0.92] sm:text-6xl lg:text-7xl">
              Live on
              <br />
              <span className="text-brand-red">event day.</span>
            </h1>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-white">{eventName}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.18em] text-white/60">{eventDate}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={eventHref}
                className="inline-flex border-2 border-white bg-white px-4 py-2 text-sm font-semibold text-black shadow-[4px_4px_0_0_#c8102e] transition-transform hover:-translate-y-0.5"
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
      </div>

    </section>
  );
}
