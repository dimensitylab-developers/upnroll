import { Chapter, FixtureBadge } from "../chapter";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { previewRankings } from "@/lib/preview/fixtures";

export function Rankings() {
  return (
    <Chapter id="rankings" title="Rankings" subtitle="Deliberately separated from the fighter directory (see ONE Championship research note) — rankings require an approved methodology, pending OD-004.">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Fighter</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Record</TableHead>
            <TableHead>Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewRankings.map((r) => (
            <TableRow key={r.rank}>
              <TableCell className="font-semibold text-brand-gold">#{r.rank}</TableCell>
              <TableCell>{r.fighter}</TableCell>
              <TableCell>{r.division}</TableCell>
              <TableCell>{r.record}</TableCell>
              <TableCell>{r.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground mt-3">Methodology: fictional placeholder points — not an approved ranking formula. Last updated 2026-10-31 (preview build time).</p>
      <FixtureBadge>No real ranking formula has been implemented or approved</FixtureBadge>
    </Chapter>
  );
}
