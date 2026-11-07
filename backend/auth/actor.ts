import type { UserRole } from "@/server/models/User";
import { ForbiddenError, UnauthorizedError } from "@/server/http/errors";

/**
 * Trusted caller for backend services. Build one only with `actorFromSession`
 * after `getSession` or `requireSession`. Do not assemble this from form data.
 */
export type Actor = Readonly<{
  userId: string;
  role: UserRole;
}>;

type SessionLike = {
  user: {
    _id: unknown;
    role: string;
  };
};

const ROLES = new Set<UserRole>(["FIGHTER", "ADMIN"]);

export function actorFromSession(session: SessionLike): Actor {
  const userId = String(session.user._id ?? "");
  if (!userId) throw new UnauthorizedError("Authentication required.");
  if (!ROLES.has(session.user.role as UserRole)) {
    throw new ForbiddenError("You do not have access to this resource.");
  }
  return Object.freeze({
    userId,
    role: session.user.role as UserRole,
  });
}

export function assertAdmin(actor: Actor): void {
  if (actor.role !== "ADMIN") throw new ForbiddenError("You do not have access to this resource.");
}

export function assertFighter(actor: Actor): void {
  if (actor.role !== "FIGHTER") throw new ForbiddenError("You do not have access to this resource.");
}
