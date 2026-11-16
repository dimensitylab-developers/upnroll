/**
 * Questions athletes actually ask. The chatbot matches these titles by
 * keyword, so each title keeps the words people type (pay, refund, mat, photo).
 */
export const STARTER_FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I register for an event?",
    answer:
      "Create a grappler account with your details and upload identity proof. Sign in, choose Beginner or Intermediate and a weight class that matches your gender, tick both Consent and Agreement, then continue to payment.",
  },
  {
    question: "How do I pay the entry fee?",
    answer:
      "Pay with the UPI instructions shown for that event, then an admin reviews your payment before your place is confirmed. The fee is the one published on that event. Coupons can change the amount when they apply.",
  },
  {
    question: "Can I use a coupon or promo code?",
    answer:
      "Yes, when an event has coupons enabled. Enter the code on the registration form before you finish. A valid code can reserve a discount while you complete payment. Expired, maxed-out, or invalid codes are rejected with a clear error.",
  },
  {
    question: "What is the cancellation refund if I cancel?",
    answer:
      "There is no full refund when you cancel. You can transfer your spot to a friend, or a 50% refund may apply when cancellation is approved one month or more before the event. The organizer handles money off-platform. Prefer transfer to a friend whenever possible.",
  },
  {
    question: "Can I transfer my spot to a teammate?",
    answer:
      "Yes. From your requests page you can make a free link and give your bracket spot to a friend. They sign in, open the link, and complete the full grappler registration form (identity proof, medical answers, and waiver) before the spot moves. Their gender and belt must match the division. A move into a different division is a separate request that an admin decides.",
  },
  {
    question: "What should I wear?",
    answer:
      "Compulsory: rashguard and shorts with no zippers or pockets, and a mouthguard (compulsory). Mouthguard is mandatory; bring your own.",
  },
  {
    question: "Which mat is my match on?",
    answer:
      "The organizer sets how many mats are active, and each open match is assigned to one of them. Your dashboard and match list only show the mat you are on. Live announcements on the site also call out mat assignments when a bout is up.",
  },
  {
    question: "When should I warm up?",
    answer:
      "When your bout is inside 15 minutes, your dashboard shows a warm-up note. Fight-day reminders and notifications can also push that cue. Check your grappler notifications panel on event day.",
  },
  {
    question: "Do I get fight-night notifications?",
    answer:
      "Yes. Your grappler desk has a notifications area for reminders and event messages. Organizers can also run outbox jobs for fight-day reminders. Keep your contact details current on your profile.",
  },
  {
    question: "Do I need to upload identity proof?",
    answer:
      "Yes. Upload a clear photo of your government identity proof when you register. Identity proof stays private and is not shown on public grappler pages.",
  },
  {
    question: "What is the public grappler card?",
    answer:
      "Each grappler gets a shareable hype card with photo, record, and public profile details (no private ID or medical data). You can open it from your grappler desk and from public rankings or grappler pages.",
  },
  {
    question: "Who can see my identity proof and medical information?",
    answer:
      "Identity proof and medical answers stay off public grappler pages. Organizers can see the full registration, including the identity proof upload, in the admin panel.",
  },
  {
    question: "How do rankings work?",
    answer:
      "Rankings follow bracket results: athletes who go further place higher. Early exits place lower. When two athletes lose with no points, the faster loss places lower. Athletes who skip a recent event can drop versus recent participants. Who gets a Super Fight is decided manually by the organisers.",
  },
  {
    question: "How does live judge scoring work?",
    answer:
      "Event judges sign in on a dedicated judge login with match credentials from the organizer. They score from the judge console during the bout. Final results still follow the referee and scoring rules set for that event.",
  },
  {
    question: "Can organizers merge divisions when athletes share a coach?",
    answer:
      "Yes. Organizers may merge divisions, and athletes who train under the same coach can be matched.",
  },
  {
    question: "Are referee decisions final if I disagree with a decision?",
    answer:
      "Yes. The referee runs the match, and the referee decision is final. Athlete safety comes first.",
  },
  {
    question: "What is Up ’n Roll Superfight?",
    answer:
      "Up ’n Roll Superfight is the featured card on this site. Open registration, brackets, schedule, and results for that event live under Events when the card is published.",
  },
  {
    question: "I have an emergency and need a human",
    answer:
      "For human help, send an email to info.upnroll@gmail.com with your name, the event, and what you need. The Up 'n Roll team will contact you. For day-to-day questions you can also reach us on Instagram (@up.n.roll).",
  },
];

/** Seed corpus shape used by ensureStarterFaqs and FAQ matcher tests. */
export type PublicFaqItem = {
  id: string;
  question: string;
  answer: string;
};

/** Maps STARTER_FAQS for seeding/tests. Public /faq and chatbot read published ContentEntry rows. */
export function getPublicFaqs(): PublicFaqItem[] {
  return STARTER_FAQS.map((faq, index) => ({
    id: `starter-faq-${index + 1}`,
    question: faq.question,
    answer: faq.answer,
  }));
}

/** Short prompts shown in the chat. Each one is written to hit one FAQ above. */
export const CHAT_PROMPTS = [
  "How do I register?",
  "How do I pay?",
  "What should I wear?",
  "Can I transfer my spot to a teammate?",
  "How do rankings work?",
  "I have an emergency and need a human assistance",
] as const;
