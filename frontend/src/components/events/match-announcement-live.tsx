"use client";

import type { MatAnnouncement } from "@/server/services/announcementService";
import Link from "next/link";
import { LiveRefresh } from "@/components/home/live-refresh";

export function MatchAnnouncementLive({ initialMats }: { initialMats: MatAnnouncement[] }) {
  return (
    <>
      <div className="px-4 py-2">
        <LiveRefresh seconds={12} />
      </div>
      <ul className="grid gap-0 sm:grid-cols-2" aria-live="polite" aria-atomic="false">
        {initialMats.map((mat) => (
          <li key={mat.mat} className="border-t border-white/20 px-4 py-3 sm:border-r sm:last:border-r-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-red">Mat {mat.mat}</p>
            {mat.status === "NONE" ? (
              <p className="mt-1 text-sm text-white/60">No upcoming bout on this mat.</p>
            ) : (
              <>
                <p className="mt-1 text-sm">
                  <span className={mat.status === "LIVE" ? "text-brand-red font-semibold" : ""}>
                    {mat.status === "LIVE" ? "Live now" : "Up next"}
                  </span>
                  {mat.divisionName ? ` · ${mat.divisionName}` : ""}
                </p>
                <p className="text-display mt-1 text-base font-semibold">
                  {mat.competitorAName ?? "TBA"} vs {mat.competitorBName ?? "TBA"}
                </p>
                {mat.scheduledAt && (
                  <p className="mt-1 text-xs text-white/70">
                    {new Date(mat.scheduledAt).toLocaleString(undefined, { timeZone: mat.timezone })}
                  </p>
                )}
                {mat.href && (
                  <Link href={mat.href} className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider underline">
                    Full schedule
                  </Link>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
