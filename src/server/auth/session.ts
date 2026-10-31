import { randomBytes, createHash } from "node:crypto";
import type { Types } from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/server/db/connect";
import { Session, type SessionDoc } from "@/server/models/Session";
import { User, type UserDoc } from "@/server/models/User";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, packCookieValue, unpackCookieValue } from "./cookies";
import { UnauthorizedError, ForbiddenError } from "@/server/http/errors";
import type { UserRole } from "@/server/models/User";

type LeanUser = UserDoc & { _id: Types.ObjectId };

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function createSession(userId: string, userAgent?: string): Promise<void> {
  await connectDB();

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await Session.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt,
    userAgent,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, packCookieValue(rawToken), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = unpackCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (rawToken) {
    await connectDB();
    await Session.deleteOne({ tokenHash: hashToken(rawToken) });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<{ user: LeanUser; session: SessionDoc } | null> {
  const cookieStore = await cookies();
  const rawToken = unpackCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!rawToken) return null;

  await connectDB();
  const session = await Session.findOne({ tokenHash: hashToken(rawToken) }).lean();
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  const user = await User.findById(session.userId).lean();
  if (!user || user.status !== "ACTIVE") return null;

  return { user, session };
}

/** For Server Actions / route handlers: throws instead of redirecting. */
export async function requireSession() {
  const result = await getSession();
  if (!result) throw new UnauthorizedError("Authentication required.");
  return result;
}

export async function requireRole(role: UserRole) {
  const result = await requireSession();
  if (result.user.role !== role) throw new ForbiddenError("You do not have access to this resource.");
  return result;
}
