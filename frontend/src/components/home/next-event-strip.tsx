import Link from "next/link";

/** Locked client date for the next open card. */
const NEXT_EVENT_LABEL = "23 January 2027";

type NextEvent = {
  slug: string;
} | null;

export function NextEventStrip({ event }: { event: NextEvent }) {
  const href = event ? `/events/${event.slug}` : "/events";

  return (
    <section className="border-b-2 border-black bg-[#f7f6f4]">
      <div className="mx-auto flex max-w-6xl flex-col items-stretch gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">Next event</span>
          <span className="text-display text-xl font-semibold sm:text-2xl">{NEXT_EVENT_LABEL}</span>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 w-full items-center justify-center border-2 border-black bg-brand-red px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] sm:w-auto"
        >
          Register
        </Link>
      </div>
    </section>
  );
}
