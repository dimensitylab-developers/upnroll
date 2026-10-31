"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";

const breakpoints = [
  { label: "360px", width: 360 },
  { label: "390px", width: 390 },
  { label: "768px", width: 768 },
  { label: "1024px", width: 1024 },
  { label: "1440px", width: 1440 },
];

export function ResponsiveBehavior() {
  const [bp, setBp] = useState(breakpoints[2]);

  return (
    <Chapter id="responsive" title="Responsive Behavior" subtitle="The showroom itself is responsive end-to-end; this frame previews one representative card at each target breakpoint without shrinking content into an unreadable mockup.">
      <div className="flex flex-wrap gap-2 mb-6">
        {breakpoints.map((b) => (
          <Button key={b.label} size="sm" variant={bp.label === b.label ? "default" : "outline"} onClick={() => setBp(b)}>
            {b.label}
          </Button>
        ))}
      </div>
      <div className="border border-black/10 rounded-md overflow-x-auto p-4 bg-black/20">
        <div
          className="manga-panel p-5 mx-auto transition-all"
          style={{ width: Math.min(bp.width, 900), maxWidth: "100%" }}
        >
          <p className="text-display text-xl font-semibold mb-2">Underground Arena Vol. 4</p>
          <p className="text-sm text-muted-foreground mb-3">Welterweight · Round of 16 · Mat 2</p>
          <div className={bp.width < 500 ? "flex flex-col gap-2" : "flex items-center justify-between"}>
            <span className="text-sm">Devansh Oak vs. Kiran Vellore</span>
            <Button size="sm">View match</Button>
          </div>
        </div>
      </div>
      <FixtureBadge>Frame resizes to the real breakpoint width — not a scaled-down screenshot</FixtureBadge>
    </Chapter>
  );
}
