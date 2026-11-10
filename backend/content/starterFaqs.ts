/**
 * Questions athletes actually ask. The chatbot matches these titles by
 * keyword, so each title keeps the words people type (pay, refund, mat, photo).
 */
export const STARTER_FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I register for an event?",
    answer:
      "Create a fighter account with your grappler details and a passport photo. Sign in, choose an open division, tick both Consent and Agreement, then continue to payment.",
  },
  {
    question: "How do I pay the entry fee?",
    answer:
      "This site does not take card payments. Pay with the QR instructions shown for the event, then an admin reviews the payment before your place is confirmed. The fee is the one published on that event.",
  },
  {
    question: "What is the cancellation refund if I cancel?",
    answer:
      "Cancel one month or more before the event and the refund is 50%. Inside that month there is no refund. Nothing is refunded on the day of the event, before the fight, or after the fight. The organizer handles the refund. The site does not send the money itself.",
  },
  {
    question: "Can I transfer my spot to a teammate?",
    answer:
      "Yes. From your requests page you can make a free link and give your bracket spot to a teammate. They sign in, open the link, and take your place. A move into a different division is a separate request that an admin decides.",
  },
  {
    question: "What should I wear?",
    answer:
      "Wear a rashguard and grappling shorts or spats. No pockets, zippers, or hard objects. If the organizers give you a rashguard or other gear, you compete in it.",
  },
  {
    question: "Which mat is my match on?",
    answer:
      "The organizer sets how many mats are active, and each open match is assigned to one of them. Your dashboard and match list only show the mat you are on.",
  },
  {
    question: "When should I warm up?",
    answer:
      "When your bout is inside 15 minutes, your dashboard shows a warm-up note. The same note is prepared for WhatsApp. Text messages are not sent in this phase.",
  },
  {
    question: "Do I need a passport photo or photograph?",
    answer:
      "Yes. A passport size photograph is required when you create your account. Use a JPG, PNG, or WebP under 1.5 MB. The picture appears in the passport box as soon as you choose the file.",
  },
  {
    question: "Who can see my Aadhaar and medical information?",
    answer:
      "Aadhaar and medical answers stay off public fighter pages. Organizers can see the full registration, including the photograph, in the admin panel.",
  },
  {
    question: "How do rankings points work for a win?",
    answer:
      "The public rankings board gives 3 points for each win. That count is a placeholder until the official formula is set. The seeding demo is a separate example of how a bracket can be ordered.",
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
    question: "How do I contact Up ’n Roll?",
    answer:
      "Message @up.n.roll on Instagram. This assistant only answers from the published FAQ. For anything else, contact the organizers there.",
  },
];

/** Short prompts shown in the chat. Each one is written to hit one FAQ above. */
export const CHAT_PROMPTS = [
  "How do I register?",
  "How do I pay?",
  "What is the refund if I cancel?",
  "Can I transfer my spot to a teammate?",
  "What should I wear?",
  "Which mat am I on?",
] as const;
