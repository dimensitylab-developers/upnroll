import { requireActor } from "@/server/auth/session";
import { listAllContent } from "@/server/services/contentService";
import { CreateContentForm } from "@/features/content/create-content-form";
import { PublishToggleButton } from "@/features/content/publish-toggle-button";
import { Badge } from "@/components/ui/badge";

export default async function AdminContentPage() {
  const entries = await listAllContent(await requireActor("ADMIN"));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
      <div className="manga-panel p-8">
        <h1 className="text-display text-2xl font-semibold mb-6">Create content</h1>
        <CreateContentForm />
      </div>

      <div className="space-y-2">
        {entries.map((e) => (
          <div key={String(e._id)} className="manga-panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{e.type}</Badge>
                <Badge variant={e.publicationState === "PUBLISHED" ? "default" : "secondary"}>{e.publicationState}</Badge>
              </div>
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{e.body}</p>
            </div>
            <PublishToggleButton entryId={String(e._id)} currentState={e.publicationState} />
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-muted-foreground">No content yet.</p>}
      </div>
    </div>
  );
}
