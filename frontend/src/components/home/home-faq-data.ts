export type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
  label: string;
};

/** Homepage only — a short card of the FAQs athletes ask first. */
export const HOME_FAQ_PRIORITY = [
  "How do I register for an event?",
  "How do I pay the entry fee?",
  "What is the cancellation refund if I cancel?",
  "What should I wear?",
  "How do I contact Up ’n Roll?",
] as const;

export function pickHomeFaqs<T extends { title: string; body: string; _id: unknown }>(
  faqs: T[],
  limit = 5
): HomeFaqItem[] {
  const byTitle = new Map(faqs.map((f) => [f.title, f]));
  const picked: HomeFaqItem[] = [];

  for (const [index, title] of HOME_FAQ_PRIORITY.entries()) {
    const hit = byTitle.get(title);
    if (!hit) continue;
    picked.push({
      id: String(hit._id),
      question: hit.title,
      answer: hit.body,
      label: `Q${String(index + 1).padStart(2, "0")}`,
    });
    if (picked.length >= limit) return picked;
  }

  for (const faq of faqs) {
    if (picked.some((p) => p.id === String(faq._id))) continue;
    picked.push({
      id: String(faq._id),
      question: faq.title,
      answer: faq.body,
      label: `Q${String(picked.length + 1).padStart(2, "0")}`,
    });
    if (picked.length >= limit) break;
  }

  return picked;
}
