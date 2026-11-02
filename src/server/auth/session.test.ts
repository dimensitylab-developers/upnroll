import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// Mock the DB/model layer — this test is about the auth *decision logic*
// (does getSession/requireRole correctly accept/reject a given state), not
// a DB integration test. Cookie signing itself is exercised for real
// (already covered by cookies.test.ts) to keep this test honest about what
// a tampered or missing cookie actually does.
vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));

const mockSessionFindOne = vi.fn();
vi.mock("@/server/models/Session", () => ({
  Session: { findOne: (...args: unknown[]) => mockSessionFindOne(...args) },
}));

const mockUserFindById = vi.fn();
vi.mock("@/server/models/User", () => ({
  User: { findById: (...args: unknown[]) => mockUserFindById(...args) },
}));

const mockCookieStore = { get: vi.fn() };
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

beforeAll(() => {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
  process.env.SESSION_SECRET = "b".repeat(32);
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSession / requireSession / requireRole", () => {
  it("returns null when there is no session cookie", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { getSession } = await import("./session");
    expect(await getSession()).toBeNull();
  });

  it("returns null when the cookie is tampered (fails signature check before any DB call)", async () => {
    mockCookieStore.get.mockReturnValue({ value: "fake-token.fake-signature" });
    const { getSession } = await import("./session");
    expect(await getSession()).toBeNull();
    expect(mockSessionFindOne).not.toHaveBeenCalled();
  });

  it("returns null when the session exists but is expired", async () => {
    const { packCookieValue } = await import("./cookies");
    mockCookieStore.get.mockReturnValue({ value: packCookieValue("raw-token") });
    mockSessionFindOne.mockReturnValue({
      lean: () => Promise.resolve({ userId: "u1", expiresAt: new Date(Date.now() - 1000) }),
    });
    const { getSession } = await import("./session");
    expect(await getSession()).toBeNull();
  });

  it("returns null when the user behind a valid session is disabled", async () => {
    const { packCookieValue } = await import("./cookies");
    mockCookieStore.get.mockReturnValue({ value: packCookieValue("raw-token") });
    mockSessionFindOne.mockReturnValue({
      lean: () => Promise.resolve({ userId: "u1", expiresAt: new Date(Date.now() + 100000) }),
    });
    mockUserFindById.mockReturnValue({ lean: () => Promise.resolve({ _id: "u1", role: "FIGHTER", status: "DISABLED" }) });
    const { getSession } = await import("./session");
    expect(await getSession()).toBeNull();
  });

  it("returns the user for a valid, active session", async () => {
    const { packCookieValue } = await import("./cookies");
    mockCookieStore.get.mockReturnValue({ value: packCookieValue("raw-token") });
    mockSessionFindOne.mockReturnValue({
      lean: () => Promise.resolve({ userId: "u1", expiresAt: new Date(Date.now() + 100000) }),
    });
    mockUserFindById.mockReturnValue({ lean: () => Promise.resolve({ _id: "u1", role: "FIGHTER", status: "ACTIVE" }) });
    const { getSession } = await import("./session");
    const result = await getSession();
    expect(result?.user.role).toBe("FIGHTER");
  });

  it("requireSession throws UnauthorizedError when there's no session", async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const { requireSession } = await import("./session");
    const { UnauthorizedError } = await import("@/server/http/errors");
    await expect(requireSession()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("requireRole throws ForbiddenError when the role doesn't match", async () => {
    const { packCookieValue } = await import("./cookies");
    mockCookieStore.get.mockReturnValue({ value: packCookieValue("raw-token") });
    mockSessionFindOne.mockReturnValue({
      lean: () => Promise.resolve({ userId: "u1", expiresAt: new Date(Date.now() + 100000) }),
    });
    mockUserFindById.mockReturnValue({ lean: () => Promise.resolve({ _id: "u1", role: "FIGHTER", status: "ACTIVE" }) });
    const { requireRole } = await import("./session");
    const { ForbiddenError } = await import("@/server/http/errors");
    await expect(requireRole("ADMIN")).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("requireRole passes through when the role matches", async () => {
    const { packCookieValue } = await import("./cookies");
    mockCookieStore.get.mockReturnValue({ value: packCookieValue("raw-token") });
    mockSessionFindOne.mockReturnValue({
      lean: () => Promise.resolve({ userId: "u1", expiresAt: new Date(Date.now() + 100000) }),
    });
    mockUserFindById.mockReturnValue({ lean: () => Promise.resolve({ _id: "u1", role: "ADMIN", status: "ACTIVE" }) });
    const { requireRole } = await import("./session");
    const result = await requireRole("ADMIN");
    expect(result.user.role).toBe("ADMIN");
  });
});
