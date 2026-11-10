"use client";

import { useState } from "react";
import { logoutAction } from "./actions";
import { Button } from "@/components/ui/button";
import { AuthTransitionOverlay, holdAuthGate } from "./auth-transition-overlay";

export function SignOutButton({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const [gating, setGating] = useState(false);
  const short = name.trim().split(/\s+/)[0] || "Grappler";

  async function gatedLogout() {
    setGating(true);
    await holdAuthGate();
    await logoutAction();
  }

  return (
    <>
      {gating ? <AuthTransitionOverlay mode="out" name={short} /> : null}
      <form action={gatedLogout} className="sm:shrink-0" onSubmit={() => setGating(true)}>
        <Button type="submit" variant="outline" size="sm" disabled={gating} className={className}>
          {gating ? "Stepping off…" : `Sign out, ${short}`}
        </Button>
      </form>
    </>
  );
}
