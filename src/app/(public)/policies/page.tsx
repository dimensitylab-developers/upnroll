import { listPublished } from "@/server/services/contentService";

export const dynamic = "force-dynamic";

export default async function PublicPoliciesPage() {
  const policies = await listPublished("POLICY");

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">Policies</h1>
        <div className="space-y-4">
          {policies.map((p) => (
            <div key={String(p._id)} className="manga-panel p-4">
              <p className="font-semibold">{p.title}</p>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{p.body}</p>
            </div>
          ))}
          {policies.length === 0 && <p className="text-sm text-muted-foreground">No policies published yet.</p>}
        </div>
      </div>
    </main>
  );
}
