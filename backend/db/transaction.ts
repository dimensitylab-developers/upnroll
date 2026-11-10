import type { ClientSession } from "mongoose";
import { connectDB } from "./connect";

export type DbSession = ClientSession | null | undefined;

export function sessionOpts(session: DbSession): { session?: ClientSession } {
  return session ? { session } : {};
}

export function isDuplicateKey(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;
}

export function bindSession<T extends { session(session: ClientSession): T }>(query: T, session: DbSession): T {
  return session ? query.session(session) : query;
}

/**
 * One business transaction on the shared Mongoose connection.
 * The callback must run database work sequentially. withTransaction retries
 * transient errors, so email, files, and cookies stay outside this callback.
 */
export async function withTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
  const mongoose = await connectDB();
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}
