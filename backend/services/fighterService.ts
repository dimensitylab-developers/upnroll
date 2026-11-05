import "server-only";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { writeAuditLog } from "@/server/audit/log";
import { listPublicMatchHistory } from "./matchService";
import { NotFoundError } from "@/server/http/errors";
import { assertAdmin, assertFighter, type Actor } from "@/server/auth/actor";

export type FighterDetailsInput = {
  displayName: string;
  gym: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mobile: string;
  nationality: string;
  aadhaar: string;
  cityState: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  bloodGroup: string;
  academy: string;
  headCoach: string;
  beltRank: string;
  yearsTraining: number;
  weightDivision: string;
  heardAbout: string;
  hasMedicalCondition: boolean;
  medicalConditionDetail: string;
  hasAllergies: boolean;
  allergiesDetail: string;
  takingMedication: boolean;
  medicallyFit: boolean;
  photoKey?: string;
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
  profile.aadhaar = input.aadhaar;
  profile.cityState = input.cityState;
  profile.emergencyContactName = input.emergencyContactName;
  profile.emergencyRelationship = input.emergencyRelationship;
  profile.bloodGroup = input.bloodGroup;
  profile.academy = input.academy;
  profile.headCoach = input.headCoach;
  profile.beltRank = input.beltRank;
  profile.yearsTraining = input.yearsTraining;
  profile.weightDivision = input.weightDivision;
  profile.heardAbout = input.heardAbout;
  profile.hasMedicalCondition = input.hasMedicalCondition;
  profile.medicalConditionDetail = input.medicalConditionDetail;
  profile.hasAllergies = input.hasAllergies;
  profile.allergiesDetail = input.allergiesDetail;
  profile.takingMedication = input.takingMedication;
  profile.medicallyFit = input.medicallyFit;
  if (input.photoKey) profile.photoKey = input.photoKey;
  if (input.waiverAcceptedAt) profile.waiverAcceptedAt = input.waiverAcceptedAt;
  if (input.discipline) profile.discipline = input.discipline;
  await profile.save();

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

const PUBLIC_FIGHTER_FIELDS = "displayName slug gym discipline userId";

export async function listPublicFighters() {
  await connectDB();
  const rows = await FighterProfile.find().sort({ displayName: 1 }).select("displayName slug gym discipline").lean();
  return rows.map((p) => ({
    _id: String(p._id),
    displayName: p.displayName,
    slug: p.slug,
    gym: p.gym,
    discipline: p.discipline,
  }));
}

export async function getPublicFighterBySlug(slug: string) {
  await connectDB();
  const profile = await FighterProfile.findOne({ slug }).select(PUBLIC_FIGHTER_FIELDS).lean();
  if (!profile) throw new NotFoundError("Fighter not found.");

  const record = await listPublicMatchHistory(String(profile.userId));

  return {
    profile: {
      displayName: profile.displayName,
      gym: profile.gym,
      discipline: profile.discipline,
    },
    record: { wins: record.wins, losses: record.losses },
    history: record.history,
  };
}
