import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublicFighterBySlug } from "@/server/services/fighterService";
import { getHeldCardAthleteBySlug } from "@/data/held-card-athletes";
import { FighterHypeCard } from "@/features/fighters/fighter-hype-card";
import { ShareFighterCardButton } from "@/features/fighters/share-fighter-card-button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { NotFoundError } from "@/server/http/errors";
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
  const card = live?.card ?? {
    displayName,
    slug,
    gym: held?.gym || "",
    academy: held?.gym || "",
    discipline: held?.divisions[0] || "",
    beltRank: "",
    weightDivision: held?.weights[0] || "",
    hasPhoto: false,
    wins: 0,
    losses: 0,
    points: 0,
    rank: null,
    featured: Boolean(held?.featured),
    houseLabel: held?.houseLabel,
  };
  const history = live?.history ?? [];

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-10 sm:py-16">
      <div className="relative mx-auto max-w-2xl">
        <PageBackLink href="/rankings" label="Back to rankings" />

        <div className="mt-4 space-y-4">
          <FighterHypeCard
            fighter={{
              ...card,
              featured: Boolean(held?.featured),
              houseLabel: held?.houseLabel ?? "Up 'n Roll",
            }}
          />
          <div className="flex flex-wrap gap-2">
            <ShareFighterCardButton slug={slug} displayName={displayName} />
            <Link
              href="/rankings"
              className="inline-flex min-h-10 items-center border-2 border-black bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] shadow-[3px_3px_0_0_#000]"
            >
              Rankings board →
            </Link>
          </div>
          <p className="copy-slab text-sm text-muted-foreground">
            Public card only — record, academy, belt, division, and photo. Personal and medical details stay private.
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
