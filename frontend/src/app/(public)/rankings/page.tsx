import Link from "next/link";
import { listPublicRankings } from "@/server/services/rankingService";
import { listPublicFighters } from "@/server/services/fighterService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { EmojiStrip, MatEmojis } from "@/components/home/mat-emojis";
import { SectionBanner } from "@/components/home/section-banner";

export const dynamic = "force-dynamic";

const MEDALS = ["Gold", "Silver", "Bronze"];

export default async function PublicRankingsPage() {
  const [rankings, fighters] = await Promise.all([listPublicRankings(), listPublicFighters()]);
  const rankingBySlug = new Map(rankings.filter((row) => row.slug).map((row) => [row.slug!, row]));

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-16">
      <MatEmojis className="absolute inset-0" />
      <div className="relative mx-auto max-w-4xl">
        <EmojiStrip items={["🏆", "🥇", "🥈", "🥉", "🥋", "💪"]} />
        <h1 className="mt-4 text-display text-4xl font-semibold">Rankings</h1>
        <p className="mt-2 max-w-2xl bg-white px-2 py-1 text-sm">
          3 points per win. Medal places are gold, silver, and bronze. Super fights are placed by the judges. Grappler profiles live here too.
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
                      No rankings published yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-14">
          <SectionBanner>Grappler profiles</SectionBanner>
          <p className="mb-4 max-w-2xl bg-white px-2 py-1 text-sm">
            Every public fighter profile sits with the rankings. Open a card for the gym, the record, and the match history.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {fighters.map((fighter) => {
              const board = rankingBySlug.get(fighter.slug);
              return (
                <li key={String(fighter._id)}>
                  <Link
                    href={`/fighters/${fighter.slug}`}
                    className="block h-full border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_#000] transition-transform hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_#000]"
                  >
                    <p className="text-lg font-semibold">🤼 {fighter.displayName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {fighter.gym || "Independent"}
                      {fighter.discipline ? ` · ${fighter.discipline}` : ""}
                    </p>
                    {board ? (
                      <p className="mt-3 text-sm font-semibold">
                        {MEDALS[board.rank - 1] ?? `#${board.rank}`} · {board.wins}-{board.losses} · {board.points} pts
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">No published points yet.</p>
                    )}
                  </Link>
                </li>
              );
            })}
            {fighters.length === 0 && <li className="text-sm text-muted-foreground">No grappler profiles yet.</li>}
          </ul>
        </section>
      </div>
    </main>
  );
}
