import { describe, it, expect } from "vitest";
import { getHomeFaqs, HOME_FAQ_PRIORITY } from "./home-faq-data";

const published = [
  { id: "a", question: "What should I wear?", answer: "Gi or no-gi as listed." },
  { id: "b", question: "How do I register for an event?", answer: "Open the event and register." },
  { id: "c", question: "How do rankings work?", answer: "Points from finishes." },
  { id: "d", question: "How do I pay the entry fee?", answer: "Upload a QR payment proof." },
  { id: "e", question: "What is the cancellation refund if I cancel?", answer: "Organizer reviews refunds." },
];

describe("getHomeFaqs", () => {
  it("prefers HOME_FAQ_PRIORITY titles from published FAQs", () => {
    const items = getHomeFaqs(published, 4);
    expect(items.map((item) => item.question)).toEqual([...HOME_FAQ_PRIORITY]);
    expect(items[0]?.id).toBe("b");
  });

  it("fills remaining slots from published list when priority titles are missing", () => {
    const items = getHomeFaqs(
      [
        { id: "1", question: "How do rankings work?", answer: "Points." },
        { id: "2", question: "Can I transfer?", answer: "Yes via request." },
      ],
      2
    );
    expect(items).toHaveLength(2);
    expect(items[0]?.question).toBe("How do rankings work?");
    expect(items[1]?.question).toBe("Can I transfer?");
  });

  it("returns empty when there are no published FAQs", () => {
    expect(getHomeFaqs([])).toEqual([]);
  });
});
