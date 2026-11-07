import Link from "next/link";
import { listPublicRankings } from "@/server/services/rankingService";
import { listPublicFighters } from "@/server/services/fighterService";
import { listHeldCardAthletes } from "@/data/held-card-athletes";
import { AthleteProfileCard } from "@/features/rankings/athlete-profile-card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { EmojiStrip, MatEmojis } from "@/components/home/mat-emojis";
import { SectionBanner } from "@/components/home/section-banner";

export const dynamic = "force-dynamic";

const MEDALS = ["Gold", "Silver", "Bronze"];

export default async function PublicRankingsPage() {
  const [rankings, liveFighters, roster] = await Promise.all([
    listPublicRankings(),
    listPublicFighters(),
    Promise.resolve(listHeldCardAthletes()),
  ]);
  const rankingBySlug = new Map(rankings.filter((row) => row.slug).map((row) => [row.slug!, row]));
  const liveBySlug = new Map(liveFighters.map((fighter) => [fighter.slug, fighter]));

  // Live registered profiles win; held-card roster fills the board until photos/accounts catch up.
  const profileCards = [
    ...roster.map((athlete) => {
      const live = liveBySlug.get(athlete.slug);
      return {
        key: athlete.slug,
        href: `/fighters/${athlete.slug}`,
        athlete: {
          ...athlete,
          gym: live?.gym || athlete.gym,
          displayName: live?.displayName || athlete.displayName,
        },
        board: rankingBySlug.get(athlete.slug) ?? null,
      };
    }),
    ...liveFighters
      .filter((fighter) => !roster.some((athlete) => athlete.slug === fighter.slug))
      .map((fighter) => ({
        key: fighter.slug,
        href: `/fighters/${fighter.slug}`,
        athlete: {
          slug: fighter.slug,
          displayName: fighter.displayName,
          gym: fighter.gym,
          city: null,
          state: null,
          weights: [] as string[],
          divisions: fighter.discipline ? [fighter.discipline] : [],
          featured: false,
          houseLabel: undefined,
          instagram: null,
        },
        board: rankingBySlug.get(fighter.slug) ?? null,
      })),
  ].sort((a, b) => {
    if (a.athlete.featured && !b.athlete.featured) return -1;
    if (!a.athlete.featured && b.athlete.featured) return 1;
    return a.athlete.displayName.localeCompare(b.athlete.displayName);
  });

  const featured = profileCards.find((card) => card.athlete.featured) ?? null;
  const rest = profileCards.filter((card) => card !== featured);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-16">
      <MatEmojis className="absolute inset-0" />
      <div className="relative mx-auto max-w-5xl">
        <EmojiStrip emojis={["mount", "armbar", "hip-throw", "rear-naked-choke", "triangle-choke", "knee-slice"]} />
        <h1 className="mt-4 text-display text-4xl font-semibold">Rankings</h1>
        <p className="mt-2 max-w-2xl bg-white px-2 py-1 text-sm">
          3 points per win. Medal places are gold, silver, and bronze. Grappler profiles live here — photos land as we get them. After registration opens in production, every confirmed athlete appears on this board from their account.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/rankings/demo" className="bg-white px-1 underline">
            See how seeding works
          </Link>
        </p>

        <section className="mt-10">
          <SectionBanner>The board</SectionBanner>
          <div className="border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Place</TableHead>
                  <TableHead>Grappler</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((row) => (
                  <TableRow key={row.slug ?? row.rank}>
                    <TableCell>{MEDALS[row.rank - 1] ?? `#${row.rank}`}</TableCell>
                    <TableCell>
                      {row.slug ? (
                        <Link href={`/fighters/${row.slug}`} className="underline">
                          {row.displayName}
                        </Link>
                      ) : (
                        row.displayName
                      )}
                    </TableCell>
                    <TableCell>
                      {row.wins}-{row.losses}
                    </TableCell>
                    <TableCell>{row.points}</TableCell>
                  </TableRow>
                ))}
                {rankings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No live points yet. Profiles from the held card are below.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-14">
          <SectionBanner>Grappler profiles</SectionBanner>
          <p className="mb-6 max-w-2xl bg-white px-2 py-1 text-sm">
            Roster from the 12 July 2026 No-Gi card. No photographs yet — initials stand in until shots are ready. Open a card for gym, division, and weight.
          </p>

          {featured && (
            <div className="mb-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-red">House profile</p>
              <div className="max-w-xl">
                <AthleteProfileCard
                  athlete={featured.athlete}
                  href={featured.href}
                  boardLine={
                    featured.board
                      ? `${MEDALS[featured.board.rank - 1] ?? `#${featured.board.rank}`} · ${featured.board.wins}-${featured.board.losses} · ${featured.board.points} pts`
                      : "Up 'n Roll · featured on the card"
                  }
                />
              </div>
            </div>
          )}

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((card) => (
              <li key={card.key}>
                <AthleteProfileCard
                  athlete={card.athlete}
                  href={card.href}
                  boardLine={
                    card.board
                      ? `${MEDALS[card.board.rank - 1] ?? `#${card.board.rank}`} · ${card.board.wins}-${card.board.losses} · ${card.board.points} pts`
                      : null
                  }
                />
              </li>
            ))}
          </ul>
          {profileCards.length === 0 && <p className="text-sm text-muted-foreground">No grappler profiles yet.</p>}
        </section>
      </div>
    </main>
  );
}
