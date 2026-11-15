import { cachedPublishedContent } from "@/lib/public-reads";
import { FaqBoard } from "@/features/content/faq-board";

export default async function PublicFaqPage() {
  const entries = await cachedPublishedContent("FAQ");
  const items = entries.map((entry) => ({
    id: entry._id,
    question: entry.title,
    answer: entry.body,
  }));

  return (
    <main className="min-h-screen bg-background halftone-bg px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 sm:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Straight answers
          </p>
          <h1
            className="group mt-3 inline-flex max-w-full cursor-default items-stretch -skew-x-12 shadow-[6px_6px_0_0_#000] outline-none transition-[box-shadow] duration-200 hover:shadow-[6px_6px_0_0_var(--color-brand-red)] focus-visible:shadow-[6px_6px_0_0_var(--color-brand-red)]"
            tabIndex={0}
          >
            <span
              className="w-3 bg-black transition-colors duration-200 group-hover:bg-brand-red group-focus-visible:bg-brand-red sm:w-4"
              aria-hidden="true"
            />
            <span className="bg-black px-5 py-2.5 text-display text-3xl font-semibold uppercase tracking-wide text-white transition-colors duration-200 group-hover:bg-brand-red group-focus-visible:bg-brand-red sm:px-7 sm:text-4xl">
              <span className="inline-block skew-x-12">Grappler FAQ</span>
            </span>
            <span
              className="w-6 bg-black transition-colors duration-200 group-hover:bg-brand-red group-focus-visible:bg-brand-red sm:w-10"
              aria-hidden="true"
            />
          </h1>
        </div>

        <FaqBoard items={items} />
      </div>
    </main>
  );
}
