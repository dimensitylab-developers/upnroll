import { listPublished } from "@/server/services/contentService";
import { FaqBoard } from "@/features/content/faq-board";

export default async function PublicFaqPage() {
  const faqs = await listPublished("FAQ");
  const items = faqs.map((f) => ({
    id: String(f._id),
    question: f.title,
    answer: f.body,
  }));

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-red">The card</p>
        <div className="mt-2 mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-display text-5xl font-semibold">FAQ</h1>
          <p className="max-w-sm text-sm">
            Pick a question. The chat on this site answers from the same list.
          </p>
        </div>
        {items.length > 0 ? (
          <FaqBoard items={items} />
        ) : (
          <p className="text-sm text-muted-foreground">No FAQs published yet.</p>
        )}
      </div>
    </main>
  );
}
