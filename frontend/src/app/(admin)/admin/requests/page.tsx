import { listRequestsForAdmin } from "@/server/services/requestService";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DecideRequestDialog } from "@/features/requests/decide-request-dialog";

export default async function AdminRequestsPage() {
  const requests = await listRequestsForAdmin();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-display text-2xl font-semibold mb-6">Cancellation & transfer requests</h1>
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
            <TableRow key={String(r._id)}>
              <TableCell>{r.userEmail}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{r.reason}</TableCell>
              <TableCell><Badge variant={r.status === "APPROVED" ? "default" : r.status === "REJECTED" ? "destructive" : "secondary"}>{r.status}</Badge></TableCell>
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
            <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No requests yet.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
