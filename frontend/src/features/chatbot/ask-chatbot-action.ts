"use server";

import { cachedPublishedContent } from "@/lib/public-reads";
import { matchFaq } from "@/server/services/chatbotEngine";

const FALLBACK_MESSAGE =
  "I don't have an approved answer for that yet. Please check the FAQ page or contact the event organizer directly.";

export async function askChatbotAction(question: string): Promise<{ answer: string; matched: boolean }> {
  const trimmed = question.trim();
  if (!trimmed) return { answer: FALLBACK_MESSAGE, matched: false };

  const faqs = await cachedPublishedContent("FAQ");
  const match = matchFaq(
    trimmed,
    faqs.map((f) => ({ id: String(f._id), question: f.title, answer: f.body }))
  );

  return match ? { answer: match.answer, matched: true } : { answer: FALLBACK_MESSAGE, matched: false };
}
