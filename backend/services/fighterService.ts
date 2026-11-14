import "server-only";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { RankingRecord } from "@/server/models/RankingRecord";
import { User } from "@/server/models/User";
import { writeAuditLog } from "@/server/audit/log";
import { listPublicMatchHistory } from "./matchService";
import { NotFoundError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";
import { assertAdmin, assertFighter, type Actor } from "@/server/auth/actor";

export type AdminFighterView = {
  userId: string;
  displayName: string;
  email: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mobile: string;
  nationality: string;
  cityState: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  bloodGroup: string;
  academy: string;
  headCoach: string;
  beltRank: string;
  yearsTraining: number;
  careerWins: number;
  weightDivision: string;
  heardAbout: string;
  hasMedicalCondition: boolean;
  medicalConditionDetail: string;
  hasAllergies: boolean;
  allergiesDetail: string;
  takingMedication: boolean;
  medicallyFit: boolean;
  hasPhoto: boolean;
  hasAadhaarImage: boolean;
  waiverAcceptedAt: string | null;
};

type ProfileForAdmin = {
  userId: unknown;
  displayName?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  mobile?: string;
  nationality?: string;
  cityState?: string;
  emergencyContactName?: string;
  emergencyRelationship?: string;
  bloodGroup?: string;
  academy?: string;
  gym?: string;
  headCoach?: string;
  beltRank?: string;
  yearsTraining?: number;
  careerWins?: number;
  weightDivision?: string;
  heardAbout?: string;
  hasMedicalCondition?: boolean;
  medicalConditionDetail?: string;
  hasAllergies?: boolean;
  allergiesDetail?: string;
  takingMedication?: boolean;
  medicallyFit?: boolean;
  photoKey?: string;
  aadhaarImageKey?: string;
  waiverAcceptedAt?: Date | null;
};

export function toAdminFighterView(profile: ProfileForAdmin, email: string): AdminFighterView {
  return {
    userId: String(profile.userId),
    displayName: profile.displayName ?? "",
    email,
    dateOfBirth: profile.dateOfBirth ?? "",
    age: profile.age ?? 0,
    gender: profile.gender ?? "",
    mobile: profile.mobile ?? "",
    nationality: profile.nationality ?? "",
    cityState: profile.cityState ?? "",
    emergencyContactName: profile.emergencyContactName ?? "",
    emergencyRelationship: profile.emergencyRelationship ?? "",
    bloodGroup: profile.bloodGroup ?? "",
    academy: profile.academy || profile.gym || "",
    headCoach: profile.headCoach ?? "",
    beltRank: profile.beltRank ?? "",
    yearsTraining: profile.yearsTraining ?? 0,
    careerWins: profile.careerWins ?? 0,
    weightDivision: profile.weightDivision ?? "",
    heardAbout: profile.heardAbout ?? "",
    hasMedicalCondition: Boolean(profile.hasMedicalCondition),
    medicalConditionDetail: profile.medicalConditionDetail ?? "",
    hasAllergies: Boolean(profile.hasAllergies),
    allergiesDetail: profile.allergiesDetail ?? "",
    takingMedication: Boolean(profile.takingMedication),
    medicallyFit: Boolean(profile.medicallyFit),
    hasPhoto: Boolean(profile.photoKey),
    hasAadhaarImage: Boolean(profile.aadhaarImageKey?.trim()),
    waiverAcceptedAt: profile.waiverAcceptedAt ? new Date(profile.waiverAcceptedAt).toISOString() : null,
  };
}

export type FighterDetailsInput = {
  displayName: string;
  gym: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mobile: string;
  nationality: string;
  cityState: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  bloodGroup: string;
  academy: string;
  headCoach: string;
  beltRank: string;
  yearsTraining: number;
  careerWins: number;
  weightDivision: string;
  heardAbout: string;
  hasMedicalCondition: boolean;
  medicalConditionDetail: string;
  hasAllergies: boolean;
  allergiesDetail: string;
  takingMedication: boolean;
  medicallyFit: boolean;
  photoKey?: string;
  aadhaarImageKey?: string;
  waiverAcceptedAt?: Date;
  discipline?: string;
};

export async function updateFighterProfile(actor: Actor, input: FighterDetailsInput) {
  assertFighter(actor);
  await connectDB();
  const profile = await FighterProfile.findOne({ userId: actor.userId });
  if (!profile) throw new NotFoundError("Fighter profile not found.");

  profile.displayName = input.displayName;
  profile.gym = input.gym;
  profile.dateOfBirth = input.dateOfBirth;
  profile.age = input.age;
  profile.gender = input.gender;
  profile.mobile = input.mobile;
  profile.nationality = input.nationality;
  profile.cityState = input.cityState;
  profile.emergencyContactName = input.emergencyContactName;
  profile.emergencyRelationship = input.emergencyRelationship;
  profile.bloodGroup = input.bloodGroup;
  profile.academy = input.academy;
  profile.headCoach = input.headCoach;
  profile.beltRank = input.beltRank;
  profile.yearsTraining = input.yearsTraining;
  profile.careerWins = input.careerWins;
  profile.weightDivision = input.weightDivision;
  profile.heardAbout = input.heardAbout;
  profile.hasMedicalCondition = input.hasMedicalCondition;
  profile.medicalConditionDetail = input.medicalConditionDetail;
  profile.hasAllergies = input.hasAllergies;
  profile.allergiesDetail = input.allergiesDetail;
  profile.takingMedication = input.takingMedication;
  profile.medicallyFit = input.medicallyFit;
  if (input.photoKey) profile.photoKey = input.photoKey;
  if (input.aadhaarImageKey) profile.aadhaarImageKey = input.aadhaarImageKey;
  if (input.waiverAcceptedAt) profile.waiverAcceptedAt = input.waiverAcceptedAt;
  if (input.discipline) profile.discipline = input.discipline;
  await profile.save();
  await User.findByIdAndUpdate(actor.userId, { $set: { displayName: input.displayName } });

  await writeAuditLog({ actorId: actor.userId, action: "FIGHTER_PROFILE_UPDATED", targetType: "FighterProfile", targetId: String(profile._id) });
  return profile;
}

/** Fighter-dashboard feed: the authenticated fighter's own profile, or null if not yet created. */
export async function getFighterProfile(actor: Actor) {
  assertFighter(actor);
  await connectDB();
  return FighterProfile.findOne({ userId: actor.userId }).lean();
}

/** Admin-dashboard stat: total fighters registered on the platform. */
export async function countFighters(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  return FighterProfile.countDocuments();
}

/** Public hype-card fields only — never aadhaar, medical, mobile, or other PII. */
const PUBLIC_FIGHTER_FIELDS =
  "displayName slug gym academy discipline beltRank weightDivision photoKey userId";

export type PublicFighterCard = {
  displayName: string;
  slug: string;
  gym: string;
  academy: string;
  discipline: string;
  beltRank: string;
  weightDivision: string;
  hasPhoto: boolean;
  wins: number;
  losses: number;
  points: number;
  rank: number | null;
};

function toPublicCard(
  profile: {
    displayName?: string;
    slug?: string;
    gym?: string;
    academy?: string;
    discipline?: string;
    beltRank?: string;
    weightDivision?: string;
    photoKey?: string;
  },
  record?: { wins?: number; losses?: number; points?: number; rank?: number | null }
): PublicFighterCard {
  return {
    displayName: profile.displayName?.trim() || "Grappler",
    slug: profile.slug || "",
    gym: profile.gym?.trim() || "",
    academy: profile.academy?.trim() || "",
    discipline: profile.discipline?.trim() || "",
    beltRank: profile.beltRank?.trim() || "",
    weightDivision: profile.weightDivision?.trim() || "",
    hasPhoto: Boolean(profile.photoKey?.trim()),
    wins: record?.wins ?? 0,
    losses: record?.losses ?? 0,
    points: record?.points ?? 0,
    rank: record?.rank ?? null,
  };
}

/** Full grappler form for organizers. Aadhaar and medical answers stay off public pages. */
export async function listFightersForAdmin(actor: Actor) {
  assertAdmin(actor);
  await connectDB();
  const profiles = await FighterProfile.find().sort({ createdAt: -1 }).lean();
  const users = await User.find({ _id: { $in: profiles.map((profile) => profile.userId) } })
    .select("email")
    .lean();
  const emailById = new Map(users.map((user) => [String(user._id), user.email]));
  return profiles.map((profile) => toAdminFighterView(profile, emailById.get(String(profile.userId)) ?? ""));
}

/** One fighter’s full registration-style profile for the admin roster detail. */
export async function getFighterForAdmin(actor: Actor, userId: string): Promise<AdminFighterView> {
  assertAdmin(actor);
  const id = requireObjectId(userId, "fighter");
  await connectDB();
  const profile = await FighterProfile.findOne({ userId: id }).lean();
  if (!profile) throw new NotFoundError("Fighter not found.");
  const user = await User.findById(id).select("email").lean();
  return toAdminFighterView(profile, user?.email ?? "");
}

export async function listPublicFighters() {
  await connectDB();
  const [rows, rankingRows] = await Promise.all([
    FighterProfile.find()
      .sort({ displayName: 1 })
      .select(PUBLIC_FIGHTER_FIELDS)
      .lean(),
    RankingRecord.find().sort({ points: -1, wins: -1 }).lean(),
  ]);

  const rankByUserId = new Map(
    rankingRows.map((row, index) => [
      String(row.userId),
      { wins: row.wins, losses: row.losses, points: row.points, rank: index + 1 },
    ])
  );

  return rows.map((profile) => {
    const card = toPublicCard(profile, rankByUserId.get(String(profile.userId)));
    return { _id: String(profile._id), ...card };
  });
}

export async function getPublicFighterBySlug(slug: string) {
  await connectDB();
  const profile = await FighterProfile.findOne({ slug }).select(PUBLIC_FIGHTER_FIELDS).lean();
  if (!profile) throw new NotFoundError("Fighter not found.");

  const [record, ranking] = await Promise.all([
    listPublicMatchHistory(String(profile.userId)),
    RankingRecord.findOne({ userId: profile.userId }).lean(),
  ]);

  let rank: number | null = null;
  if (ranking) {
    const ahead = await RankingRecord.countDocuments({
      $or: [
        { points: { $gt: ranking.points } },
        { points: ranking.points, wins: { $gt: ranking.wins } },
      ],
    });
    rank = ahead + 1;
  }

  const card = toPublicCard(profile, {
    wins: ranking?.wins ?? record.wins,
    losses: ranking?.losses ?? record.losses,
    points: ranking?.points ?? 0,
    rank,
  });

  return {
    profile: {
      displayName: card.displayName,
      slug: card.slug,
      gym: card.gym,
      academy: card.academy,
      discipline: card.discipline,
      beltRank: card.beltRank,
      weightDivision: card.weightDivision,
      hasPhoto: card.hasPhoto,
    },
    record: { wins: card.wins, losses: card.losses, points: card.points, rank: card.rank },
    card,
    history: record.history,
  };
}

/** Open a public passport photo by slug — only if the fighter published a photo key. */
export async function getPublicFighterPhotoKeyBySlug(slug: string): Promise<string> {
  await connectDB();
  const profile = await FighterProfile.findOne({ slug }).select("photoKey").lean();
  const key = profile?.photoKey?.trim();
  if (!key) throw new NotFoundError("Photograph not found.");
  return key;
}
