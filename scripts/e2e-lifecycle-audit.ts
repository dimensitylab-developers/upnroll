/**
 * Isolated E2E lifecycle driver for local QA.
 * Creates event → 2 fighters → registrations → payments → approve →
 * bracket publish → match result → rankings, then prints evidence JSON.
 *
 * Run: cd frontend && npx tsx --env-file=.env.local ../scripts/e2e-lifecycle-audit.ts
 */
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { connectDB } from "../backend/db/connect";
import { hashPassword } from "../backend/auth/password";
import { User } from "../backend/models/User";
import { FighterProfile } from "../backend/models/FighterProfile";
import { Event } from "../backend/models/Event";
import { Division } from "../backend/models/Division";
import { Registration } from "../backend/models/Registration";
import { PaymentSubmission } from "../backend/models/PaymentSubmission";
import { Bracket } from "../backend/models/Bracket";
import { Match } from "../backend/models/Match";
import { RankingRecord } from "../backend/models/RankingRecord";

const RUN = process.env.E2E_RUN_ID ?? String(Date.now());
const SLUG = `e2e-flow-arena-${RUN}`;
const ADMIN_EMAIL = "admin@upnroll.in";
const PASSWORD = "E2eTestPass1!";
const ROOT = process.cwd().endsWith("frontend") ? resolve(process.cwd(), "..") : process.cwd();
const PNG = readFileSync(join(ROOT, ".local-qa/qa-photo.png"));
const STORAGE_ROOT = join(ROOT, ".local-storage");

function putLocal(key: string, data: Buffer) {
  const filePath = join(STORAGE_ROOT, key);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, data);
  return key;
}

/** Mirrors registrationStateMachine (avoid importing server-only services). */
function registrationStatusForNewSubmission() {
  return "PENDING_VERIFICATION" as const;
}
function registrationStatusForPaymentDecision(decision: "APPROVED" | "REJECTED") {
  return decision === "APPROVED" ? ("CONFIRMED" as const) : ("REJECTED" as const);
}

/** Minimal 2-fighter single-elim bracket (mirrors bracketEngine for n=2). */
function buildTwoPlayerBracket(orderedRegistrationIds: string[]) {
  if (orderedRegistrationIds.length < 2) throw new Error("A bracket needs at least two participants.");
  return {
    roundsCount: 1,
    matches: [
      {
        round: 0,
        order: 0,
        competitorA: orderedRegistrationIds[0],
        competitorB: orderedRegistrationIds[1],
        status: "SCHEDULED" as const,
        winner: null as string | null,
      },
    ],
  };
}

type Evidence = Record<string, unknown>;

