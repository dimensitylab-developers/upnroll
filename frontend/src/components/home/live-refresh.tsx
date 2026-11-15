"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Soft-refresh the current RSC tree so live boards pick up new match results.
 * Skips ticks while the tab is hidden/backgrounded  a phone with this page open in a
 * background tab shouldn't keep re-rendering and re-fetching every few seconds, and
 * refreshes once immediately on return so the view isn't stale when the user comes back.
 */
export function LiveRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setPulse(true);
      router.refresh();
      window.setTimeout(() => setPulse(false), 160);
    };

    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      refresh();
    }, Math.max(4, seconds) * 1000);

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, seconds]);

  return (
    <p
      className={`inline-flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity duration-150 ${
        pulse ? "opacity-70" : "opacity-100"
      }`}
      aria-live="polite"
    >
      <span className="live-pulse size-2 rounded-full bg-brand-red" aria-hidden="true" />
      Live board
    </p>
  );
}
