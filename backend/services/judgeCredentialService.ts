import "server-only";
import { randomBytes } from "node:crypto";
import { connectDB } from "@/server/db/connect";
import { assertAdmin, type Actor } from "@/server/auth/actor";
import { Match } from "@/server/models/Match";
import { Bracket } from "@/server/models/Bracket";
import {
  MatchJudgeCredential,
  type MatchJudgeCredentialDoc,
} from "@/server/models/MatchJudgeCredential";
import { JudgeSession } from "@/server/models/JudgeSession";
import { hashPassword } from "@/server/auth/password";
import { writeAuditLog } from "@/server/audit/log";
import { NotFoundError, ConflictError, ValidationError } from "@/server/http/errors";
import { requireObjectId } from "@/server/validation/objectId";
import { withTransaction, bindSession, sessionOpts } from "@/server/db/transaction";

/** Large safe alphabet without ambiguous 0/O/1/I/l — cryptographically random. */
const CRED_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function randomCredentialPart(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CRED_ALPHABET[bytes[i]! % CRED_ALPHABET.length]!;
  }
  return out;
}

async function uniqueUsername(maxAttempts = 12): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const username = randomCredentialPart(10);
    const exists = await MatchJudgeCredential.exists({ username });
    if (!exists) return username;
  }
  throw new ConflictError("Could not allocate a unique judge username. Try again.");
}

const SCORABLE = new Set(["SCHEDULED", "LIVE", "DELAYED"]);

export async function generateMatchJudgeCredentials(actor: Actor, matchId: string) {
  assertAdmin(actor);
  requireObjectId(matchId, "match");
  await connectDB();

  return withTransaction(async (session) => {
    const match = await bindSession(Match.findById(matchId), session);
    if (!match) throw new NotFoundError("Match not found.");

    const bracket = await bindSession(Bracket.findById(match.bracketId), session);
    if (!bracket || bracket.status !== "PUBLISHED") {
      throw new ConflictError("Judge credentials can only be prepared for matches on a published bracket.");
    }
    if (!SCORABLE.has(match.status) && match.status !== "PENDING") {
      throw new ConflictError("Judge credentials cannot be issued for a completed or cancelled match.");
    }
    if (!match.competitorARegistrationId || !match.competitorBRegistrationId) {
      throw new ValidationError("Both competitors must be set before preparing judge access.");
    }

    const active = await bindSession(
      MatchJudgeCredential.findOne({ matchId, status: "ACTIVE" }),
      session
    );
    if (active) {
      throw new ConflictError("This match already has active judge credentials. Revoke or regenerate them.");
    }

    const username = await uniqueUsername();
    const password = randomCredentialPart(10);
    const passwordHash = await hashPassword(password);

    const [credential] = await MatchJudgeCredential.create(
      [
        {
          matchId: match._id,
          eventId: match.eventId,
          username,
          passwordHash,
          generation: 1,
          status: "ACTIVE",
          issuedBy: actor.userId,
          issuedAt: new Date(),
        },
      ],
      { session }
    );

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "JUDGE_CREDENTIALS_ISSUED",
        targetType: "MatchJudgeCredential",
        targetId: String(credential._id),
        after: { matchId, username, generation: 1 },
      },
      session
    );

    // Password returned once — never persisted in recoverable form.
    return {
      credentialId: String(credential._id),
      matchId,
      username,
      password,
      generation: 1,
    };
  });
}

export async function regenerateMatchJudgeCredentials(actor: Actor, matchId: string) {
  assertAdmin(actor);
  requireObjectId(matchId, "match");
  await connectDB();

  return withTransaction(async (session) => {
    const match = await bindSession(Match.findById(matchId), session);
    if (!match) throw new NotFoundError("Match not found.");
    if (match.status === "COMPLETED" || match.status === "CANCELLED" || match.status === "BYE") {
      throw new ConflictError("Cannot regenerate credentials for a finalized or cancelled match.");
    }

    const existing = await bindSession(
      MatchJudgeCredential.find({ matchId, status: "ACTIVE" }),
      session
    );
    for (const cred of existing) {
      cred.status = "REVOKED";
      cred.revokedAt = new Date();
      cred.revokedBy = actor.userId as unknown as MatchJudgeCredentialDoc["revokedBy"];
      await cred.save(sessionOpts(session));
      await JudgeSession.updateMany(
        { credentialId: cred._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
        sessionOpts(session)
      );
    }

    const username = await uniqueUsername();
    const password = randomCredentialPart(10);
    const passwordHash = await hashPassword(password);
    const nextGen = (existing[0]?.generation ?? 0) + 1;

    const [credential] = await MatchJudgeCredential.create(
      [
        {
          matchId: match._id,
          eventId: match.eventId,
          username,
          passwordHash,
          generation: nextGen,
          status: "ACTIVE",
          issuedBy: actor.userId,
          issuedAt: new Date(),
        },
      ],
      { session }
    );

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "JUDGE_CREDENTIALS_REGENERATED",
        targetType: "MatchJudgeCredential",
        targetId: String(credential._id),
        after: { matchId, username, generation: nextGen, revokedCount: existing.length },
      },
      session
    );

    return {
      credentialId: String(credential._id),
      matchId,
      username,
      password,
      generation: nextGen,
    };
  });
}

export async function revokeMatchJudgeCredentials(actor: Actor, matchId: string) {
  assertAdmin(actor);
  requireObjectId(matchId, "match");
  await connectDB();

  return withTransaction(async (session) => {
    const active = await bindSession(
      MatchJudgeCredential.find({ matchId, status: "ACTIVE" }),
      session
    );
    if (active.length === 0) throw new NotFoundError("No active judge credentials for this match.");

    for (const cred of active) {
      cred.status = "REVOKED";
      cred.revokedAt = new Date();
      cred.revokedBy = actor.userId as unknown as MatchJudgeCredentialDoc["revokedBy"];
      await cred.save(sessionOpts(session));
      await JudgeSession.updateMany(
        { credentialId: cred._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
        sessionOpts(session)
      );
    }

    await writeAuditLog(
      {
        actorId: actor.userId,
        action: "JUDGE_CREDENTIALS_REVOKED",
        targetType: "Match",
        targetId: matchId,
        after: { count: active.length },
      },
      session
    );
    return { revoked: active.length };
  });
}

export async function getActiveJudgeCredentialMeta(actor: Actor, matchId: string) {
  assertAdmin(actor);
  requireObjectId(matchId, "match");
  await connectDB();
  const cred = await MatchJudgeCredential.findOne({ matchId, status: "ACTIVE" })
    .select("username generation issuedAt issuedBy status")
    .lean();
  if (!cred) return null;
  return {
    credentialId: String(cred._id),
    username: cred.username,
    generation: cred.generation,
    issuedAt: cred.issuedAt,
    status: cred.status,
  };
}
