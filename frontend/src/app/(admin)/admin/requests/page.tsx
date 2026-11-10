import type { Metadata } from "next";
import { requireActor } from "@/server/auth/session";
import { listRequestsForAdmin } from "@/server/services/requestService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DecideRequestDialog } from "@/features/requests/decide-request-dialog";
import { AdminStamp } from "@/features/admin/ui/admin-stamp";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Requests" };

export default async function AdminRequestsPage() {
  const requests = await listRequestsForAdmin(await requireActor("ADMIN"));
  const pending = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <section className="border-2 border-black bg-black px-5 py-7 text-white shadow-[8px_8px_0_0_#c8102e] sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">Decisions</p>
        <h1 className="text-display mt-2 text-3xl font-semibold">Cancellation & transfer</h1>
        <p className="mt-2 text-sm text-white/70">{pending} pending · {requests.length} total</p>
      </section>

      <div className="border-2 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] sm:p-6">
        <AdminStamp>Requests</AdminStamp>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fighter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={String(r._id)} className={r.status === "PENDING" ? "bg-brand-red/5" : undefined}>
                  <TableCell>{r.userEmail}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{r.reason}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "APPROVED" ? "default" : r.status === "REJECTED" ? "destructive" : "secondary"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.status === "PENDING" ? (
                      <DecideRequestDialog requestId={String(r._id)} summary={`${r.type} — ${r.reason}`} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Decided</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No requests yet.
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
