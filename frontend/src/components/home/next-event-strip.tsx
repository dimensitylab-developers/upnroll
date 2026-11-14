import Link from "next/link";

type NextEvent = {
  slug: string;
  startDate: Date | string;
} | null;

function formatEventDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function NextEventStrip({ event }: { event: NextEvent }) {
  if (!event) return null;

  return (
    <section className="border-b-2 border-black bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-sm sm:text-base">
          <span className="font-semibold uppercase tracking-[0.16em] text-brand-red">Next event</span>{" "}
          <span className="font-semibold">{formatEventDate(event.startDate)}</span>
        </p>
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex min-h-10 items-center border-2 border-black bg-brand-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-[4px_4px_0_0_#000]"
        >
          Register now
        </Link>
      </div>
    </section>
  );
}
