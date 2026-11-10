/**
 * Local fixture. Publishes the Superfight Series, seeds demo fighters,
 * and builds a full “James Lewis” fighter dashboard demo (profile + card + matches).
 * Run with: npm run seed-demo
 */
import { connectDB } from "../backend/db/connect";
import { Event } from "../backend/models/Event";
import { Division } from "../backend/models/Division";
import { User } from "../backend/models/User";
import { FighterProfile } from "../backend/models/FighterProfile";
import { Registration } from "../backend/models/Registration";
import { PaymentSubmission } from "../backend/models/PaymentSubmission";
import { RegistrationRequest } from "../backend/models/RegistrationRequest";
import { Bracket } from "../backend/models/Bracket";
import { Match } from "../backend/models/Match";
import { hashPassword } from "../backend/auth/password";
import { writeAuditLog } from "../backend/audit/log";

const SERIES_SLUG = "up-n-roll-superfight-series";
const DEMO_PASSWORD = "DemoFighter1!";
const JAMES_EMAIL = "james@upnroll.local";
const JAMES_PASSWORD = "JamesDemo123!";
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL?.toLowerCase().trim() || "admin@upnroll.local";

const DIVISIONS = [
  "Men Beginner −55 kg",
  "Men Beginner −65 kg",
  "Men Beginner −75 kg",
  "Men Beginner −85 kg",
  "Men Intermediate −55 kg",
  "Men Intermediate −65 kg",
  "Men Intermediate −75 kg",
  "Men Intermediate −85 kg",
  "Women Beginner −55 kg",
  "Women Beginner −60 kg",
  "Women Beginner +60 kg",
  "Women Intermediate −55 kg",
  "Women Intermediate −60 kg",
  "Women Intermediate +60 kg",
];

const DEMO_FIGHTERS = [
  {
    email: "demo.rhea@upnroll.local",
    displayName: "Rhea Kolhapure",
    slug: "demo-rhea-kolhapure",
    gender: "Female",
    dateOfBirth: "1999-08-12",
    age: 26,
    mobile: "9876500001",
    cityState: "Pune, MH",
    academy: "Ironclad BJJ",
    headCoach: "Coach Irani",
    beltRank: "Purple",
    yearsTraining: 6,
    weightDivision: "Lightweight",
    bloodGroup: "B+",
    hasAllergies: true,
    allergiesDetail: "Mild latex",
  },
  {
    email: "demo.devansh@upnroll.local",
    displayName: "Devansh Oak",
    slug: "demo-devansh-oak",
    gender: "Male",
    dateOfBirth: "1997-03-04",
    age: 28,
    mobile: "9876500002",
    cityState: "Mumbai, MH",
    academy: "Kaizen Combat Club",
    headCoach: "Coach Oak Sr.",
    beltRank: "Blue",
    yearsTraining: 4,
    weightDivision: "Welterweight",
    bloodGroup: "O+",
    hasMedicalCondition: true,
    medicalConditionDetail: "Old shoulder sprain — cleared to compete",
  },
  {
    email: "demo.meher@upnroll.local",
    displayName: "Meher Ashtekar",
    slug: "demo-meher-ashtekar",
    gender: "Female",
    dateOfBirth: "2001-11-21",
    age: 24,
    mobile: "9876500003",
    cityState: "Nagpur, MH",
    academy: "Red Pine Academy",
    headCoach: "Coach Ashtekar",
    beltRank: "Brown",
    yearsTraining: 8,
    weightDivision: "Featherweight",
    bloodGroup: "A+",
  },
] as const;

const JAMES = {
  email: JAMES_EMAIL,
  displayName: "James Lewis",
  slug: "james-lewis",
  gender: "Male",
  dateOfBirth: "1996-06-18",
  age: 29,
  mobile: "9876512345",
  cityState: "Bengaluru, KA",
  academy: "Up 'n Roll House",
  headCoach: "Coach Suraj",
  beltRank: "Purple",
  yearsTraining: 5,
  weightDivision: "Men Intermediate −75 kg",
  bloodGroup: "O+",
  nationality: "Indian",
  aadhaar: "123456789012",
  emergencyContactName: "Alex Lewis",
  emergencyRelationship: "Sibling",
  heardAbout: "Building the house",
  hasMedicalCondition: false,
  medicalConditionDetail: "",
  hasAllergies: false,
  allergiesDetail: "",
} as const;

type DemoFighter = (typeof DEMO_FIGHTERS)[number] | typeof JAMES;

