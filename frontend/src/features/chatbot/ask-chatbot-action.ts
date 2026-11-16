"use server";

import { cachedPublishedContent } from "@/lib/public-reads";
import { matchFaq } from "@/server/services/chatbotEngine";
import { EVENT_POINTS_RULES } from "@/server/services/divisionTaxonomy";

const FALLBACK_MESSAGE =
  "I don't have an approved answer for that yet. Please check the FAQ page or message @up.n.roll on Instagram.";

const HUMAN_HELP_PATTERN =
  /\b(human|emergency|urgent|real person|live agent|customer care|speak to (a |someone)|talk to (a |someone))\b/i;

function humanHelpMessage() {
  const { email } = EVENT_POINTS_RULES.contact;
  return `For human help, please send an email to ${email} with your name, the event, and what you need. The Up 'n Roll team will contact you.`;
}

export async function askChatbotAction(question: string): Promise<{ answer: string; matched: boolean }> {
  const trimmed = question.trim();
  if (!trimmed) return { answer: FALLBACK_MESSAGE, matched: false };
  if (HUMAN_HELP_PATTERN.test(trimmed)) return { answer: humanHelpMessage(), matched: true };

  const entries = await cachedPublishedContent("FAQ");
  const faqs = entries.map((entry) => ({
    id: entry._id,
    question: entry.title,
    answer: entry.body,
  }));
  const match = matchFaq(trimmed, faqs);

  return match ? { answer: match.answer, matched: true } : { answer: FALLBACK_MESSAGE, matched: false };
}
