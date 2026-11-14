import type { Metadata } from "next";
import { connection } from "next/server";
import { requireActor } from "@/server/auth/session";
import { listPublicRankings } from "@/server/services/rankingService";
import { listManualRankingsForAdmin } from "@/server/services/manualRankingService";
import { RecalculateRankingsButton } from "@/features/rankings/recalculate-button";
import { ManualRankingForm } from "@/features/rankings/manual-ranking-form";
import { deleteManualRankingAction } from "@/features/rankings/actions";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Rankings" };

export default async function AdminRankingsPage() {
  await connection();
  const actor = await requireActor("ADMIN");
  const [rankings, manual] = await Promise.all([
    listPublicRankings(),
    listManualRankingsForAdmin(actor),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6">
      <div>
        <h1 className="text-display mb-2 text-2xl font-semibold">Rankings</h1>
        <p className="text-sm text-muted-foreground">
          Public board prefers published manual numbers. Super Fight assignment stays a house decision.
          Bracket recalculation still updates win/loss/points records for reference.
        </p>
      </div>

      <ManualRankingForm />

      <div className="space-y-3">
        <h2 className="text-display text-lg font-semibold">Manual entries</h2>
        <ul className="space-y-2">
          {manual.map((entry) => (
            <li key={String(entry._id)} className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-white px-3 py-2 text-sm">
              <span>
                #{entry.rank} {entry.displayName}
                {entry.weightBand ? ` · ${entry.weightBand}` : ""}
                {entry.published ? "" : " · draft"}
              </span>
              <form action={deleteManualRankingAction}>
                <input type="hidden" name="id" value={String(entry._id)} />
                <button type="submit" className="text-xs font-semibold uppercase tracking-wider text-brand-red underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
          {manual.length === 0 && <p className="text-sm text-muted-foreground">No manual rankings yet.</p>}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-display text-lg font-semibold">Computed records</h2>
        <RecalculateRankingsButton />
        <div className="mt-4 overflow-x-auto">
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
                  <TableCell>
                    {r.wins}-{r.losses}
                  </TableCell>
                  <TableCell>{r.points}</TableCell>
                </TableRow>
              ))}
              {rankings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No rankings calculated yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
