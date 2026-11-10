import "server-only";
import { cache } from "react";
import { Types } from "mongoose";
import { connectDB } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { FighterProfile } from "@/server/models/FighterProfile";
import type { UserRole } from "@/server/models/User";
import { NotFoundError, AppError } from "@/server/http/errors";

/** First token of a full name for “Hi, Rhea” style copy. */
export function firstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function titleFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "friend";
  const cleaned = local.replace(/[._+-]+/g, " ").trim();
  if (!cleaned) return "friend";
  return cleaned
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Resolve the name we put on dashboards and chrome. Prefer User, then fighter profile, then email. */
export const resolveDisplayName = cache(async function resolveDisplayName(userId: string, email: string): Promise<string> {
  await connectDB();
  const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : null;
  const [user, profile] = await Promise.all([
    // Collection read so a stale in-memory schema cannot hide displayName.
    userObjectId
      ? User.collection.findOne({ _id: userObjectId }, { projection: { displayName: 1 } })
      : Promise.resolve(null),
    FighterProfile.findOne({ userId }).select("displayName").lean(),
  ]);
  const fromUser = typeof user?.displayName === "string" ? user.displayName.trim() : "";
  if (fromUser) return fromUser;
  const fromProfile = profile?.displayName?.trim();
  if (fromProfile) return fromProfile;
  return titleFromEmail(email);
});

export function portalGreeting(fullName: string, role: UserRole): string {
  const name = firstName(fullName);
  const hour = new Date().getHours();

  if (role === "ADMIN") {
    if (hour < 12) return `Morning, ${name}. The house is open.`;
    if (hour < 18) return `Hi, ${name}. You're on the desk.`;
    return `Evening, ${name}. Still running the card.`;
  }

  if (hour < 12) return `Good morning, ${name}.`;
  if (hour < 18) return `Hi, ${name}. Ready when you are.`;
  return `Hey, ${name}. Evening on the mats.`;
}

export function portalWelcomeLine(fullName: string, role: UserRole): string {
  const name = firstName(fullName);
  if (role === "ADMIN") return `Welcome back, ${name}.`;
  return `Welcome in, ${name}.`;
}

/**
 * Browser-tab identity by role — fighter shows their name, admin shows the desk.
 * Root metadata template appends `· Up 'n Roll`.
 */
export function portalTabTitle(fullName: string, role: UserRole): string {
  if (role === "ADMIN") return "Admin";
  return firstName(fullName);
}

export async function updateUserDisplayName(userId: string, displayName: string): Promise<string> {
  await connectDB();
  const nextName = displayName.trim();
  if (!Types.ObjectId.isValid(userId)) {
    throw new NotFoundError("Could not find your account to update.");
  }
  const _id = new Types.ObjectId(userId);

  // Bypass document middleware / strict schema casting so a stale in-memory
  // User model (compiled before displayName existed) cannot silently drop the field.
  const result = await User.collection.updateOne({ _id }, { $set: { displayName: nextName } });
  if (result.matchedCount === 0) {
    throw new NotFoundError("Could not find your account to update.");
  }

  const saved = await User.collection.findOne({ _id }, { projection: { displayName: 1 } });
  if (saved?.displayName !== nextName) {
    throw new AppError("SAVE_FAILED", "Name did not save. Try again.", 500);
  }
  return nextName;
}
