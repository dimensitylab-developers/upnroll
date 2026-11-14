import Image from "next/image";
import Link from "next/link";
import { SectionBanner } from "@/components/home/section-banner";
import { EVENT_POINTS_RULES } from "@/server/services/divisionTaxonomy";

const BANNER = "/banners/up-n-roll-no-gi-2.jpg";

function mapsUrl(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

export function SuperfightLanding({
  slug,
  name,
  dateLabel,
  weekdayLabel,
  venue,
  status,
  canRegister,
  registerUntil,
}: {
  slug: string;
  name: string;
  dateLabel: string;
  weekdayLabel: string;
  venue: string;
  status: string;
  canRegister: boolean;
  registerUntil: string | null;
  matCount?: number;
  divisions?: unknown[];
}) {
  const place = venue || "Navnit Gujarat Samaj Mumbai";

  return (
    <main className="route-enter min-h-screen bg-[#f2eee6]">
      <section className="relative overflow-hidden border-b-2 border-black bg-black">
        <div className="relative mx-auto max-w-6xl">
          <div className="relative aspect-[3/4] w-full sm:aspect-[4/5] md:aspect-[16/10] lg:aspect-[21/9]">
            <Image
              src={BANNER}
              alt={`${name} banner`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:via-black/10" />
          </div>

          <div className="relative z-10 -mt-2 flex flex-col gap-3 border-t-2 border-black bg-black px-4 py-5 text-white sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-red">Upcoming event</p>
              <h1 className="text-display mt-1 text-3xl font-semibold leading-[0.95] sm:text-5xl">{dateLabel}</h1>
              <p className="mt-2 text-sm text-white/75">{weekdayLabel}</p>
            </div>
            <div className="sm:text-right">
              <a
                href={mapsUrl(place)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-white underline decoration-brand-red underline-offset-4"
              >
                {place}
              </a>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/55">
                {status.replaceAll("_", " ").toLowerCase()}
                {registerUntil ? ` · closes ${registerUntil}` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm">
          <Link href="/events" className="inline-flex min-h-11 items-center font-semibold text-brand-red underline">
            ← Back to events
          </Link>
        </p>

        <section className="border-2 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">Register</p>
          <h2 className="text-display mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{name}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed">
            Create a grappler account, upload your Aadhaar card copy, choose a weight class / division on the registration form, then continue to UPI payment.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {canRegister && (
              <Link
                href="/fighter/registrations/new"
                className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#000]"
              >
                <span className="inline-block skew-x-12">Register now</span>
              </Link>
            )}
            <Link
              href={`/events/${slug}/brackets`}
              className="inline-flex border-2 border-black bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wider shadow-[5px_5px_0_0_#000]"
            >
              Brackets
            </Link>
          </div>
        </section>

        <section>
          <SectionBanner>Points</SectionBanner>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EVENT_POINTS_RULES.points.map((row) => (
              <li key={row.label} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
                <p className="font-semibold">{row.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.detail}</p>
              </li>
            ))}
          </ul>
          <p className="copy-slab mt-5 max-w-3xl text-sm leading-relaxed">{EVENT_POINTS_RULES.note}</p>
        </section>

        <section>
          <SectionBanner>How a match can end</SectionBanner>
          <ul className="mt-4 flex flex-wrap gap-2">
            {EVENT_POINTS_RULES.endings.map((ending) => (
              <li
                key={ending}
                className="border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[3px_3px_0_0_#000]"
              >
                {ending}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
