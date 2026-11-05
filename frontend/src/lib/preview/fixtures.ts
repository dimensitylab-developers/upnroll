/**
 * Fictional fixture data for /ui-preview only.
 * Nothing here is real client content, a real fighter, or an approved business rule —
 * see docs/decisions/open-decisions.md for everything still pending client sign-off.
 * Never imported by a production route.
 */

export type RegistrationStatus =
  | "DRAFT"
  | "AWAITING_PAYMENT"
  | "PENDING_VERIFICATION"
  | "CONFIRMED"
  | "CANCELLED"
  | "TRANSFER_REQUESTED"
  | "TRANSFERRED"
  | "REJECTED";

export type PaymentReviewStatus =
  | "AWAITING_SUBMISSION"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export const previewFighters = [
  { id: "f-01", name: "Rhea Kolhapure", slug: "rhea-kolhapure", division: "Lightweight", discipline: "Grappling", gym: "Ironclad BJJ", record: { w: 11, l: 2, d: 0 }, rank: 1 },
  { id: "f-02", name: "Devansh Oak", slug: "devansh-oak", division: "Welterweight", discipline: "MMA", gym: "Kaizen Combat Club", record: { w: 8, l: 3, d: 1 }, rank: 4 },
  { id: "f-03", name: "Meher Ashtekar", slug: "meher-ashtekar", division: "Featherweight", discipline: "Submission Wrestling", gym: "Red Pine Academy", record: { w: 14, l: 1, d: 0 }, rank: 1 },
  { id: "f-04", name: "Yusuf Pathan Jr.", slug: "yusuf-pathan-jr", division: "Lightweight", discipline: "Grappling", gym: "Ironclad BJJ", record: { w: 6, l: 5, d: 0 }, rank: 9 },
  { id: "f-05", name: "Noor Fatima Sheikh", slug: "noor-fatima-sheikh", division: "Bantamweight", discipline: "MMA", gym: "Phoenix Fight Team", record: { w: 9, l: 0, d: 0 }, rank: 1 },
  { id: "f-06", name: "Arav Deshmukh", slug: "arav-deshmukh", division: "Welterweight", discipline: "MMA", gym: "Kaizen Combat Club", record: { w: 5, l: 6, d: 0 }, rank: 12 },
] as const;

export const previewEvent = {
  slug: "underground-arena-vol-4",
  name: "Underground Arena Vol. 4",
  tagline: "Eight divisions. One night. No easy fights.",
  venue: "DY Patil Sports Complex, Navi Mumbai",
  date: "2026-12-13",
  registrationOpens: "2026-11-01",
  registrationCloses: "2026-11-25",
  status: "REGISTRATION_OPEN" as const,
  feeMinorUnits: 150000, // fictional placeholder, currency/amount pending OD-005
  currency: "INR",
};

export const previewDivisions = [
  { id: "d-lw", name: "Lightweight", discipline: "Grappling", capacity: 16, registered: 11 },
  { id: "d-ww", name: "Welterweight", discipline: "MMA", capacity: 16, registered: 16 },
  { id: "d-fw", name: "Featherweight", discipline: "Submission Wrestling", capacity: 8, registered: 5 },
  { id: "d-bw", name: "Bantamweight", discipline: "MMA", capacity: 8, registered: 8 },
];

export const previewBracket = {
  divisionName: "Welterweight — 16-fighter single elimination",
  rounds: [
    {
      name: "Round of 16",
      matches: [
        { id: "m1", a: "Devansh Oak", b: "Kiran Vellore", status: "COMPLETED", winner: "Devansh Oak" },
        { id: "m2", a: "Arav Deshmukh", b: "Farhan Qureshi", status: "COMPLETED", winner: "Farhan Qureshi" },
        { id: "m3", a: "Ishaan Bhide", b: "Tanish Rao", status: "IN_PROGRESS", winner: null },
        { id: "m4", a: "Omkar Salvi", b: "Rehan Fakih", status: "SCHEDULED", winner: null },
        { id: "m5", a: "Vivaan Sule", b: "Zaid Momin", status: "SCHEDULED", winner: null },
        { id: "m6", a: "Pranav Gowda", b: "Aditya Narkar", status: "SCHEDULED", winner: null },
        { id: "m7", a: "Imran Bagwan", b: "Soham Athavale", status: "SCHEDULED", winner: null },
        { id: "m8", a: "Rayyan Shaikh", b: "Kabir Lotlikar", status: "SCHEDULED", winner: null },
      ],
    },
    {
      name: "Quarter-finals",
      matches: [
        { id: "m9", a: "Devansh Oak", b: "Farhan Qureshi", status: "SCHEDULED", winner: null },
        { id: "m10", a: "TBD", b: "TBD", status: "PENDING", winner: null },
        { id: "m11", a: "TBD", b: "TBD", status: "PENDING", winner: null },
        { id: "m12", a: "TBD", b: "TBD", status: "PENDING", winner: null },
      ],
    },
    { name: "Semi-finals", matches: [
      { id: "m13", a: "TBD", b: "TBD", status: "PENDING", winner: null },
      { id: "m14", a: "TBD", b: "TBD", status: "PENDING", winner: null },
    ]},
    { name: "Final", matches: [
      { id: "m15", a: "TBD", b: "TBD", status: "PENDING", winner: null },
    ]},
  ],
};

