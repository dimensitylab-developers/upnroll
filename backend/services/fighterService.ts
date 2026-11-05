import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Registration } from "@/server/models/Registration";
import { writeAuditLog } from "@/server/audit/log";
import { listMatchesForFighter } from "./matchService";
import { NotFoundError } from "@/server/http/errors";

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

export async function updateFighterProfile(userId: string, input: FighterDetailsInput) {
  await connectDB();
  const profile = await FighterProfile.findOne({ userId });
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

  await writeAuditLog({ actorId: userId, action: "FIGHTER_PROFILE_UPDATED", targetType: "FighterProfile", targetId: String(profile._id) });
  return profile;
}

/** Fighter-dashboard feed: the authenticated fighter's own profile, or null if not yet created. */
export async function getFighterProfile(userId: string) {
  await connectDB();
  return FighterProfile.findOne({ userId }).lean();
}

/** Admin-dashboard stat: total fighters registered on the platform. */
export async function countFighters() {
  await connectDB();
  return FighterProfile.countDocuments();
}

export async function listPublicFighters() {
  await connectDB();
  return FighterProfile.find().sort({ displayName: 1 }).select("displayName slug gym discipline").lean();
}

export async function getPublicFighterBySlug(slug: string) {
  await connectDB();
  const profile = await FighterProfile.findOne({ slug }).lean();
  if (!profile) throw new NotFoundError("Fighter not found.");

  const [allMatches, ownRegistrations] = await Promise.all([
    listMatchesForFighter(String(profile.userId)),
    Registration.find({ userId: profile.userId }).lean(),
  ]);
  const ownRegistrationIds = new Set(ownRegistrations.map((r) => String(r._id)));
  const decided = allMatches.filter((m) => m.status === "COMPLETED" || m.status === "BYE");
  const wins = decided.filter((m) => m.winnerRegistrationId && ownRegistrationIds.has(String(m.winnerRegistrationId))).length;
  const losses = decided.length - wins;

  return {
    profile: {
      displayName: profile.displayName,
      gym: profile.gym,
      discipline: profile.discipline,
    },
    record: { wins, losses },
    history: decided,
  };
}
