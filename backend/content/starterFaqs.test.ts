import { describe, expect, it } from "vitest";
import { matchFaq } from "../services/chatbotEngine";
import { CHAT_PROMPTS, STARTER_FAQS } from "./starterFaqs";

const faqs = STARTER_FAQS.map((faq, index) => ({
  id: String(index),
  question: faq.question,
  answer: faq.answer,
}));

describe("starter FAQs", () => {
  it("matches each published question to itself", () => {
    for (const faq of faqs) {
      expect(matchFaq(faq.question, faqs)?.id).toBe(faq.id);
    }
  });

  it("matches the chat prompts to the intended answers", () => {
    const expected = [
      "Create a fighter account",
      "does not take card payments",
      "the refund is 50%",
      "free link",
      "rashguard",
      "only show the mat",
    ];
    CHAT_PROMPTS.forEach((prompt, index) => {
      expect(matchFaq(prompt, faqs)?.answer).toContain(expected[index]);
    });
  });
});
