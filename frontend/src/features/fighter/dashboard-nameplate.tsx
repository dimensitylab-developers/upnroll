import Link from "next/link";

type DashboardNameplateProps = {
  name: string;
  shortName: string;
  greeting: string;
  academy: string;
  beltRank?: string;
  weightDivision?: string;
  wins: number;
  losses: number;
  hasPhoto: boolean;
};

/** Athlete identity strip — weigh-in board on black. */
export function DashboardNameplate({
  name,
  shortName,
  greeting,
  academy,
  beltRank,
  weightDivision,
  wins,
  losses,
  hasPhoto,
}: DashboardNameplateProps) {
  const meta = [academy, beltRank, weightDivision].filter(Boolean).join(" · ");
  const initials = shortName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="desk-identity relative overflow-hidden border-2 border-black bg-black text-white shadow-[8px_8px_0_0_#c8102e]">
      <div className="pointer-events-none absolute inset-0 speed-lines opacity-20" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-6 top-4 text-display text-[clamp(3.5rem,14vw,7rem)] font-semibold leading-none text-white/[0.06]">
        {shortName.slice(0, 8).toUpperCase()}
      </div>

      <div className="relative grid gap-5 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-end sm:gap-6 sm:p-6 lg:p-7">
        <div className="group mx-auto h-32 w-24 shrink-0 overflow-hidden border-2 border-white bg-[#1a1a1a] transition-transform duration-200 hover:-translate-y-0.5 sm:mx-0 sm:h-40 sm:w-32">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/api/v1/grappler/photo" alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
              <span className="text-display text-3xl font-semibold text-white/30 sm:text-4xl">{initials || "UR"}</span>
              <Link
                href="/grappler/profile"
                className="pointer-events-auto text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-red underline"
              >
                Add photo
              </Link>
            </div>
          )}
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red sm:text-[11px]">
            Grappler desk
          </p>
          <p className="mt-2 text-sm text-white/55">{greeting}</p>
          <h1 className="text-display mt-1 text-[clamp(1.9rem,5.5vw,3rem)] font-semibold leading-[0.95] tracking-tight text-white">
            {name}
          </h1>
          <p className="mt-3 text-sm text-white/65">
            {meta || (
              <>
                Profile incomplete.{" "}
                <Link href="/grappler/profile" className="font-semibold text-brand-red underline">
                  Finish your profile
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="mx-auto flex flex-col items-center gap-3 sm:mx-0 sm:items-end">
          <div className="min-w-[5.5rem] border-2 border-black bg-white px-4 py-3 text-center text-black shadow-[4px_4px_0_0_#c8102e]">
            <p className="text-display text-2xl font-semibold leading-none sm:text-3xl">
              {wins}-{losses}
            </p>
            <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-black/45">Record</p>
          </div>
          <Link
            href="/grappler/registrations/new"
            className="inline-flex min-h-10 -skew-x-12 items-center border-2 border-black bg-brand-red px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[3px_3px_0_0_#fff]"
          >
            <span className="inline-block skew-x-12">Register</span>
          </Link>
        </div>
      </div>
      <div className="checker-strip h-2 border-t-2 border-white/30" aria-hidden="true" />
    </section>
  );
}
