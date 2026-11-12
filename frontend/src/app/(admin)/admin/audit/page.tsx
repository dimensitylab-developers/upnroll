import { requireActor } from "@/server/auth/session";
import { listAuditLogsPage } from "@/server/audit/log";
import { PageHeader } from "@/components/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const instant = false;

export default async function AdminAuditPage() {
  const actor = await requireActor("ADMIN");
  const { rows } = await listAuditLogsPage(actor, { limit: 80 });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-1 sm:px-0">
      <PageHeader title="Audit log" />

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
            <p className="text-[11px] text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</p>
            <p className="mt-1 break-all font-mono text-xs font-semibold">{row.action}</p>
            <p className="mt-1 break-words text-sm">
              {row.actorName ? `${row.actorName} · ` : ""}
              {row.actorEmail}
            </p>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              {row.targetType}
              {row.targetId ? ` ${row.targetId}` : ""}
            </p>
          </li>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No audit entries yet.</p>}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto border-2 border-black bg-white shadow-[6px_6px_0_0_#000] md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-xs">{row.action}</TableCell>
                <TableCell className="text-sm">
                  {row.actorName ? `${row.actorName} · ` : ""}
                  {row.actorEmail}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {row.targetType}
                  {row.targetId ? ` ${row.targetId}` : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
