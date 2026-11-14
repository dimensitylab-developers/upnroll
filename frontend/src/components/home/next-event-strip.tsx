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
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">Next event</span>
          <span className="text-display text-xl font-semibold sm:text-2xl">{NEXT_EVENT_LABEL}</span>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center justify-center border-2 border-black bg-brand-red px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] sm:ml-auto"
        >
          Register
        </Link>
      </div>
    </section>
  );
}
