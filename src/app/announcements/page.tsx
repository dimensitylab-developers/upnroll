import { listPublished } from "@/server/services/contentService";

export const dynamic = "force-dynamic";

export default async function PublicAnnouncementsPage() {
  const announcements = await listPublished("ANNOUNCEMENT");

  return (
    <div className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">Announcements</h1>
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={String(a._id)} className="manga-panel p-4">
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(a.createdAt as Date).toLocaleDateString()}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
        </div>
      </div>
    </div>
  );
}
