import { Chapter, FixtureBadge } from "../chapter";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

export function MatchDetails() {
  return (
    <Chapter id="match-details" title="Match Details" subtitle="Single-match view shown when a bracket card (Chapter 13) is selected.">
      <div className="manga-panel p-8 max-w-xl">
        <Badge className="bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40 mb-4">
          <span className="size-1.5 rounded-full bg-brand-cyan live-pulse mr-1.5" /> Live
        </Badge>
        <div className="flex items-center justify-between text-display text-2xl font-semibold">
          <span>Ishaan Bhide</span>
          <span className="text-muted-foreground text-base">vs</span>
          <span>Tanish Rao</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground mt-4">
          <span className="flex items-center gap-1.5"><MapPin className="size-4" /> Mat 2</span>
          <span className="flex items-center gap-1.5"><Clock className="size-4" /> Round of 16</span>
        </div>
        <div className="border-t border-white/10 mt-6 pt-4 text-sm text-muted-foreground">
          Result method, winner, and bracket advancement will appear here once the match is recorded by an admin.
        </div>
      </div>
      <FixtureBadge>Fictional in-progress match — no live scoring hardware connected</FixtureBadge>
    </Chapter>
  );
}
