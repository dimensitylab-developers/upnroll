import { requireActor } from "@/server/auth/session";
import { listAuditLogsPage } from "@/server/audit/log";
import { PageHeader } from "@/components/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const instant = false;

export default async function AdminAuditPage() {
  const actor = await requireActor("ADMIN");
  const { rows } = await listAuditLogsPage(actor, { limit: 80 });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title="Audit log" />
      <div className="overflow-x-auto border-2 border-black bg-white shadow-[6px_6px_0_0_#000]">
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
