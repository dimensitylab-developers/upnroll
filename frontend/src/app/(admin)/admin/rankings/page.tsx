import { connection } from "next/server";
import { listPublicRankings } from "@/server/services/rankingService";
import { RecalculateRankingsButton } from "@/features/rankings/recalculate-button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default async function AdminRankingsPage() {
  await connection();
  const rankings = await listPublicRankings();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-display text-2xl font-semibold mb-4">Rankings</h1>
      <RecalculateRankingsButton />
      <div className="overflow-x-auto">
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
              <TableCell>{r.displayName}</TableCell>
              <TableCell>{r.wins}-{r.losses}</TableCell>
              <TableCell>{r.points}</TableCell>
            </TableRow>
          ))}
          {rankings.length === 0 && (
            <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">No rankings calculated yet.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
