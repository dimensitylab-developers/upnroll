import "server-only";

/**
 * Pure, bounded FAQ matcher — no LLM, no third-party API (that would be
 * its own infra decision, OD-012-class, not mine to pick unilaterally).
 * Deterministic keyword-overlap scoring against admin-published FAQ
 * content only. Returns null when there's no confident match, which the
 * caller must treat as "safe fallback," never a guess (Part D #9: "clear
 * limits and safe fallbacks").
 */

export type FaqEntry = { id: string; question: string; answer: string };

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "do", "does", "can", "i", "my", "to", "for",
  "of", "in", "on", "at", "and", "or", "it", "this", "that", "how", "what",
  "when", "where", "why", "will", "be", "you", "your",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w))
  );
}

export function matchFaq(question: string, faqs: FaqEntry[]): FaqEntry | null {
  const questionTokens = tokenize(question);
  if (questionTokens.size === 0 || faqs.length === 0) return null;

  let best: { entry: FaqEntry; overlap: number } | null = null;
  for (const faq of faqs) {
    const faqTokens = tokenize(faq.question);
    const overlap = [...questionTokens].filter((t) => faqTokens.has(t)).length;
    if (overlap > 0 && (!best || overlap > best.overlap)) {
      best = { entry: faq, overlap };
    }
  }

  return best ? best.entry : null;
}
