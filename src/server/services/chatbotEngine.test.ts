import { describe, it, expect } from "vitest";
import { matchFaq, type FaqEntry } from "./chatbotEngine";

const faqs: FaqEntry[] = [
  { id: "1", question: "When does registration close?", answer: "Registration closes per the event page." },
  { id: "2", question: "Can I transfer to a different division?", answer: "Submit a transfer request from your dashboard." },
  { id: "3", question: "Do you offer refunds?", answer: "Refunds are handled manually by the organizer." },
];

describe("matchFaq", () => {
  it("matches an obviously relevant question", () => {
    expect(matchFaq("When does registration close for this event?", faqs)?.id).toBe("1");
  });

  it("matches case- and punctuation-insensitively", () => {
    expect(matchFaq("CAN I TRANSFER my division??", faqs)?.id).toBe("2");
  });

  it("returns null for an unrelated question (safe fallback)", () => {
    expect(matchFaq("What is the weather like tomorrow?", faqs)).toBeNull();
  });

  it("returns null when there are no FAQs to match against", () => {
    expect(matchFaq("When does registration close?", [])).toBeNull();
  });

  it("returns null for an empty question", () => {
    expect(matchFaq("   ", faqs)).toBeNull();
  });

  it("picks the FAQ with the highest keyword overlap when multiple partially match", () => {
    const result = matchFaq("Do you offer refunds if I transfer?", faqs);
    expect(result?.id).toBe("3");
  });
});
