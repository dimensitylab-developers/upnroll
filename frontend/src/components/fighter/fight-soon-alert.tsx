import Link from "next/link";

export function FightSoonAlert({
  minutes = 10,
  href = "/fighter/matches",
}: {
  minutes?: number;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="fight-soon-pulse relative flex items-center gap-3 border-2 border-black bg-white px-4 py-3 shadow-[5px_5px_0_0_#c8102e]"
    >
      <span className="relative z-10 flex size-10 items-center justify-center rounded-full border-2 border-brand-red bg-brand-red/15">
        <span className="size-3 rounded-full bg-brand-red shadow-[0_0_12px_rgba(200,16,46,0.9)]" />
      </span>
      <span className="relative z-10 min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Be ready</span>
        <span className="block text-sm font-semibold">
          Your fight is about {minutes} minutes away — check your bracket and warm up.
        </span>
      </span>
    </Link>
  );
}
