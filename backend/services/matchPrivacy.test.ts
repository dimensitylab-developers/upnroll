import { describe, it, expect, vi } from "vitest";
import { ForbiddenError } from "@/server/http/errors";

vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));

const registrationQueries: unknown[] = [];

vi.mock("@/server/models/Registration", () => ({
  Registration: {
    find: (query: unknown) => {
      registrationQueries.push(query);
      const rows = query && typeof query === "object" && "userId" in query ? [{ _id: "reg-1" }] : [];
      return {
        select: () => ({ lean: () => Promise.resolve(rows) }),
        lean: () => Promise.resolve(rows),
      };
    },
  },
}));

vi.mock("@/server/models/Match", () => ({
  Match: {
    find: () => ({
      sort: () => ({
        lean: () => Promise.resolve([
          {
            _id: "m1",
            status: "COMPLETED",
            eventId: "e1",
            divisionId: "d1",
            competitorARegistrationId: "reg-1",
            competitorBRegistrationId: "reg-2",
            winnerRegistrationId: "reg-1",
            resultMethod: "Points",
            secretNote: "private-corner-instruction",
            userId: "fighter-1",
          },
        ]),
      }),
    }),
  },
}));

vi.mock("@/server/models/Event", () => ({
  Event: {
    find: () => ({
      select: () => ({ lean: () => Promise.resolve([{ _id: "e1", name: "Open" }]) }),
      lean: () => Promise.resolve([{ _id: "e1", name: "Open" }]),
    }),
  },
}));

vi.mock("@/server/models/Division", () => ({
  Division: {
    find: () => ({ lean: () => Promise.resolve([{ _id: "d1", name: "Light" }]) }),
  },
}));

vi.mock("@/server/models/FighterProfile", () => ({
  FighterProfile: {
    find: () => ({
      select: () => ({
        lean: () => Promise.resolve([{ userId: "fighter-1", displayName: "Asha", aadhaar: "9999" }]),
      }),
      lean: () => Promise.resolve([{ userId: "fighter-1", displayName: "Asha", aadhaar: "9999" }]),
    }),
  },
}));

vi.mock("@/server/models/Bracket", () => ({ Bracket: {} }));
vi.mock("@/server/audit/log", () => ({ writeAuditLog: vi.fn() }));

const fighterA = Object.freeze({ userId: "fighter-a", role: "FIGHTER" as const });
const fighterB = Object.freeze({ userId: "fighter-b", role: "FIGHTER" as const });
const admin = Object.freeze({ userId: "admin-1", role: "ADMIN" as const });

describe("match privacy", () => {
  it("does not export the unscoped loader", async () => {
    const matchService = await import("./matchService");
    expect(matchService).not.toHaveProperty("loadMatchesForUser");
  });

  it("loads only the signed-in fighter's matches", async () => {
    const { listMatchesForFighter } = await import("./matchService");
    registrationQueries.length = 0;
    await listMatchesForFighter(fighterA);
    expect(registrationQueries[0]).toEqual({ userId: "fighter-a" });

    registrationQueries.length = 0;
    await listMatchesForFighter(fighterB);
    expect(registrationQueries[0]).toEqual({ userId: "fighter-b" });
    expect(registrationQueries.some((query) => JSON.stringify(query).includes("fighter-a"))).toBe(false);
  });

  it("rejects a non-fighter before querying", async () => {
    const { listMatchesForFighter } = await import("./matchService");
    registrationQueries.length = 0;
    await expect(listMatchesForFighter(admin)).rejects.toBeInstanceOf(ForbiddenError);
    expect(registrationQueries).toEqual([]);
  });

  it("returns only public history fields", async () => {
    const { listPublicMatchHistory } = await import("./matchService");
    const result = await listPublicMatchHistory("fighter-1");
    expect(result.wins).toBe(1);
    expect(result.losses).toBe(0);
    expect(result.history).toEqual([
      {
        _id: "m1",
        event: { name: "Open" },
        competitorAName: null,
        competitorBName: null,
        winnerName: null,
        resultMethod: "Points",
      },
    ]);
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("secretNote");
    expect(serialized).not.toContain("aadhaar");
    expect(serialized).not.toContain("fighter-1");
  });
});
