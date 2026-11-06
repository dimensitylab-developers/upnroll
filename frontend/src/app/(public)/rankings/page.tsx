import type { Metadata } from "next";
import Link from "next/link";
import { cachedPublicRankings } from "@/lib/public-reads";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";


export const metadata: Metadata = { title: "Rankings" };

export default async function PublicRankingsPage() {
  const rankings = await cachedPublicRankings();

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-2">Rankings</h1>
        <p className="text-sm text-muted-foreground mb-3">
          Points formula is a placeholder (3 per win) pending an approved ranking methodology — not official.
        </p>
        <p className="text-sm mb-8">
          <Link href="/rankings/demo" className="underline">See how seeding works</Link>
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Fighter</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((r) => (
              <TableRow key={r.slug ?? r.rank}>
                <TableCell>#{r.rank}</TableCell>
                <TableCell>
                  {r.slug ? <Link href={`/fighters/${r.slug}`} className="underline">{r.displayName}</Link> : r.displayName}
                </TableCell>
                <TableCell>{r.wins}-{r.losses}</TableCell>
                <TableCell>{r.points}</TableCell>
              </TableRow>
            ))}
            {rankings.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No rankings published yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
