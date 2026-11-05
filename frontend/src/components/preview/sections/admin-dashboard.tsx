import { Chapter, FixtureBadge } from "../chapter";
import { previewAdminOverview } from "@/lib/preview/fixtures";

const tiles = [
  { label: "Total registrations", value: previewAdminOverview.totalRegistrations },
  { label: "Pending payment reviews", value: previewAdminOverview.pendingPaymentReviews, accent: true },
  { label: "Confirmed registrations", value: previewAdminOverview.confirmedRegistrations },
  { label: "Unassigned participants", value: previewAdminOverview.unassignedParticipants },
  { label: "Upcoming matches", value: previewAdminOverview.upcomingMatches },
  { label: "Published results", value: previewAdminOverview.publishedResults },
  { label: "Open requests", value: previewAdminOverview.openRequests },
];

export function AdminDashboard() {
  return (
    <Chapter id="admin-dashboard" title="Admin Dashboard" subtitle="Efficient and information-dense by design — the admin portal does not reuse the public homepage's hero treatment.">
      <p className="text-sm text-muted-foreground mb-4">Active event: <span className="text-foreground font-medium">{previewAdminOverview.activeEvent}</span></p>
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className={`manga-panel p-4 ${t.accent ? "border-primary/40" : ""}`}>
            <p className={`text-3xl font-semibold text-display ${t.accent ? "text-primary" : ""}`}>{t.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.label}</p>
          </div>
        ))}
      </div>
      <FixtureBadge>Counts are fictional — derived from real queries only once Phase 2+ ships</FixtureBadge>
    </Chapter>
  );
}
