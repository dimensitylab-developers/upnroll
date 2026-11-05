"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { previewDashboardScenarios } from "@/lib/preview/fixtures";

export function FighterDashboard() {
  const [scenario, setScenario] = useState<keyof typeof previewDashboardScenarios>("none");
  const s = previewDashboardScenarios[scenario];

  return (
    <Chapter id="fighter-dashboard" title="Fighter Dashboard" subtitle="Switchable scenarios covering every state a real fighter dashboard must render sensibly.">
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(previewDashboardScenarios).map(([key, val]) => (
          <Button
            key={key}
            size="sm"
            variant={scenario === key ? "default" : "outline"}
            onClick={() => setScenario(key as keyof typeof previewDashboardScenarios)}
          >
            {val.label}
          </Button>
        ))}
      </div>

      <div className="manga-panel p-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Scenario: UI preview control</p>
        <p className="text-display text-2xl font-semibold mb-4">Welcome back, Rhea</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="border border-black/10 rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1">Registration status</p>
            <Badge variant="outline">{s.status.replaceAll("_", " ")}</Badge>
          </div>
          <div className="border border-black/10 rounded-md p-4">
            <p className="text-xs text-muted-foreground mb-1">Payment status</p>
            <Badge variant="outline">{s.paymentStatus ? s.paymentStatus.replaceAll("_", " ") : "—"}</Badge>
          </div>
        </div>

        <div className="border border-black/10 rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Next action</p>
          <p className={scenario === "matchInProgress" ? "text-brand-cyan font-medium" : ""}>{s.nextAction}</p>
        </div>
      </div>
      <FixtureBadge>Every scenario above is a labeled UI preview control, not live account data</FixtureBadge>
    </Chapter>
  );
}
