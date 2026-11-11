/**
 * Questions athletes actually ask. The chatbot matches these titles by
 * keyword, so each title keeps the words people type (pay, refund, mat, photo).
 */
export const STARTER_FAQS: { question: string; answer: string }[] = [
  {
    question: "How do I register for an event?",
    answer:
      "Create a fighter account with your grappler details and a passport photo. Sign in, choose an open division, tick both Consent and Agreement, then continue to payment. If the event has a coupon field, enter a valid code before you submit.",
  },
  {
    question: "How do I pay the entry fee?",
    answer:
      "This site does not take card payments. Pay with the QR or payment option shown for that event, upload your proof if asked, then an admin reviews it before your place is confirmed. The fee is the one published on that event — coupons can change the amount when they apply.",
  },
  {
    question: "Can I use a coupon or promo code?",
    answer:
      "Yes, when an event has coupons enabled. Enter the code on the registration form before you finish. A valid code can reserve a discount while you complete payment. Expired, maxed-out, or invalid codes are rejected with a clear error.",
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
      "The organizer sets how many mats are active, and each open match is assigned to one of them. Your dashboard and match list only show the mat you are on. Live announcements on the site also call out mat assignments when a bout is up.",
  },
  {
    question: "When should I warm up?",
    answer:
      "When your bout is inside 15 minutes, your dashboard shows a warm-up note. Fight-day reminders and notifications can also push that cue. Check your fighter notifications panel on event day.",
  },
  {
    question: "Do I get fight-night notifications?",
    answer:
      "Yes. Your fighter desk has a notifications area for reminders and event messages. Organizers can also run outbox jobs for fight-day reminders. Keep your contact details current on your profile.",
  },
  {
    question: "Do I need a passport photo or photograph?",
    answer:
      "Yes. A passport size photograph is required when you create your account. Use a JPG, PNG, or WebP under 1.5 MB. The picture appears in the passport box as soon as you choose the file, and it powers your public fighter card.",
  },
  {
    question: "What is the public fighter card?",
    answer:
      "Each fighter gets a shareable hype card with photo, record, and public profile details — no private ID or medical data. You can open it from your fighter desk and from public rankings or fighter pages.",
  },
  {
    question: "Who can see my Aadhaar and medical information?",
    answer:
      "Aadhaar and medical answers stay off public fighter pages. Organizers can see the full registration, including the photograph, in the admin panel.",
  },
  {
    question: "How do rankings points work for a win?",
    answer:
      "The public rankings board gives 3 points for each win. The podium shows gold, silver, and bronze at the top of the board. That points count is a placeholder until the official formula is set. The seeding demo is a separate example of how a bracket can be ordered.",
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
      "Up ’n Roll Superfight is the featured card series on this site. Open registration, brackets, schedule, and results for that event live under Events when the card is published.",
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
