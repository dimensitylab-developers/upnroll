import { listAllMedia } from "@/server/services/mediaService";
import { CreateMediaForm } from "@/features/media/create-media-form";

export default async function AdminMediaPage() {
  const media = await listAllMedia();

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="manga-panel p-8">
        <h1 className="text-display text-2xl font-semibold mb-6">Add media</h1>
        <CreateMediaForm />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {media.map((m) => (
          <div key={String(m._id)} className="manga-panel p-3 text-sm">
            <p className="font-medium">{m.caption}</p>
            <a href={m.externalUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground underline break-all">
              {m.externalUrl}
            </a>
          </div>
        ))}
        {media.length === 0 && <p className="text-sm text-muted-foreground">No media yet.</p>}
      </div>
    </div>
  );
}
