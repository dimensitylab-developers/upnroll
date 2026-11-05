import { Chapter } from "../chapter";

export function Typography() {
  return (
    <Chapter
      id="typography"
      title="Typography"
      subtitle="Oswald (condensed display) for headings and fight-card drama; Inter (highly readable) for every interface and operational screen — chosen so admin and fighter-portal text never sacrifices legibility for flavor, per the brand direction's readability rule."
    >
      <div className="grid sm:grid-cols-2 gap-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Display — Oswald</p>
          <p className="text-display text-5xl font-semibold">Fight Night</p>
          <p className="text-display text-3xl font-medium mt-2">Division Finals</p>
          <p className="text-display text-xl font-medium mt-2">Round of 16</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Interface — Inter</p>
          <p className="text-lg font-semibold">Registration confirmed</p>
          <p className="text-base mt-2">
            Your payment for Underground Arena Vol. 4 has been approved. Your bracket placement
            will be published once the division closes.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Submitted 2026-11-18 · Reviewed by admin</p>
        </div>
      </div>
    </Chapter>
  );
}
