import Image from "next/image";
import Link from "next/link";
import { EVENT_POINTS_RULES } from "@/server/services/divisionTaxonomy";

const BANNER = "/banners/up-n-roll-no-gi-2.jpg";
const RULES = EVENT_POINTS_RULES;

function mapsUrl(venue: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;
}

function CheckIcon() {
  return (
    <span
      className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white"
      aria-hidden="true"
    >
      ✓
    </span>
  );
}

function CrossIcon() {
  return (
    <span
      className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white"
      aria-hidden="true"
    >
      ✕
    </span>
  );
}

function RuleList({
  title,
  items,
  tone,
}: {
  title: string;
  items: readonly string[];
  tone: "ok" | "no";
}) {
  return (
    <div>
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
          tone === "ok" ? "text-emerald-700" : "text-brand-red"
        }`}
      >
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-snug text-black/85">
            {tone === "ok" ? <CheckIcon /> : <CrossIcon />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SuperfightLanding({
  eventId,
  slug,
  dateLabel,
  weekdayLabel,
  venue,
  status,
  canRegister,
  registerUntil,
}: {
  eventId: string;
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/90" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-12">
        <Link
          href="/events"
          className="inline-flex min-h-11 w-fit flex-row flex-nowrap items-center gap-2 border-2 border-white bg-black px-3 py-2 text-sm font-semibold text-white shadow-[4px_4px_0_0_#c8102e] transition-colors hover:border-brand-red hover:bg-brand-red"
        >
          <span aria-hidden="true">←</span>
          <span className="whitespace-nowrap">Back to events</span>
        </Link>

        <section className="mt-7 max-w-2xl sm:mt-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-red">
            Up &apos;n Roll
          </p>
          <h1 className="text-display mt-3 text-4xl font-semibold italic leading-[0.92] tracking-tight sm:text-5xl lg:text-6xl">
            No-Gi Tournament
          </h1>

          <div className="mt-6 grid gap-3 border-2 border-white/25 bg-black/55 p-4 backdrop-blur-sm sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/25 sm:p-0">
            <div className="sm:px-4 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Date</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide">{dateLabel}</p>
              <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-white/55">{weekdayLabel}</p>
            </div>
            <div className="sm:px-4 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Location</p>
              <a
                href={mapsUrl(place)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-sm font-semibold uppercase tracking-wide underline decoration-brand-red decoration-2 underline-offset-4 transition-colors hover:text-brand-red"
              >
                {place}
              </a>
            </div>
            <div className="sm:px-4 sm:py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Event format</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide">{RULES.eventFormat}</p>
            </div>
          </div>

          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/50">
            {status.replaceAll("_", " ").toLowerCase()}
            {registerUntil ? ` · closes ${registerUntil}` : ""}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {canRegister && (
              <Link
                href={`/grappler/registrations/new?event=${encodeURIComponent(eventId)}`}
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

        {/* Rules board — poster layout on cream */}
        <section className="mt-10 space-y-4 text-black sm:mt-12 sm:space-y-5">
          <div className="overflow-hidden border-2 border-black bg-[#f3efe8] shadow-[10px_10px_0_0_#c8102e]">
            <div className="bg-brand-red px-5 py-4 text-center sm:px-8">
              <p className="text-display text-2xl font-semibold italic uppercase tracking-tight text-white sm:text-3xl">
                No-Gi Tournament
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">
                Rules &amp; format
              </p>
            </div>

            {/* Divisions + match format */}
            <div className="grid gap-0 border-b-2 border-black lg:grid-cols-2">
              <div className="border-b-2 border-black p-5 sm:p-6 lg:border-b-0 lg:border-r-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">
                  {RULES.divisions.title}
                </p>
                <div className="mt-4 space-y-3">
                  <div className="border-2 border-black bg-white px-4 py-3 shadow-[3px_3px_0_0_#000]">
                    <p className="text-sm font-semibold uppercase tracking-wide">
                      {RULES.divisions.beginner.title}
                    </p>
                    <p className="mt-1 text-sm text-black/70">{RULES.divisions.beginner.detail}</p>
                  </div>
                  <div className="border-2 border-black bg-white px-4 py-3 shadow-[3px_3px_0_0_#000]">
                    <p className="text-sm font-semibold uppercase tracking-wide">
                      {RULES.divisions.advanced.title}
                    </p>
                    <p className="mt-1 text-sm text-black/70">{RULES.divisions.advanced.detail}</p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">
                  {RULES.matchFormat.title}
                </p>
                <p className="mt-3 text-base font-semibold">{RULES.matchFormat.total}</p>
                <ul className="mt-3 space-y-2">
                  {RULES.matchFormat.items.map((item) => (
                    <li
                      key={item}
                      className="border-l-4 border-brand-red bg-white px-3 py-2 text-sm leading-snug shadow-[2px_2px_0_0_#000]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Scoring */}
            <div className="border-b-2 border-black">
              <div className="bg-black px-5 py-3 sm:px-6">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white sm:text-sm">
                  {RULES.scoring.title}
                </p>
              </div>
              <ul className="grid gap-px bg-black/15 sm:grid-cols-3 lg:grid-cols-6">
                {RULES.scoring.points.map((row) => (
                  <li key={row.label} className="bg-[#f3efe8] px-3 py-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/60">
                      {row.label}
                    </p>
                    <p className="mt-1 text-display text-xl font-semibold text-brand-red">{row.detail}</p>
                    {"note" in row && row.note ? (
                      <p className="mt-1 text-[10px] leading-tight text-black/55">{row.note}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical rules: beginner | advanced */}
            <div className="grid gap-0 border-b-2 border-black lg:grid-cols-2">
              <div className="border-b-2 border-black p-5 sm:p-6 lg:border-b-0 lg:border-r-2">
                <div className="inline-flex bg-brand-red px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  {RULES.beginner.title}
                </div>
                <p className="mt-2 text-xs text-black/60">{RULES.beginner.subtitle}</p>
                <div className="mt-4 space-y-5">
                  <RuleList title={RULES.beginner.permittedTitle} items={RULES.beginner.permitted} tone="ok" />
                  <RuleList
                    title={RULES.beginner.prohibitedTitle}
                    items={RULES.beginner.prohibited}
                    tone="no"
                  />
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="inline-flex bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  {RULES.advanced.title}
                </div>
                <p className="mt-2 text-xs text-black/60">{RULES.advanced.subtitle}</p>
                <div className="mt-4 space-y-5">
                  <RuleList title={RULES.advanced.permittedTitle} items={RULES.advanced.permitted} tone="ok" />
                  <RuleList
                    title={RULES.advanced.prohibitedTitle}
                    items={RULES.advanced.prohibited}
                    tone="no"
                  />
                </div>
              </div>
            </div>

            {/* Penalties + match outcome */}
            <div className="grid gap-0 border-b-2 border-black lg:grid-cols-2">
              <div className="border-b-2 border-black bg-black p-5 text-white sm:p-6 lg:border-b-0 lg:border-r-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                  {RULES.penalties.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {RULES.penalties.items.map((item) => (
                    <li key={item} className="flex items-start justify-between gap-3 text-sm">
                      <span>{item}</span>
                      <span className="shrink-0 rounded-sm bg-brand-red px-2 py-0.5 text-sm font-bold tabular-nums text-white">-1</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-2 border-white bg-brand-red px-4 py-3 text-sm font-semibold leading-relaxed text-white shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] sm:text-base">
                  <span aria-hidden="true" className="mr-2">⚠</span>
                  {RULES.penalties.warning}
                </p>
              </div>
              <div className="bg-white p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
                  {RULES.matchOutcome.title}
                </p>
                <p className="mt-3 text-sm font-semibold">{RULES.matchOutcome.intro}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {RULES.matchOutcome.endings.map((ending) => (
                    <li
                      key={ending}
                      className="border-2 border-black bg-[#f3efe8] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-[2px_2px_0_0_#c8102e]"
                    >
                      {ending}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-l-4 border-brand-red bg-[#f3efe8] px-3 py-2.5 text-sm leading-relaxed">
                  {RULES.matchOutcome.tiebreaker}
                </p>
              </div>
            </div>

            {/* General rules */}
            <div className="border-b-2 border-black bg-black px-5 py-5 text-white sm:px-6">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-red">
                {RULES.general.title}
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {RULES.general.items.map((item) => (
                  <li
                    key={item}
                    className="border border-white/20 bg-white/5 px-3 py-3 text-center text-xs font-semibold leading-snug sm:text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Acknowledgement */}
            <div className="border-b-2 border-black px-5 py-5 sm:px-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">
                {RULES.acknowledgement.title}
              </p>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-black/75">
                {RULES.acknowledgement.body}
              </p>
            </div>

            {/* Contact footer */}
            <div className="flex flex-col gap-3 bg-black px-5 py-4 text-sm text-white sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
              <a
                href={RULES.contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold hover:text-brand-red"
              >
                Instagram · {RULES.contact.instagram}
              </a>
              <a href={`mailto:${RULES.contact.email}`} className="self-end font-semibold hover:text-brand-red sm:self-auto">
                {RULES.contact.email}
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
