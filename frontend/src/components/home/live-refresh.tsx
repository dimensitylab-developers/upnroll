"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Soft-refresh the current RSC tree so live boards pick up new match results. */
export function LiveRefresh({ seconds = 8 }: { seconds?: number }) {
  const router = useRouter();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPulse(true);
      router.refresh();
      window.setTimeout(() => setPulse(false), 160);
    }, Math.max(4, seconds) * 1000);
    return () => window.clearInterval(timer);
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