export const previewDashboardScenarios: Record<
  string,
  { label: string; status: RegistrationStatus; paymentStatus: PaymentReviewStatus | null; nextAction: string }
> = {
  none: { label: "No registration", status: "DRAFT", paymentStatus: null, nextAction: "Browse events and register" },
  awaitingPayment: { label: "Awaiting payment", status: "AWAITING_PAYMENT", paymentStatus: "AWAITING_SUBMISSION", nextAction: "Submit QR payment proof" },
  pendingReview: { label: "Payment pending review", status: "PENDING_VERIFICATION", paymentStatus: "PENDING_REVIEW", nextAction: "Wait for admin review" },
  rejected: { label: "Payment rejected", status: "AWAITING_PAYMENT", paymentStatus: "REJECTED", nextAction: "Resubmit payment proof" },
  confirmedUnassigned: { label: "Confirmed, awaiting matchup", status: "CONFIRMED", paymentStatus: "APPROVED", nextAction: "Wait for bracket placement" },
  matchAssigned: { label: "Match assigned", status: "CONFIRMED", paymentStatus: "APPROVED", nextAction: "Prepare for Round of 16, Mat 2, 7:40 PM" },
  matchInProgress: { label: "Match in progress", status: "CONFIRMED", paymentStatus: "APPROVED", nextAction: "Live — Mat 2" },
  resultCompleted: { label: "Result completed", status: "CONFIRMED", paymentStatus: "APPROVED", nextAction: "View result and next-round status" },
};

export const previewAdminOverview = {
  activeEvent: previewEvent.name,
  totalRegistrations: 61,
  pendingPaymentReviews: 7,
  confirmedRegistrations: 48,
  unassignedParticipants: 5,
  upcomingMatches: 14,
  publishedResults: 9,
  openRequests: 3,
};

export const previewPaymentQueue = [
  { id: "p-101", fighter: "Arav Deshmukh", division: "Welterweight", amount: 1500, utr: "409872165310", submittedAt: "2026-11-18 14:02", status: "PENDING_REVIEW" as PaymentReviewStatus, duplicateFlag: false },
  { id: "p-102", fighter: "Noor Fatima Sheikh", division: "Bantamweight", amount: 1500, utr: "409872165310", submittedAt: "2026-11-18 14:05", status: "PENDING_REVIEW" as PaymentReviewStatus, duplicateFlag: true },
  { id: "p-103", fighter: "Yusuf Pathan Jr.", division: "Lightweight", amount: 1500, utr: "551203998214", submittedAt: "2026-11-17 09:22", status: "APPROVED" as PaymentReviewStatus, duplicateFlag: false },
  { id: "p-104", fighter: "Meher Ashtekar", division: "Featherweight", amount: 1500, utr: "118827364521", submittedAt: "2026-11-16 19:47", status: "REJECTED" as PaymentReviewStatus, duplicateFlag: false },
];

export const previewRequests = [
  { id: "r-1", type: "TRANSFER", fighter: "Devansh Oak", from: "Welterweight", to: "Middleweight", status: "PENDING", reason: "Missed fight-week weight target" },
  { id: "r-2", type: "CANCELLATION", fighter: "Zaid Momin", from: "Welterweight", to: null, status: "PENDING", reason: "Injury — unable to compete" },
  { id: "r-3", type: "TRANSFER", fighter: "Kabir Lotlikar", from: "Welterweight", to: "Welterweight (B)", status: "APPROVED", reason: "Division rebalancing" },
];

export const previewRankings = [
  { rank: 1, fighter: "Noor Fatima Sheikh", division: "Bantamweight", record: "9-0-0", points: 980 },
  { rank: 2, fighter: "Meher Ashtekar", division: "Featherweight", record: "14-1-0", points: 940 },
  { rank: 3, fighter: "Rhea Kolhapure", division: "Lightweight", record: "11-2-0", points: 905 },
];

export const previewChatScript = [
  { role: "user" as const, text: "When does registration close for Vol. 4?" },
  { role: "assistant" as const, text: "Registration for Underground Arena Vol. 4 closes 2026-11-25. You can register from the event page once you're logged in." },
  { role: "user" as const, text: "Can I change my division after paying?" },
  { role: "assistant" as const, text: "Division transfers go through an admin review request after payment. Submit one from your dashboard under \"Requests.\"" },
  { role: "user" as const, text: "Do you offer refunds if I withdraw?" },
  { role: "assistant" as const, text: "I don't have an approved refund policy to share yet — please contact the event organizer directly for cancellation and refund questions." },
];
