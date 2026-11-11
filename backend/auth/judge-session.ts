import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { connectDB } from "@/server/db/connect";
import { JudgeSession } from "@/server/models/JudgeSession";
import { MatchJudgeCredential } from "@/server/models/MatchJudgeCredential";
import { Match } from "@/server/models/Match";
import { verifyPassword } from "@/server/auth/password";
import { packCookieValue, unpackCookieValue } from "./cookies";
import { JUDGE_SESSION_COOKIE_NAME, JUDGE_SESSION_MAX_AGE_SECONDS } from "./judge-cookie-name";
import { UnauthorizedError, ForbiddenError, ConflictError } from "@/server/http/errors";
import { checkRateLimit } from "@/server/http/rateLimit";
import { writeAuditLog } from "@/server/audit/log";

export type JudgeActor = Readonly<{
  kind: "JUDGE_SESSION";
  sessionId: string;
  credentialId: string;
  matchId: string;
  generation: number;
  username: string;
}>;

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

const SCORABLE = new Set(["SCHEDULED", "LIVE", "DELAYED"]);

export async function loginJudge(username: string, password: string, userAgent?: string): Promise<JudgeActor> {
  const rate = checkRateLimit(`judge-login:${username.trim().toLowerCase()}`);
  if (!rate.allowed) throw new UnauthorizedError("Invalid username or password.");

  await connectDB();
  const credential = await MatchJudgeCredential.findOne({ username: username.trim() });
  // Generic error — do not reveal which field failed.
  if (!credential || credential.status !== "ACTIVE") {
    throw new UnauthorizedError("Invalid username or password.");
  }

  const ok = await verifyPassword(password, credential.passwordHash);
  if (!ok) throw new UnauthorizedError("Invalid username or password.");

  const match = await Match.findById(credential.matchId).select("status").lean();
  if (!match || !SCORABLE.has(match.status)) {
    throw new ForbiddenError("Scoring access is not available for this match.");
  }

  const cookieStore = await cookies();
  const priorRaw = unpackCookieValue(cookieStore.get(JUDGE_SESSION_COOKIE_NAME)?.value);
  if (priorRaw) {
    await JudgeSession.deleteOne({ tokenHash: hashToken(priorRaw) });
  }

  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + JUDGE_SESSION_MAX_AGE_SECONDS * 1000);
  const session = await JudgeSession.create({
    credentialId: credential._id,
    matchId: credential.matchId,
    generation: credential.generation,
    tokenHash: hashToken(rawToken),
    expiresAt,
    userAgent: userAgent ?? "",
  });

  cookieStore.set(JUDGE_SESSION_COOKIE_NAME, packCookieValue(rawToken), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: JUDGE_SESSION_MAX_AGE_SECONDS,
  });

  await writeAuditLog({
    actorId: String(credential._id),
    action: "JUDGE_SESSION_LOGIN",
    targetType: "JudgeSession",
    targetId: String(session._id),
    after: {
      matchId: String(credential.matchId),
      credentialId: String(credential._id),
      note: "Shared match scoring login — not a verified real-world person",
    },
  });

  return Object.freeze({
    kind: "JUDGE_SESSION",
    sessionId: String(session._id),
    credentialId: String(credential._id),
    matchId: String(credential.matchId),
    generation: credential.generation,
    username: credential.username,
  });
}

export async function destroyJudgeSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = unpackCookieValue(cookieStore.get(JUDGE_SESSION_COOKIE_NAME)?.value);
  if (rawToken) {
    await connectDB();
    await JudgeSession.updateOne({ tokenHash: hashToken(rawToken) }, { $set: { revokedAt: new Date() } });
  }
  cookieStore.delete(JUDGE_SESSION_COOKIE_NAME);
}

const readJudgeSession = cache(async function readJudgeSession(): Promise<JudgeActor | null> {
  const cookieStore = await cookies();
  const rawToken = unpackCookieValue(cookieStore.get(JUDGE_SESSION_COOKIE_NAME)?.value);
  if (!rawToken) return null;

  await connectDB();
  const session = await JudgeSession.findOne({ tokenHash: hashToken(rawToken) }).lean();
  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) return null;

  const credential = await MatchJudgeCredential.findById(session.credentialId).lean();
  if (!credential || credential.status !== "ACTIVE") return null;
  if (credential.generation !== session.generation) return null;

  const match = await Match.findById(session.matchId).select("status").lean();
  if (!match || !SCORABLE.has(match.status)) return null;

  return Object.freeze({
    kind: "JUDGE_SESSION",
    sessionId: String(session._id),
    credentialId: String(credential._id),
    matchId: String(session.matchId),
    generation: session.generation,
    username: credential.username,
  });
});

export async function getJudgeSession(): Promise<JudgeActor | null> {
  await connection();
  return readJudgeSession();
}

export async function requireJudgeSession(): Promise<JudgeActor> {
  const session = await getJudgeSession();
  if (!session) throw new UnauthorizedError("Judge authentication required.");
  return session;
}

/** Re-check credential generation/revocation inside a mutation. */
export async function assertJudgeCanMutateMatch(judge: JudgeActor, matchId: string): Promise<void> {
  if (judge.matchId !== matchId) {
    throw new ForbiddenError("This scoring session cannot access that match.");
  }
  await connectDB();
  const credential = await MatchJudgeCredential.findById(judge.credentialId);
  if (!credential || credential.status !== "ACTIVE" || credential.generation !== judge.generation) {
    throw new ConflictError("Judge credentials were rotated or revoked. Sign in again.");
  }
  const session = await JudgeSession.findById(judge.sessionId);
  if (!session || session.revokedAt || session.generation !== judge.generation) {
    throw new ConflictError("Judge session is no longer valid. Sign in again.");
  }
  const match = await Match.findById(matchId).select("status").lean();
  if (!match || !SCORABLE.has(match.status)) {
    throw new ForbiddenError("Scoring is closed for this match.");
  }
}
