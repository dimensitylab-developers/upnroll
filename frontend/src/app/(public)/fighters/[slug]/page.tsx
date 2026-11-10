import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublicFighterBySlug } from "@/server/services/fighterService";
import { athleteInitials, getHeldCardAthleteBySlug } from "@/data/held-card-athletes";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { NotFoundError } from "@/server/http/errors";
import { MatEmojis } from "@/components/home/mat-emojis";
import { PageBackLink } from "@/components/layout/page-back-link";

export default async function PublicFighterProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  // cacheComponents: DB/mongoose touches current time; opt into request time first.
  await connection();
  const { slug } = await params;
  const held = getHeldCardAthleteBySlug(slug);

  let live: Awaited<ReturnType<typeof getPublicFighterBySlug>> | null = null;
  try {
    live = await getPublicFighterBySlug(slug);
  } catch (err) {
    if (!(err instanceof NotFoundError)) throw err;
  }

  if (!live && !held) notFound();

  const displayName = live?.profile.displayName ?? held!.displayName;
  const gym = live?.profile.gym || held?.gym || "Independent";
  const discipline = live?.profile.discipline || held?.divisions[0] || null;
  const record = live?.record ?? { wins: 0, losses: 0 };
  const history = live?.history ?? [];

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-10 sm:py-16">
      <MatEmojis className="pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-2xl">
        <PageBackLink href="/rankings" label="Back to rankings" />

        <div className="border-2 border-black bg-white p-5 shadow-[8px_8px_0_0_#000] sm:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <div
              className={`flex size-20 shrink-0 items-center justify-center border-2 border-black text-xl font-semibold ${
                held?.featured ? "bg-brand-red text-white" : "bg-neutral-100"
              }`}
              aria-hidden="true"
            >
              {athleteInitials(displayName)}
            </div>
            <div className="min-w-0 flex-1">
              {held?.featured && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">
                  {held.houseLabel ?? "Up 'n Roll"}
                </p>
              )}
              <h1 className="text-display text-3xl font-semibold sm:text-4xl">{displayName}</h1>
              <p className="mt-1 text-muted-foreground">
                {gym}
                {discipline ? ` · ${discipline}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {record.wins}-{record.losses}
                </Badge>
                {held && <Badge variant="outline">{held.event}</Badge>}
                {!live && <Badge variant="outline">Photo coming</Badge>}
              </div>
            </div>
          </div>

          {held && (
            <dl className="mt-6 grid gap-2 border-t-2 border-dashed border-black pt-4 text-sm sm:grid-cols-2">
              {held.age != null && (
                <>
                  <dt className="font-semibold">Age</dt>
                  <dd>{held.age}</dd>
                </>
              )}
              {held.gender && (
                <>
                  <dt className="font-semibold">Gender</dt>
                  <dd>{held.gender}</dd>
                </>
              )}
              {(held.city || held.state) && (
                <>
                  <dt className="font-semibold">From</dt>
                  <dd>{[held.city, held.state].filter(Boolean).join(", ")}</dd>
                </>
              )}
              {held.coach && (
                <>
                  <dt className="font-semibold">Coach</dt>
                  <dd>{held.coach}</dd>
                </>
              )}
              {held.weights.length > 0 && (
                <>
                  <dt className="font-semibold">Weight</dt>
                  <dd>{held.weights.join(" · ")}</dd>
                </>
              )}
              {held.divisions.length > 0 && (
                <>
                  <dt className="font-semibold">Division</dt>
                  <dd>{held.divisions.join(" · ")}</dd>
                </>
              )}
              {held.instagram && (
                <>
                  <dt className="font-semibold">Instagram</dt>
                  <dd>
                    <a
                      href={`https://www.instagram.com/${held.instagram}/`}
                      className="underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{held.instagram}
                    </a>
                  </dd>
                </>
              )}
            </dl>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Photographs will sit in the open square once we have them. After registration is live in production, confirmed accounts keep this profile updated from the form.
          </p>
        </div>

        <h2 className="mt-10 text-display text-xl font-semibold">Match history</h2>
        <div className="mt-3 border-2 border-black bg-white shadow-[5px_5px_0_0_#000]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Opponent(s)</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((m) => (
                <TableRow key={String(m._id)}>
                  <TableCell>{m.event?.name ?? "Unknown"}</TableCell>
                  <TableCell>
                    {m.competitorAName} vs {m.competitorBName}
                  </TableCell>
                  <TableCell>{m.winnerName ? `${m.winnerName} — ${m.resultMethod}` : "—"}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    No completed matches published yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {held?.eventSlug && (
          <p className="mt-6 text-sm">
            <Link href={`/events/held/${held.eventSlug}`} className="bg-white px-1 underline">
              Held card record
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
