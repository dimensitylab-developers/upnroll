import { describe, expect, it } from "vitest";
import { matchFaq } from "../services/chatbotEngine";
import { CHAT_PROMPTS, STARTER_FAQS, getPublicFaqs } from "./starterFaqs";

const faqs = getPublicFaqs();

describe("starter FAQs", () => {
  it("exposes a non-empty hardcoded public list", () => {
    expect(faqs.length).toBe(STARTER_FAQS.length);
    expect(faqs.length).toBeGreaterThan(10);
  });

  it("does not include the removed contact FAQ", () => {
    expect(faqs.some((faq) => /how do i contact/i.test(faq.question))).toBe(false);
  });

  it("matches each published question to itself", () => {
    for (const faq of faqs) {
      expect(matchFaq(faq.question, faqs)?.id).toBe(faq.id);
    }
  });

  it("matches the chat prompts to the intended answers", () => {
    const expected = [
      "Create a grappler account",
      "Pay with the UPI",
      "Compulsory: rashguard",
      "free link",
      "Rankings follow bracket results",
      "Instagram DM",
    ];
    CHAT_PROMPTS.forEach((prompt, index) => {
      expect(matchFaq(prompt, faqs)?.answer).toContain(expected[index]);
    });
  });
});
