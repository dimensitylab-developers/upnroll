import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { previewEvent, previewDivisions } from "@/lib/preview/fixtures";
import { MapPin, CalendarDays } from "lucide-react";

export function PublicPreviews() {
  return (
    <>
      <Chapter id="homepage" title="Public Homepage" subtitle="Representative composition — hero, featured event, and a results/rankings teaser. Final copy is pending client content.">
        <div className="manga-panel speed-lines p-10 sm:p-16 mb-6 relative overflow-hidden">
          <Badge className="mb-4 bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40">Registration open</Badge>
          <h1 className="text-display text-4xl sm:text-6xl font-semibold leading-tight max-w-2xl">
            {previewEvent.name}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl">{previewEvent.tagline}</p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-4" /> {previewEvent.date}</span>
            <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {previewEvent.venue}</span>
          </div>
          <Button className="mt-6">Register for this event</Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {previewDivisions.slice(0, 3).map((d) => (
            <div key={d.id} className="manga-panel p-5">
              <p className="text-display text-lg font-semibold">{d.name}</p>
              <p className="text-sm text-muted-foreground">{d.discipline}</p>
              <p className="text-sm text-brand-gold mt-2">{d.registered}/{d.capacity} registered</p>
            </div>
          ))}
        </div>
        <FixtureBadge>Event name, copy, and dates are fictional — see OD-005/OD-006</FixtureBadge>
      </Chapter>

      <Chapter id="events" title="Events" subtitle="Listing card, featured event banner, and division breakdown — the shape reused by UFC-style directory cards (see combat-sports-reference-analysis.md) adapted to the manga panel treatment.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="manga-panel p-4">
              <div className="h-28 rounded-md bg-gradient-to-br from-primary/30 to-background mb-3 jagged-edge" />
              <p className="font-semibold">{i === 1 ? previewEvent.name : `Fight Night Qualifier ${i - 1}`}</p>
              <p className="text-xs text-muted-foreground mt-1">{i === 1 ? "2026-12-13 · Registration open" : "Past event · Results published"}</p>
            </div>
          ))}
        </div>
      </Chapter>
    </>
  );
}
