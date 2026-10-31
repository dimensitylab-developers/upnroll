import { Chapter, FixtureBadge } from "../chapter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { previewFighters } from "@/lib/preview/fixtures";

export function FighterProfile() {
  const fighter = previewFighters[0];
  return (
    <Chapter id="fighter-profile" title="Fighter Profile" subtitle="Public fields only — no email, phone, date of birth, or payment data is ever rendered here, per Part H privacy constraints.">
      <div className="manga-panel p-8 mb-6 flex flex-wrap items-center gap-6">
        <Avatar className="size-24"><AvatarFallback className="text-2xl">RK</AvatarFallback></Avatar>
        <div>
          <p className="text-display text-3xl font-semibold">{fighter.name}</p>
          <p className="text-muted-foreground">{fighter.gym} · {fighter.division} · {fighter.discipline}</p>
          <div className="flex gap-2 mt-3">
            <Badge className="bg-brand-gold/20 text-brand-gold border-brand-gold/40">Rank #{fighter.rank}</Badge>
            <Badge variant="outline">{fighter.record.w}-{fighter.record.l}-{fighter.record.d}</Badge>
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold text-muted-foreground mb-2">Fight history</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Opponent</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            { event: "Underground Arena Vol. 3", opp: "Priya Nalavade", result: "Win", method: "Submission, R2" },
            { event: "Underground Arena Vol. 2", opp: "Sana Irani", result: "Win", method: "Decision" },
            { event: "Underground Arena Vol. 1", opp: "Tanvi Oberoi", result: "Loss", method: "Points" },
          ].map((r) => (
            <TableRow key={r.event}>
              <TableCell>{r.event}</TableCell>
              <TableCell>{r.opp}</TableCell>
              <TableCell className={r.result === "Win" ? "text-brand-cyan" : "text-muted-foreground"}>{r.result}</TableCell>
              <TableCell>{r.method}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <FixtureBadge>Fictional fighter and fight history — no measurements or statistics invented beyond this showroom</FixtureBadge>
    </Chapter>
  );
}
