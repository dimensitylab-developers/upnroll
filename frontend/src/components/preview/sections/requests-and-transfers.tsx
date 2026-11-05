import { Chapter, FixtureBadge } from "../chapter";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { previewRequests } from "@/lib/preview/fixtures";

export function RequestsAndTransfers() {
  return (
    <Chapter id="requests" title="Cancellations and Transfers" subtitle="Policy specifics (windows, eligibility, fees) are pending client approval — see OD-007. Refunds are manual and off-platform per Part D §8.">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Fighter</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewRequests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.type}</TableCell>
              <TableCell>{r.fighter}</TableCell>
              <TableCell>{r.from}{r.to ? ` → ${r.to}` : " (withdraw)"}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{r.reason}</TableCell>
              <TableCell><Badge variant={r.status === "APPROVED" ? "default" : "secondary"}>{r.status}</Badge></TableCell>
              <TableCell>
                {r.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Deny</Button>
                    <Button size="sm">Approve</Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Decided</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FixtureBadge>Refunds, if any, are processed manually off-platform — not shown as automated here</FixtureBadge>
    </Chapter>
  );
}
