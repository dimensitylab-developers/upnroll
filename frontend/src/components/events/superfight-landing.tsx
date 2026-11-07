import Image from "next/image";
import Link from "next/link";
import { SectionBanner } from "@/components/home/section-banner";

export type SuperfightDivision = {
  id: string;
  name: string;
  discipline: string;
  capacity: number;
};

const BANNER = "/banners/up-n-roll-no-gi-2.jpg";

const DOORS = [
  {
    title: "Brackets",
    path: "brackets",
    body: "Every round from the first fight to the final.",
  },
  {
    title: "Schedule",
    path: "schedule",
    body: "When you are called, and which mat you step on.",
  },
  {
    title: "Results",
    path: "results",
    body: "Who won — once the bout is over.",
  },
] as const;

export function SuperfightLanding({
  slug,
  name,
  dateLabel,
  weekdayLabel,
  venue,
  status,
  canRegister,
  registerUntil,
  matCount,
  divisions,
}: {
  slug: string;
  name: string;
  dateLabel: string;
  weekdayLabel: string;
  venue: string;
  status: string;
  canRegister: boolean;
  registerUntil: string | null;
  matCount: number;
  divisions: SuperfightDivision[];
}) {
  const place = venue || "Mumbai";
  const mats = matCount === 1 ? "1 mat" : `${matCount} mats`;

  return (
    <main className="min-h-screen bg-[#f2eee6]">
      {/* Banner hero — full pitch for #2 */}
      <section className="relative overflow-hidden border-b-2 border-black bg-black">
        <div className="relative mx-auto max-w-6xl">
          <div className="relative aspect-[3/4] w-full sm:aspect-[4/5] md:aspect-[16/10] lg:aspect-[21/9]">
            <Image
              src={BANNER}
              alt={`${name} — No-Gi #2 banner`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:via-black/10" />
          </div>

          {/* Banner footer strip */}
          <div className="relative z-10 -mt-2 grid gap-3 border-t-2 border-black bg-black px-4 py-5 text-white sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:px-8 sm:py-6">
            <div className="-rotate-2 border-2 border-black bg-brand-red px-4 py-3 text-center shadow-[4px_4px_0_0_#fff]">
              <p className="text-display text-4xl font-semibold leading-none">#2</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]">Match</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">Up &apos;n Roll · No-Gi</p>
              <h1 className="text-display mt-1 text-3xl font-semibold leading-[0.95] sm:text-5xl">{name}</h1>
              <p className="mt-2 text-sm text-white/80">Road to Super Fight · Grapplers only</p>
            </div>
            <div className="sm:text-right">
              <p className="text-display text-2xl font-semibold sm:text-3xl">{dateLabel}</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-brand-red">{weekdayLabel}</p>
              <p className="mt-2 text-sm">
                <span className="text-brand-red">Venue</span> {place}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm">
          <Link href="/events" className="font-semibold text-brand-red underline">
            ← All events
          </Link>
        </p>

        {/* Pitch + CTA */}
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] sm:p-8">
            <p className="-rotate-1 inline-block border-2 border-black bg-brand-red px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[3px_3px_0_0_#000]">
              Grapplers only · No-Gi
            </p>
            <h2 className="text-display mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              The second card. Same house. Harder night.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed">
              Up &apos;n Roll Superfight Series hits Mumbai on {dateLabel}. Rashguard and shorts on the mat. Brackets, call times, and results stay public once the card is live.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Status: {status.replaceAll("_", " ").toLowerCase()}
              {registerUntil ? ` · registration closes ${registerUntil}` : ""}
              {" · "}
              {mats} on the floor
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {canRegister && (
                <Link
                  href="/register"
                  className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#000]"
                >
                  <span className="inline-block skew-x-12">Register to compete</span>
                </Link>
              )}
              <Link
                href={`/events/${slug}/brackets`}
                className="inline-flex border-2 border-black bg-black px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#c8102e]"
              >
                Open brackets
              </Link>
            </div>
          </div>

          <aside className="border-2 border-black bg-black p-6 text-white shadow-[8px_8px_0_0_#c8102e] sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Card facts</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-white/50">Number</dt>
                <dd className="text-display text-2xl font-semibold">#2 Match</dd>
              </div>
              <div>
                <dt className="text-white/50">Date</dt>
                <dd className="font-semibold">
                  {dateLabel} · {weekdayLabel}
                </dd>
              </div>
              <div>
                <dt className="text-white/50">Venue</dt>
                <dd className="font-semibold">{place}</dd>
              </div>
              <div>
                <dt className="text-white/50">Format</dt>
                <dd className="font-semibold">No-Gi · Road to Super Fight</dd>
              </div>
            </dl>
          </aside>
        </section>

        {/* Doors */}
        <section>
          <SectionBanner>Follow the card</SectionBanner>
          <ul className="grid gap-3 sm:grid-cols-3">
            {DOORS.map((door) => (
              <li key={door.path}>
                <Link
                  href={`/events/${slug}/${door.path}`}
                  className="block h-full border-2 border-black bg-white p-5 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#c8102e]"
                >
                  <p className="text-display text-2xl font-semibold">{door.title}</p>
                  <p className="mt-2 text-sm leading-relaxed">{door.body}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-red">Open →</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Divisions */}
        <section>
          <SectionBanner>Divisions</SectionBanner>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed">
            No-Gi groups for the Mumbai card. Organizers may merge a small division.
          </p>
          {divisions.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {divisions.map((division) => (
                <li key={division.id} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
                  <p className="font-semibold">{division.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {division.discipline} · {division.capacity} spots
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Divisions will list here when they are set.</p>
          )}
        </section>

        <section className="border-2 border-black bg-black px-6 py-8 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">On the night</p>
          <p className="text-display mt-3 max-w-2xl text-3xl font-semibold leading-tight">
            Enter. Get a division. Hit your mat. Get called. Leave a result.
          </p>
          <p className="mt-4 max-w-xl text-sm text-white/75">
            Full step-by-step for how a fight runs sits on the{" "}
            <Link href="/events" className="underline text-brand-red">
              events page
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
