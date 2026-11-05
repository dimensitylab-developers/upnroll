import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { Registration } from "@/server/models/Registration";
import { writeAuditLog } from "@/server/audit/log";
import { listMatchesForFighter } from "./matchService";
import { NotFoundError } from "@/server/http/errors";

export async function updateFighterProfile(
  userId: string,
  input: { displayName: string; gym?: string; discipline?: string }
) {
  await connectDB();
  const profile = await FighterProfile.findOne({ userId });
  if (!profile) throw new NotFoundError("Fighter profile not found.");

  profile.displayName = input.displayName;
  if (input.gym !== undefined) profile.gym = input.gym;
  if (input.discipline !== undefined) profile.discipline = input.discipline;
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
  return FighterProfile.find().sort({ displayName: 1 }).lean();
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
    profile,
    record: { wins, losses },
    history: decided,
  };
}
