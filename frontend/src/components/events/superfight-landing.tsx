import Image from "next/image";
import Link from "next/link";
import { EVENT_POINTS_RULES } from "@/server/services/divisionTaxonomy";

const BANNER = "/banners/up-n-roll-no-gi-2.jpg";
const RULES = EVENT_POINTS_RULES;

function mapsUrl(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

function EventBanner({ children }: { children: string }) {
  return (
    <h2 className="inline-flex items-stretch -skew-x-12 shadow-[5px_5px_0_0_rgba(0,0,0,0.85)]">
      <span className="w-3 bg-white" aria-hidden="true" />
      <span className="bg-brand-red px-4 py-2 text-display text-sm font-semibold uppercase tracking-wider text-white sm:text-base">
        <span className="inline-block skew-x-12">{children}</span>
      </span>
      <span className="w-7 bg-black" aria-hidden="true" />
    </h2>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="border-l-4 border-brand-red bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white sm:text-xs">
      {children}
    </p>
  );
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
    <main className="route-enter relative isolate overflow-hidden text-white">
      {/* Atmosphere only: banner photo, no second hero graphic */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <Image
          src={BANNER}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[85%_center] sm:object-[90%_18%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,#050505_0%,#050505_38%,rgba(5,5,5,0.55)_55%,rgba(5,5,5,0.15)_72%,rgba(5,5,5,0.35)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/85" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-12">
        <Link
          href="/events"
          className="inline-flex min-h-11 w-fit items-center border border-white/30 bg-black/50 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-brand-red hover:bg-brand-red"
        >
          ← Back to events
        </Link>

        <section className="mt-7 max-w-xl sm:mt-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-red">
            No-Gi · Card #2
          </p>
          <h1 className="text-display mt-3 text-4xl font-semibold leading-[0.92] tracking-tight sm:text-5xl lg:text-6xl">
            {name}
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-l-4 border-brand-red pl-4">
            <p className="text-display text-2xl font-semibold sm:text-3xl">{dateLabel}</p>
            <p className="text-sm uppercase tracking-[0.16em] text-white/65">{weekdayLabel}</p>
          </div>

          <p className="mt-4">
            <a
              href={mapsUrl(place)}
              target="_blank"
              rel="noreferrer"
              className="text-base font-semibold text-white underline decoration-brand-red decoration-2 underline-offset-4 transition-colors hover:text-brand-red"
            >
              {place}
            </a>
          </p>

          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">
            {status.replaceAll("_", " ").toLowerCase()}
            {registerUntil ? ` · closes ${registerUntil}` : ""}
          </p>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
            Create a grappler account, upload your identity proof, pick weight class and division, then pay by UPI.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {canRegister && (
              <Link
                href="/fighter/registrations/new"
                className="inline-flex -skew-x-12 border-2 border-black bg-brand-red px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[5px_5px_0_0_#fff] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_0_#fff]"
              >
                <span className="inline-block skew-x-12">Register now</span>
              </Link>
            )}
            <Link
              href={`/events/${slug}/brackets`}
              className="inline-flex border-2 border-white/80 bg-transparent px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-black"
            >
              Brackets
            </Link>
          </div>
        </section>

        {/* Full event rules board: from the posted sheet */}
        <section className="mt-10 space-y-6 sm:mt-12">
          {/* Advanced + scoring */}
          <div className="overflow-hidden border-2 border-white/20 bg-black/80 p-5 shadow-[8px_8px_0_0_rgba(200,16,46,0.55)] backdrop-blur-md sm:p-7">
            <EventBanner>{RULES.advanced.title}</EventBanner>
            <p className="mt-3 text-sm text-white/70">· {RULES.advanced.subtitle}</p>

            <div className="mt-6">
              <SectionLabel>{RULES.advanced.scoringTitle}</SectionLabel>
              <ul className="mt-4 grid gap-2 sm:grid-cols-3 sm:gap-3">
                {RULES.advanced.points.map((row) => (
                  <li
                    key={row.label}
                    className="border border-white/15 bg-white/5 px-4 py-4 text-center"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      {row.label}
                    </p>
                    <p className="mt-2 text-display text-2xl font-semibold text-brand-red">{row.detail}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-white/55 sm:text-sm">{RULES.note}</p>
            </div>
          </div>

          {/* Beginner: permitted / prohibited */}
          <div className="overflow-hidden border-2 border-white/20 bg-black/80 p-5 shadow-[8px_8px_0_0_rgba(200,16,46,0.55)] backdrop-blur-md sm:p-7">
            <EventBanner>{RULES.beginner.title}</EventBanner>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <SectionLabel>{RULES.beginner.permittedTitle}</SectionLabel>
                <ul className="mt-4 space-y-2">
                  {RULES.beginner.permitted.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"
                    >
                      <span className="font-semibold text-emerald-400" aria-hidden="true">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <SectionLabel>{RULES.beginner.prohibitedTitle}</SectionLabel>
                <ul className="mt-4 space-y-2">
                  {RULES.beginner.prohibited.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white"
                    >
                      <span className="font-semibold text-brand-red" aria-hidden="true">
                        ✕
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Penalties */}
          <div className="overflow-hidden border-2 border-white/20 bg-black/80 p-5 shadow-[8px_8px_0_0_rgba(200,16,46,0.55)] backdrop-blur-md sm:p-7">
            <EventBanner>{RULES.penalties.title}</EventBanner>
            <ul className="mt-5 divide-y divide-white/10 border border-white/15">
              {RULES.penalties.items.map((item) => (
                <li key={item} className="flex items-center justify-between gap-4 px-4 py-3">
                  <p className="text-sm text-white">{item}</p>
                  <p className="shrink-0 text-sm font-semibold text-brand-red">-1</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-2 border-brand-red/80 bg-brand-red/15 px-4 py-3 text-sm leading-relaxed text-white">
              {RULES.penalties.warning}
            </p>
          </div>

          {/* General + endings + acknowledgement */}
          <div className="overflow-hidden border-2 border-white/20 bg-black/80 p-5 shadow-[8px_8px_0_0_rgba(200,16,46,0.55)] backdrop-blur-md sm:p-7">
            <EventBanner>{RULES.general.title}</EventBanner>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {RULES.general.items.map((item) => (
                <li
                  key={item}
                  className="border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-white/15 pt-8">
              <EventBanner>How a match can end</EventBanner>
              <ul className="mt-5 flex flex-wrap gap-2">
                {RULES.endings.map((ending) => (
                  <li
                    key={ending}
                    className="border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-black shadow-[3px_3px_0_0_#c8102e]"
                  >
                    {ending}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-white/15 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">
                {RULES.acknowledgement.title}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                {RULES.acknowledgement.body}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
