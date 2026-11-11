import type { MatAnnouncement } from "@/server/services/announcementService";
import { MatchAnnouncementLive } from "./match-announcement-live";

export function MatchAnnouncementBanner({ mats, eventName }: { mats: MatAnnouncement[]; eventName: string }) {
  return (
    <section
      className="mb-8 border-2 border-black bg-black text-white shadow-[8px_8px_0_0_#c8102e]"
      aria-label="Live mat announcements"
    >
      <div className="border-b-2 border-brand-red px-4 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">{eventName}</p>
        <h2 className="text-display text-lg font-semibold">On the mats</h2>
      </div>
      <MatchAnnouncementLive initialMats={mats} />
    </section>
  );
}
