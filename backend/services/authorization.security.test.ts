import { describe, it, expect, vi } from "vitest";
import { ForbiddenError, NotFoundError } from "@/server/http/errors";

vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));

const findChain = (rows: unknown[]) => ({
  sort: () => ({
    select: () => ({ lean: () => Promise.resolve(rows) }),
    lean: () => Promise.resolve(rows),
  }),
  select: () => ({ lean: () => Promise.resolve(rows) }),
  lean: () => Promise.resolve(rows),
});

vi.mock("@/server/models/PaymentSubmission", () => ({
  PaymentSubmission: { find: () => findChain([]), findById: vi.fn() },
}));
vi.mock("@/server/models/User", () => ({ User: { find: () => findChain([]), findById: vi.fn() } }));
vi.mock("@/server/models/Event", () => ({ Event: { find: () => findChain([]), findById: vi.fn(), findOne: vi.fn() } }));
vi.mock("@/server/models/Registration", () => ({
  Registration: {
    findOne: vi.fn().mockReturnValue({ lean: () => Promise.resolve(null) }),
    find: () => findChain([]),
    findById: vi.fn(),
  },
}));
vi.mock("@/server/models/FighterProfile", () => ({
  FighterProfile: {
    find: () => findChain([
      {
        _id: "p1",
        displayName: "Asha",
        slug: "asha",
        gym: "North",
        discipline: "No-Gi",
        aadhaar: "9999",
        medicalConditionDetail: "private",
        userId: "fighter-1",
      },
    ]),
    findOne: () => ({
      select: () => ({
        lean: () => Promise.resolve({
          _id: "p1",
          displayName: "Asha",
          slug: "asha",
          gym: "North",
          discipline: "No-Gi",
          aadhaar: "9999",
          userId: "fighter-1",
        }),
      }),
      lean: () => Promise.resolve(null),
    }),
  },
}));
vi.mock("@/server/models/Division", () => ({ Division: { find: () => findChain([]), findById: vi.fn() } }));
vi.mock("@/server/models/Match", () => ({ Match: { find: () => findChain([]) } }));
vi.mock("@/server/models/Bracket", () => ({ Bracket: { find: () => findChain([]) } }));
vi.mock("@/server/models/AuditLog", () => ({ AuditLog: { find: () => findChain([]) } }));
vi.mock("@/server/models/ContentEntry", () => ({ ContentEntry: { find: () => findChain([]) } }));
vi.mock("@/server/models/MediaAsset", () => ({ MediaAsset: { find: () => findChain([]) } }));
vi.mock("@/server/storage/local-disk", () => ({ getStorageAdapter: () => ({ get: vi.fn(), put: vi.fn() }) }));
vi.mock("@/server/email/console", () => ({ getEmailAdapter: () => ({ send: vi.fn() }) }));
vi.mock("@/server/audit/log", () => ({
  writeAuditLog: vi.fn(),
  listRecentAuditLogs: vi.fn(),
}));

const admin = Object.freeze({ userId: "admin-1", role: "ADMIN" as const });
const fighter = Object.freeze({ userId: "fighter-1", role: "FIGHTER" as const });
const other = Object.freeze({ userId: "fighter-2", role: "FIGHTER" as const });

describe("protected reads and mutations", () => {
  it("rejects a fighter reading the payment queue", async () => {
    const { listPaymentQueue } = await import("./paymentService");
    await expect(listPaymentQueue(fighter)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects a fighter recording a match result", async () => {
    const { recordMatchResult } = await import("./matchService");
    await expect(recordMatchResult(fighter, "m1", "r1", "points")).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects an admin reading another fighter's private profile", async () => {
    const { getFighterProfile } = await import("./fighterService");
    await expect(getFighterProfile(admin)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects a fighter opening another fighter's registration", async () => {
    const { getRegistrationForFighter } = await import("./registrationService");
    await expect(getRegistrationForFighter(other, "reg-1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lets an admin open the payment queue", async () => {
    const { listPaymentQueue } = await import("./paymentService");
    await expect(listPaymentQueue(admin)).resolves.toEqual([]);
  });
});

describe("public projections", () => {
  it("omits identity and medical fields from the public fighter directory", async () => {
    const { listPublicFighters } = await import("./fighterService");
    const rows = await listPublicFighters();
    expect(rows).toEqual([
      { _id: "p1", displayName: "Asha", slug: "asha", gym: "North", discipline: "No-Gi" },
    ]);
    expect(JSON.stringify(rows)).not.toContain("aadhaar");
    expect(JSON.stringify(rows)).not.toContain("medical");
  });
});
