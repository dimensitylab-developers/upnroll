export type HomeFaqItem = {
  id: string;
  question: string;
  answer: string;
  label: string;
};

export type FaqSourceItem = {
  id: string;
  question: string;
  answer: string;
};

/** Homepage: short set athletes ask first (no contact FAQ). */
export const HOME_FAQ_PRIORITY = [
  "How do I register for an event?",
  "How do I pay the entry fee?",
  "What is the cancellation refund if I cancel?",
  "What should I wear?",
] as const;

/** Pick a short homepage strip from published FAQs (priority titles first). */
export function getHomeFaqs(faqs: FaqSourceItem[], limit = 4): HomeFaqItem[] {
  const byTitle = new Map(faqs.map((faq) => [faq.question, faq]));
  const picked: HomeFaqItem[] = [];

  for (const [index, title] of HOME_FAQ_PRIORITY.entries()) {
    const hit = byTitle.get(title);
    if (!hit) continue;
    picked.push({
      id: hit.id,
      question: hit.question,
      answer: hit.answer,
      label: `Q${String(index + 1).padStart(2, "0")}`,
    });
    if (picked.length >= limit) return picked;
  }

  for (const faq of faqs) {
    if (picked.some((item) => item.id === faq.id)) continue;
    picked.push({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      label: `Q${String(picked.length + 1).padStart(2, "0")}`,
    });
    if (picked.length >= limit) break;
  }

  return picked;
}