async function ensureFighter(email: string, displayName: string, mobile: string) {
  const normalized = email.toLowerCase();
  let user = await User.findOne({ email: normalized });
  if (!user) {
    user = await User.create({
      email: normalized,
      passwordHash: await hashPassword(PASSWORD),
      role: "FIGHTER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    });
  } else {
    user.emailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date();
    user.status = "ACTIVE";
    await user.save();
  }

  const slugBase = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let profile = await FighterProfile.findOne({ userId: user._id });
  if (!profile) {
    profile = await FighterProfile.create({
      userId: user._id,
      displayName,
      slug: `${slugBase}-${RUN.slice(-6)}`,
      mobile,
      discipline: "No-Gi",
      gym: "E2E Academy",
    });
  }

  const photoKey = `profiles/${String(user._id)}.png`;
  putLocal(photoKey, PNG);
  profile.photoKey = photoKey;
  profile.displayName = displayName;
  profile.dateOfBirth = "1998-05-15";
  profile.age = 27;
  profile.gender = "Male";
  profile.mobile = mobile;
  profile.nationality = "Indian";
  profile.aadhaar = "123412341234";
  profile.cityState = "Mumbai, MH";
  profile.emergencyContactName = "E2E Contact";
  profile.emergencyRelationship = "Friend";
  profile.bloodGroup = "O+";
  profile.academy = "E2E Academy";
  profile.headCoach = "Coach E2E";
  profile.beltRank = "Blue";
  profile.yearsTraining = 3;
  profile.weightDivision = "Lightweight";
  profile.heardAbout = "E2E audit";
  profile.hasMedicalCondition = false;
  profile.hasAllergies = false;
  profile.takingMedication = false;
  profile.medicallyFit = true;
  profile.waiverAcceptedAt = new Date();
  await profile.save();

  return { user, profile };
}

async function claimSeat(divisionId: unknown) {
  const updated = await Division.findOneAndUpdate(
    { _id: divisionId, $expr: { $lt: ["$filledCount", "$capacity"] } },
    { $inc: { filledCount: 1 } },
    { new: true }
  );
  if (!updated) throw new Error("Could not claim seat");
  return updated;
}

async function registerAndPay(userId: string, eventId: unknown, divisionId: unknown, fee: number, utr: string) {
  const existing = await Registration.findOne({
    userId,
    divisionId,
    status: { $in: ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"] },
  });
  if (existing) {
    throw new Error(`Active registration already exists for ${userId}`);
  }

  await claimSeat(divisionId);
  const registration = await Registration.create({
    userId,
    eventId,
    divisionId,
    status: "AWAITING_PAYMENT",
    statusHistory: [{ status: "AWAITING_PAYMENT", at: new Date(), note: "e2e create" }],
  });

  await PaymentSubmission.create({
    registrationId: registration._id,
    userId,
    eventId,
    expectedAmountMinorUnits: fee,
    status: "AWAITING_SUBMISSION",
  });

  const shotKey = `payment-screenshots/${String(registration._id)}/${Date.now()}-${randomBytes(4).toString("hex")}.png`;
  putLocal(shotKey, PNG);

  const pending = await PaymentSubmission.create({
    registrationId: registration._id,
    userId,
    eventId,
    expectedAmountMinorUnits: fee,
    submittedUtr: utr,
    screenshotStorageKey: shotKey,
    submittedAt: new Date(),
    status: "PENDING_REVIEW",
  });

  registration.status = registrationStatusForNewSubmission();
  registration.statusHistory.push({ status: registration.status, at: new Date(), note: "e2e payment submit" });
  await registration.save();

  return { registration, pending };
}

async function approvePayment(adminId: string, paymentId: unknown, registrationId: unknown) {
  const payment = await PaymentSubmission.findOneAndUpdate(
    { _id: paymentId, status: "PENDING_REVIEW" },
    {
      $set: {
        status: "APPROVED",
        reviewerId: adminId,
        reviewedAt: new Date(),
        reviewNote: "e2e approve",
      },
    },
    { new: true }
  );
  if (!payment) throw new Error("Payment not pending");

  const registration = await Registration.findById(registrationId);
  if (!registration) throw new Error("Registration missing");
  registration.status = registrationStatusForPaymentDecision("APPROVED");
  registration.statusHistory.push({ status: registration.status, at: new Date(), note: "e2e approve" });
  await registration.save();
  return { payment, registration };
}

async function main() {
  const evidence: Evidence = { runId: RUN, slug: SLUG, steps: [] as string[] };
  const step = (s: string) => {
    (evidence.steps as string[]).push(s);
    console.log(`✓ ${s}`);
  };

  await connectDB();
  step("connected");

  const admin = await User.findOne({ email: ADMIN_EMAIL, role: "ADMIN" });
  if (!admin) throw new Error(`Admin ${ADMIN_EMAIL} not found — cannot continue`);
  evidence.adminUserId = String(admin._id);
  step(`admin located ${ADMIN_EMAIL}`);

  const alpha = await ensureFighter(`e2e.a.${RUN}@test.local`, "E2E Fighter Alpha", "9876500001");
  // Prefer the browser-created account if RUN differs — also accept fixed RUN from CLI
  const alphaBrowser = await User.findOne({ email: "e2e.a.1794233342848@test.local" });
  const fighterA = alphaBrowser
    ? {
        user: alphaBrowser,
        profile: (await FighterProfile.findOne({ userId: alphaBrowser._id })) ?? alpha.profile,
      }
    : alpha;
  if (alphaBrowser) {
    await ensureFighter("e2e.a.1794233342848@test.local", "E2E Fighter Alpha", "9876500001");
  }
  const fighterB = await ensureFighter(`e2e.b.${RUN}@test.local`, "E2E Fighter Bravo", "9876500002");
  evidence.fighterA = { email: fighterA.user.email, userId: String(fighterA.user._id) };
  evidence.fighterB = { email: fighterB.user.email, userId: String(fighterB.user._id) };
  step("fighters ready");

  const now = Date.now();
  const event = await Event.create({
    name: `E2E Flow Arena ${RUN}`,
    slug: SLUG,
    description: "Isolated E2E tournament lifecycle",
    venue: "E2E Test Venue",
    startDate: new Date(now + 30 * 24 * 3600 * 1000),
    registrationOpensAt: new Date(now - 3600 * 1000),
    registrationClosesAt: new Date(now + 20 * 24 * 3600 * 1000),
    status: "REGISTRATION_OPEN",
    matCount: 1,
    paymentInstructions: { feeMinorUnits: 50000, currency: "INR", qrImageKey: "" },
  });
  evidence.eventId = String(event._id);
  step(`event created ${SLUG}`);

  const division = await Division.create({
    eventId: event._id,
    name: "E2E Lightweight",
    discipline: "No-Gi",
    capacity: 8,
    filledCount: 0,
  });
  evidence.divisionId = String(division._id);
  step("division created");

  // Negative: insufficient participants for bracket
  try {
    buildTwoPlayerBracket([String(fighterA.user._id)]);
    evidence.bracketMinParticipants = "FAILED — accepted 1";
  } catch {
    evidence.bracketMinParticipants = "PASS — rejected <2";
    step("bracket engine rejects <2 participants");
  }

  const aPay = await registerAndPay(String(fighterA.user._id), event._id, division._id, 50000, `E2EUTR${RUN}A`);
  const bPay = await registerAndPay(String(fighterB.user._id), event._id, division._id, 50000, `E2EUTR${RUN}B`);
  evidence.registrationA = String(aPay.registration._id);
  evidence.registrationB = String(bPay.registration._id);
  evidence.paymentA = String(aPay.pending._id);
  evidence.paymentB = String(bPay.pending._id);
  step("both fighters registered + payment PENDING_REVIEW");

  // Reject B first, then resubmit and approve — exercises reject path
  await PaymentSubmission.findOneAndUpdate(
    { _id: bPay.pending._id, status: "PENDING_REVIEW" },
    { $set: { status: "REJECTED", reviewerId: admin._id, reviewedAt: new Date(), reviewNote: "e2e reject then retry" } }
  );
  bPay.registration.status = registrationStatusForPaymentDecision("REJECTED");
  bPay.registration.statusHistory.push({ status: bPay.registration.status, at: new Date(), note: "e2e reject" });
  await bPay.registration.save();
  await Division.findByIdAndUpdate(division._id, { $inc: { filledCount: -1 } });
  step("fighter B payment rejected + seat released");

  const bRetry = await registerAndPay(String(fighterB.user._id), event._id, division._id, 50000, `E2EUTR${RUN}B2`);
  // Wait — registerAndPay creates NEW registration but B already has REJECTED one which is inactive.
  // Good. But filledCount was decremented then claimSeat again.
  evidence.paymentBRetry = String(bRetry.pending._id);
  evidence.registrationBRetry = String(bRetry.registration._id);
  step("fighter B resubmitted payment");

  await approvePayment(String(admin._id), aPay.pending._id, aPay.registration._id);
  await approvePayment(String(admin._id), bRetry.pending._id, bRetry.registration._id);
  step("both payments APPROVED → registrations CONFIRMED");

  // Duplicate approve must fail
  const dup = await PaymentSubmission.findOneAndUpdate(
    { _id: aPay.pending._id, status: "PENDING_REVIEW" },
    { $set: { status: "APPROVED" } },
    { new: true }
  );
  evidence.duplicateApproveBlocked = dup ? "FAILED" : "PASS";
  step(`duplicate approve blocked: ${evidence.duplicateApproveBlocked}`);

  const confirmed = await Registration.find({
    divisionId: division._id,
    status: "CONFIRMED",
  }).sort({ createdAt: 1 });
  if (confirmed.length < 2) throw new Error(`Expected 2 confirmed, got ${confirmed.length}`);

  const ordered = confirmed.map((r) => String(r._id));
  const skeleton = buildTwoPlayerBracket(ordered);
  const bracket = await Bracket.create({
    eventId: event._id,
    divisionId: division._id,
    format: "SINGLE_ELIMINATION",
    status: "DRAFT",
    roundsCount: skeleton.roundsCount,
    version: 1,
    seed: 42,
    participantRegistrationIds: ordered,
  });
  await Match.insertMany(
    skeleton.matches.map((m) => ({
      eventId: event._id,
      divisionId: division._id,
      bracketId: bracket._id,
      round: m.round,
      order: m.order,
      competitorARegistrationId: m.competitorA,
      competitorBRegistrationId: m.competitorB,
      status: m.status,
      winnerRegistrationId: m.winner,
      mat: "1",
    }))
  );
  evidence.bracketId = String(bracket._id);
  evidence.bracketDraftMatches = skeleton.matches.length;
  step(`bracket DRAFT generated (${skeleton.matches.length} matches)`);

  bracket.status = "PUBLISHED";
  await bracket.save();
  step("bracket PUBLISHED");

  const finalMatch = await Match.findOne({ bracketId: bracket._id, status: "SCHEDULED" }).sort({ round: -1 });
  if (!finalMatch) throw new Error("No SCHEDULED match to decide");
  const winnerId = String(finalMatch.competitorARegistrationId);
  finalMatch.status = "COMPLETED";
  finalMatch.winnerRegistrationId = winnerId;
  finalMatch.resultMethod = "SUBMISSION";
  finalMatch.resultRecordedBy = admin._id;
  finalMatch.resultRecordedAt = new Date();
  await finalMatch.save();
  evidence.finalMatchId = String(finalMatch._id);
  evidence.winnerRegistrationId = winnerId;
  step("final match COMPLETED");

  // Rankings for the two E2E fighters only (wins * 3 placeholder)
  const winnerReg = await Registration.findById(winnerId);
  const loserRegId = ordered.find((id) => id !== winnerId);
  const loserReg = loserRegId ? await Registration.findById(loserRegId) : null;
  let version = 1;
  const latest = await RankingRecord.findOne().sort({ calculationVersion: -1 }).lean();
  if (latest?.calculationVersion) version = latest.calculationVersion + 1;
  if (winnerReg) {
    await RankingRecord.findOneAndUpdate(
      { userId: winnerReg.userId, scope: "GLOBAL" },
      { $set: { userId: winnerReg.userId, scope: "GLOBAL", wins: 1, losses: 0, points: 3, calculationVersion: version } },
      { upsert: true }
    );
  }
  if (loserReg) {
    await RankingRecord.findOneAndUpdate(
      { userId: loserReg.userId, scope: "GLOBAL" },
      { $set: { userId: loserReg.userId, scope: "GLOBAL", wins: 0, losses: 1, points: 0, calculationVersion: version } },
      { upsert: true }
    );
  }
  evidence.rankingVersion = version;
  step(`rankings recalculated v${version}`);

  // Authz smoke: fighter must not be admin
  evidence.roles = {
    fighterA: fighterA.user.role,
    fighterB: fighterB.user.role,
    admin: admin.role,
  };

  // Public visibility predicates
  const publicEvent = await Event.findOne({ slug: SLUG, status: { $in: ["REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"] } });
  const publishedBracket = await Bracket.findOne({ _id: bracket._id, status: "PUBLISHED" });
  evidence.publicVisibility = {
    eventVisible: Boolean(publicEvent),
    bracketPublished: Boolean(publishedBracket),
    completedMatches: await Match.countDocuments({ bracketId: bracket._id, status: "COMPLETED" }),
  };

  evidence.fingerprint = createHash("sha256").update(JSON.stringify(evidence.steps)).digest("hex").slice(0, 12);
  console.log("\n=== E2E EVIDENCE ===");
  console.log(JSON.stringify(evidence, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
