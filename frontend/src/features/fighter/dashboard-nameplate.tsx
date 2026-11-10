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
  sheetPercent: number;
  hasPhoto: boolean;
  sheetReady: boolean;
};

/** Athlete identity strip — clean weigh-in board energy, not a toy header. */
export function DashboardNameplate({
  name,
  shortName,
  greeting,
  academy,
  beltRank,
  weightDivision,
  wins,
  losses,
  sheetPercent,
  hasPhoto,
  sheetReady,
}: DashboardNameplateProps) {
  const meta = [academy, beltRank, weightDivision].filter(Boolean).join(" · ");
  const initials = shortName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="desk-identity relative overflow-hidden border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-brand-red" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 speed-lines opacity-25" aria-hidden="true" />

      <div className="relative grid gap-5 p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 sm:p-5 lg:p-6">
        <div className="mx-auto h-28 w-24 shrink-0 overflow-hidden border-2 border-black bg-[#f3efe8] sm:mx-0 sm:h-36 sm:w-28">
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/api/v1/fighter/photo" alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1">
              <span className="text-display text-3xl font-semibold text-black/25 sm:text-4xl">{initials || "UR"}</span>
              <Link href="/fighter/profile" className="pointer-events-auto text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-red underline">
                Add photo
              </Link>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground sm:text-sm">{greeting}</p>
          <h1 className="text-display mt-1 text-[clamp(1.85rem,5vw,2.75rem)] font-semibold leading-[0.95] tracking-tight text-black">
            {name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {meta || (
              <>
                Sheet incomplete.{" "}
                <Link href="/fighter/profile" className="font-semibold text-brand-red underline">
                  Finish your profile
                </Link>
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-stretch gap-2 sm:gap-3">
            <div className="min-w-[4.5rem] border-2 border-black bg-[#f7f4ef] px-3 py-2">
              <p className="text-display text-xl font-semibold leading-none">{wins}-{losses}</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/45">Record</p>
            </div>
            <div className="min-w-[4.5rem] border-2 border-black bg-[#f7f4ef] px-3 py-2">
              <p className="text-display text-xl font-semibold leading-none">{sheetPercent}%</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-black/45">Sheet</p>
            </div>
            <div
              className={`flex min-w-[5.5rem] items-center border-2 border-black px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                sheetReady ? "bg-black text-white" : "bg-brand-red text-white"
              }`}
            >
              {sheetReady ? "Card ready" : "Sheet open"}
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-black/15 pt-4 text-xs font-semibold uppercase tracking-[0.14em]">
            <Link href="/" className="text-brand-red hover:underline">
              Main site →
            </Link>
            <Link href="/fighter/profile" className="text-black hover:text-brand-red">
              Profile
            </Link>
            <Link href="/fighter/registrations/new" className="text-black hover:text-brand-red">
              Register
            </Link>
            <Link href="/fighter/registrations" className="text-black hover:text-brand-red">
              Payments
            </Link>
            <Link href="/fighter/matches" className="text-black hover:text-brand-red">
              Matches
            </Link>
            <Link href="/fighter/requests" className="text-black hover:text-brand-red">
              Requests
            </Link>
          </nav>
        </div>
      </div>
      <div className="checker-strip h-2 border-t-2 border-black" aria-hidden="true" />
    </section>
  );
}
