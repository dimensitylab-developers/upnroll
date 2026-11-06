import { cachedPublishedContent } from "@/lib/public-reads";


export default async function PublicFaqPage() {
  const faqs = await cachedPublishedContent("FAQ");

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-display text-4xl font-semibold mb-8">FAQ</h1>
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={String(f._id)} className="manga-panel p-4">
              <p className="font-semibold">{f.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{f.body}</p>
            </div>
          ))}
          {faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs published yet.</p>}
        </div>
      </div>
    </main>
  );
}
