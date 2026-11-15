"use server";

import { cachedPublishedContent } from "@/lib/public-reads";
import { matchFaq } from "@/server/services/chatbotEngine";

const FALLBACK_MESSAGE =
  "I don't have an approved answer for that yet. Please check the FAQ page or message @up.n.roll on Instagram.";

export async function askChatbotAction(question: string): Promise<{ answer: string; matched: boolean }> {
  const trimmed = question.trim();
  if (!trimmed) return { answer: FALLBACK_MESSAGE, matched: false };

  const entries = await cachedPublishedContent("FAQ");
  const faqs = entries.map((entry) => ({
    id: entry._id,
    question: entry.title,
    answer: entry.body,
  }));
  const match = matchFaq(trimmed, faqs);

  return match ? { answer: match.answer, matched: true } : { answer: FALLBACK_MESSAGE, matched: false };
}