async function upsertDemoFighter(demo: DemoFighter, password = DEMO_PASSWORD) {
  let user = await User.findOne({ email: demo.email });
  if (!user) {
    user = await User.create({
      email: demo.email,
      passwordHash: await hashPassword(password),
      role: "FIGHTER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
      displayName: demo.displayName,
    });
  } else {
    user.displayName = demo.displayName;
    user.emailVerified = true;
    user.emailVerifiedAt = user.emailVerifiedAt ?? new Date();
    user.status = "ACTIVE";
    user.passwordHash = await hashPassword(password);
    await user.save();
  }

  const profileFields = {
    displayName: demo.displayName,
    slug: demo.slug,
    gym: demo.academy,
    discipline: "No-Gi",
    dateOfBirth: demo.dateOfBirth,
    age: demo.age,
    gender: demo.gender,
    mobile: demo.mobile,
    nationality: "nationality" in demo ? demo.nationality : "Indian",
    aadhaar: "aadhaar" in demo ? demo.aadhaar : "999988887777",
    cityState: demo.cityState,
    emergencyContactName: "emergencyContactName" in demo ? demo.emergencyContactName : "Demo Contact",
    emergencyRelationship: "emergencyRelationship" in demo ? demo.emergencyRelationship : "Family",
    bloodGroup: demo.bloodGroup,
    academy: demo.academy,
    headCoach: demo.headCoach,
    beltRank: demo.beltRank,
    yearsTraining: demo.yearsTraining,
    weightDivision: demo.weightDivision,
    heardAbout: "heardAbout" in demo ? demo.heardAbout : "Demo seed for admin roster",
    hasMedicalCondition: "hasMedicalCondition" in demo ? Boolean(demo.hasMedicalCondition) : false,
    medicalConditionDetail: "medicalConditionDetail" in demo ? String(demo.medicalConditionDetail) : "",
    hasAllergies: "hasAllergies" in demo ? Boolean(demo.hasAllergies) : false,
    allergiesDetail: "allergiesDetail" in demo ? String(demo.allergiesDetail) : "",
    takingMedication: false,
    medicallyFit: true,
    waiverAcceptedAt: new Date(),
  };

  const before = await FighterProfile.findOne({ userId: user._id }).select("_id").lean();
  const profile = await FighterProfile.findOneAndUpdate(
    { userId: user._id },
    { $set: { userId: user._id, ...profileFields }, $setOnInsert: {} },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  if (!before) {
    await writeAuditLog({
      actorId: String(user._id),
      action: "USER_REGISTERED",
      targetType: "User",
      targetId: String(user._id),
    });
    await writeAuditLog({
      actorId: String(user._id),
      action: "FIGHTER_PROFILE_CREATED",
      targetType: "FighterProfile",
      targetId: String(profile!._id),
    });
  }

  await writeAuditLog({
    actorId: String(user._id),
    action: "USER_LOGIN",
    targetType: "User",
    targetId: String(user._id),
    after: { via: "demo_seed" },
  });

  return { user, profile: profile! };
}

async function seedJamesDashboard(eventId: unknown, opponentUserId: unknown) {
  const { user: james, profile } = await upsertDemoFighter(JAMES, JAMES_PASSWORD);
  const division = await Division.findOne({ eventId, name: "Men Intermediate −75 kg" });
  if (!division) throw new Error("James division missing");

  const opponent = await User.findById(opponentUserId);
  if (!opponent) throw new Error("Opponent missing");

  let jamesReg = await Registration.findOne({
    userId: james._id,
    eventId,
    status: { $in: ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"] },
  });
  if (!jamesReg) {
    jamesReg = await Registration.create({
      userId: james._id,
      eventId,
      divisionId: division._id,
      status: "CONFIRMED",
      statusHistory: [
        { status: "AWAITING_PAYMENT", at: new Date(Date.now() - 86_400_000), note: "demo create" },
        { status: "CONFIRMED", at: new Date(), note: "demo confirm" },
      ],
    });
    await Division.updateOne({ _id: division._id }, { $inc: { filledCount: 1 } });
  } else {
    jamesReg.status = "CONFIRMED";
    await jamesReg.save();
  }

  let oppReg = await Registration.findOne({
    userId: opponent._id,
    eventId,
    status: { $in: ["AWAITING_PAYMENT", "PENDING_VERIFICATION", "CONFIRMED"] },
  });
  if (!oppReg) {
    oppReg = await Registration.create({
      userId: opponent._id,
      eventId,
      divisionId: division._id,
      status: "CONFIRMED",
      statusHistory: [{ status: "CONFIRMED", at: new Date(), note: "demo opponent" }],
    });
    await Division.updateOne({ _id: division._id }, { $inc: { filledCount: 1 } });
  }

  await PaymentSubmission.findOneAndUpdate(
    { registrationId: jamesReg._id, status: "APPROVED" },
    {
      $set: {
        registrationId: jamesReg._id,
        userId: james._id,
        eventId,
        expectedAmountMinorUnits: 150000,
        submittedUtr: "DEMOUTR123456",
        status: "APPROVED",
        submittedAt: new Date(Date.now() - 43_200_000),
        reviewedAt: new Date(Date.now() - 3_600_000),
        reviewNote: "Demo approve for James dashboard",
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  await RegistrationRequest.findOneAndUpdate(
    { userId: james._id, registrationId: jamesReg._id, type: "TRANSFER", status: "PENDING" },
    {
      $set: {
        type: "TRANSFER",
        registrationId: jamesReg._id,
        userId: james._id,
        requestedDivisionId: (
          await Division.findOne({ eventId, name: "Men Intermediate −85 kg" }).select("_id")
        )?._id,
        reason: "Demo request — checking weight cut options before the card.",
        status: "PENDING",
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  const bracket = await Bracket.findOneAndUpdate(
    { divisionId: division._id },
    {
      $set: {
        eventId,
        divisionId: division._id,
        format: "SINGLE_ELIMINATION",
        seed: 1,
        participantRegistrationIds: [jamesReg._id, oppReg._id],
        roundsCount: 1,
        status: "PUBLISHED",
        version: 1,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const upcomingAt = new Date(Date.now() + 45 * 60_000);
  await Match.findOneAndUpdate(
    { bracketId: bracket!._id, round: 1, order: 1 },
    {
      $set: {
        eventId,
        divisionId: division._id,
        bracketId: bracket!._id,
        round: 1,
        order: 1,
        competitorARegistrationId: jamesReg._id,
        competitorBRegistrationId: oppReg._id,
        status: "SCHEDULED",
        scheduledAt: upcomingAt,
        mat: "1",
        winnerRegistrationId: null,
        resultMethod: "",
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  await Match.findOneAndUpdate(
    { bracketId: bracket!._id, round: 1, order: 2 },
    {
      $set: {
        eventId,
        divisionId: division._id,
        bracketId: bracket!._id,
        round: 1,
        order: 2,
        competitorARegistrationId: jamesReg._id,
        competitorBRegistrationId: oppReg._id,
        status: "COMPLETED",
        scheduledAt: new Date(Date.now() - 7 * 86_400_000),
        mat: "2",
        winnerRegistrationId: jamesReg._id,
        resultMethod: "Submission",
        resultRecordedAt: new Date(Date.now() - 7 * 86_400_000),
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  return {
    email: JAMES_EMAIL,
    password: JAMES_PASSWORD,
    displayName: profile.displayName,
    userId: String(james._id),
  };
}

async function main() {
  await connectDB();

  await Event.updateOne({ slug: "underground-arena-vol-4" }, { $set: { status: "DRAFT" } });

  const event = await Event.findOneAndUpdate(
    { slug: SERIES_SLUG },
    {
      name: "Up 'n Roll Superfight Series",
      slug: SERIES_SLUG,
      description: "Road to Super Fight.",
      venue: "Up 'n Roll mats",
      startDate: new Date("2027-01-23T10:00:00+05:30"),
      registrationOpensAt: new Date("2026-11-07T00:00:00+05:30"),
      registrationClosesAt: new Date("2027-01-22T23:59:00+05:30"),
      status: "REGISTRATION_OPEN",
      matCount: 2,
      paymentInstructions: { feeMinorUnits: 150000, currency: "INR", qrImageKey: "" },
    },
    { upsert: true, returnDocument: "after" }
  );

  for (const name of DIVISIONS) {
    await Division.findOneAndUpdate(
      { eventId: event._id, name },
      {
        $set: { eventId: event._id, name, discipline: "No-Gi", capacity: 16, feeMinorUnitsOverride: null },
        $setOnInsert: { filledCount: 0 },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
  }

  const admin = await User.findOne({ email: ADMIN_EMAIL, role: "ADMIN" });
  if (admin) {
    admin.displayName = "James";
    await admin.save();
  }

  const seededNames: string[] = [];
  let opponentId: unknown = null;
  for (const demo of DEMO_FIGHTERS) {
    const { user, profile } = await upsertDemoFighter(demo);
    seededNames.push(profile.displayName);
    if (demo.email === "demo.devansh@upnroll.local") opponentId = user._id;
  }

  if (!opponentId) throw new Error("Devansh opponent not seeded");
  const james = await seedJamesDashboard(event._id, opponentId);

  console.log(`Seeded "${event.name}" (${event._id}) with ${DIVISIONS.length} divisions.`);
  console.log(`Demo fighter sheets: ${seededNames.join(", ")}`);
  console.log(`Admin greeting name: James (${ADMIN_EMAIL})`);
  console.log(`James fighter login: ${james.email} / ${james.password}`);
  console.log(`James userId: ${james.userId}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
