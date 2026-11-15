import { describe, it, expect } from "vitest";
import { actorFromSession, assertAdmin, assertFighter, assertGrappler } from "./actor";
import { ForbiddenError, UnauthorizedError } from "@/server/http/errors";

describe("actorFromSession", () => {
  it("freezes an actor built from a validated session", () => {
    const actor = actorFromSession({ user: { _id: "u1", role: "ADMIN" } });
    expect(actor).toEqual({ userId: "u1", role: "ADMIN" });
    expect(Object.isFrozen(actor)).toBe(true);
  });

  it("rejects a session with no user id", () => {
    expect(() => actorFromSession({ user: { _id: "", role: "ADMIN" } })).toThrow(UnauthorizedError);
  });

  it("rejects a role that is not GRAPPLER or ADMIN", () => {
    expect(() => actorFromSession({ user: { _id: "u1", role: "OWNER" } })).toThrow(ForbiddenError);
  });

  it("normalizes legacy FIGHTER role to GRAPPLER", () => {
    const actor = actorFromSession({ user: { _id: "u1", role: "FIGHTER" } });
    expect(actor).toEqual({ userId: "u1", role: "GRAPPLER" });
  });
});

describe("role assertions", () => {
  const admin = Object.freeze({ userId: "a", role: "ADMIN" as const });
  const grappler = Object.freeze({ userId: "f", role: "GRAPPLER" as const });

  it("allows the matching role", () => {
    expect(() => assertAdmin(admin)).not.toThrow();
    expect(() => assertGrappler(grappler)).not.toThrow();
    expect(() => assertFighter(grappler)).not.toThrow();
  });

  it("rejects the other role", () => {
    expect(() => assertAdmin(grappler)).toThrow(ForbiddenError);
    expect(() => assertGrappler(admin)).toThrow(ForbiddenError);
    expect(() => assertFighter(admin)).toThrow(ForbiddenError);
  });
});
