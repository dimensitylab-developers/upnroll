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

/** Canonical roles plus legacy "FIGHTER" accepted as input and normalized to GRAPPLER. */
const ROLES = new Set<string>(["GRAPPLER", "ADMIN", "FIGHTER"]);

function normalizeRole(role: string): UserRole {
  if (role === "FIGHTER") return "GRAPPLER";
  return role as UserRole;
}

export function actorFromSession(session: SessionLike): Actor {
  const userId = String(session.user._id ?? "");
  if (!userId) throw new UnauthorizedError("Authentication required.");
  if (!ROLES.has(session.user.role)) {
    throw new ForbiddenError("You do not have access to this resource.");
  }
  return Object.freeze({
    userId,
    role: normalizeRole(session.user.role),
  });
}

export function assertAdmin(actor: Actor): void {
  if (actor.role !== "ADMIN") throw new ForbiddenError("You do not have access to this resource.");
}

export function assertGrappler(actor: Actor): void {
  if (actor.role !== "GRAPPLER") throw new ForbiddenError("You do not have access to this resource.");
}

/** @deprecated Prefer assertGrappler — kept for leftover imports. */
export function assertFighter(actor: Actor): void {
  assertGrappler(actor);
}
