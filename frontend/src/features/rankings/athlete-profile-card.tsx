import Link from "next/link";
import { athleteInitials, type HeldCardAthlete } from "@/data/held-card-athletes";

export function AthleteProfileCard({
  athlete,
  href,
  boardLine,
}: {
  athlete: Pick<HeldCardAthlete, "displayName" | "gym" | "city" | "state" | "weights" | "divisions" | "featured" | "houseLabel" | "instagram"> & {
    slug: string;
  };
  href: string;
  boardLine?: string | null;
}) {
  const weight = athlete.weights?.[0] ?? null;
  const division = athlete.divisions?.[0] ?? null;
  const place = [athlete.city, athlete.state].filter(Boolean).join(", ");

  return (
    <Link
      href={href}
      className={`block h-full border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#000] ${
        athlete.featured ? "ring-2 ring-brand-red ring-offset-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Photo slot — empty until photographs land. */}
        <div
          className={`flex size-14 shrink-0 items-center justify-center border-2 border-black text-sm font-semibold ${
            athlete.featured ? "bg-brand-red text-white" : "bg-neutral-100 text-black"
          }`}
          aria-hidden="true"
        >
          {athleteInitials(athlete.displayName)}
        </div>
        <div className="min-w-0 flex-1">
          {athlete.featured && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">
              {athlete.houseLabel ?? "Up 'n Roll"}
            </p>
          )}
          <p className="text-lg font-semibold leading-tight">{athlete.displayName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {athlete.gym || "Independent"}
            {place ? ` · ${place}` : ""}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid gap-1 text-xs sm:text-sm">
        {division && (
          <div className="flex gap-2">
            <dt className="font-semibold">Division</dt>
            <dd>{division}</dd>
          </div>
        )}
        {weight && (
          <div className="flex gap-2">
            <dt className="font-semibold">Weight</dt>
            <dd>{weight}</dd>
          </div>
        )}
        {athlete.instagram && (
          <div className="flex gap-2">
            <dt className="font-semibold">IG</dt>
            <dd>@{athlete.instagram}</dd>
          </div>
        )}
      </dl>

      {boardLine ? (
        <p className="mt-3 text-sm font-semibold">{boardLine}</p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Photo coming · profile from the held card</p>
      )}
    </Link>
  );
}
