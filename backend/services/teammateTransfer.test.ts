import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/server/db/transaction", () => ({
  withTransaction: async (fn: (session: null) => Promise<unknown>) => fn(null),
  bindSession: (query: unknown) => query,
  sessionOpts: () => ({}),
}));
vi.mock("@/server/audit/log", () => ({ writeAuditLog: vi.fn().mockResolvedValue(undefined) }));

const mockInviteFindOne = vi.fn();
const mockInviteFindOneAndUpdate = vi.fn();
vi.mock("@/server/models/TransferInvite", () => ({
  TransferInvite: {
    findOne: (...args: unknown[]) => mockInviteFindOne(...args),
    findOneAndUpdate: (...args: unknown[]) => mockInviteFindOneAndUpdate(...args),
  },
}));

const mockRegistrationFindById = vi.fn();
const mockRegistrationFindOne = vi.fn();
vi.mock("@/server/models/Registration", () => ({
  Registration: {
    findById: (...args: unknown[]) => mockRegistrationFindById(...args),
    findOne: (...args: unknown[]) => mockRegistrationFindOne(...args),
  },
}));

const mockDivisionFindById = vi.fn();
vi.mock("@/server/models/Division", () => ({
  Division: {
    findById: (...args: unknown[]) => mockDivisionFindById(...args),
  },
}));

const mockEventFindById = vi.fn();
vi.mock("@/server/models/Event", () => ({
  Event: {
    findById: (...args: unknown[]) => mockEventFindById(...args),
  },
}));

const mockProfileFindOne = vi.fn();
vi.mock("@/server/models/FighterProfile", () => ({
  FighterProfile: {
    findOne: (...args: unknown[]) => mockProfileFindOne(...args),
  },
}));

vi.mock("@/server/models/PaymentSubmission", () => ({
  PaymentSubmission: { updateMany: vi.fn().mockResolvedValue(undefined) },
}));

const actor = Object.freeze({ userId: "claimer1", role: "FIGHTER" as const });
const token = "a".repeat(36);

function lean(value: unknown) {
  return { lean: () => Promise.resolve(value) };
}

describe("peekTeammateTransfer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns seat preview for an unclaimed invite", async () => {
    mockInviteFindOne.mockReturnValue(
      lean({
        registrationId: "reg1",
        fromUserId: "owner1",
        claimedAt: null,
      })
    );
    mockRegistrationFindById.mockReturnValue(
      lean({
        _id: "reg1",
        userId: "owner1",
        eventId: "evt1",
        divisionId: "div1",
        status: "CONFIRMED",
      })
    );
    mockEventFindById.mockReturnValue({
      select: () => lean({ name: "No-Gi #2" }),
    });
    mockDivisionFindById.mockReturnValue({
      select: () =>
        lean({ name: "Men −65 · Beginner", gender: "MALE", experienceLevel: "BEGINNER" }),
    });

    const { peekTeammateTransfer } = await import("./teammateTransfer");
    const seat = await peekTeammateTransfer(token);
    expect(seat.eventName).toBe("No-Gi #2");
    expect(seat.divisionName).toBe("Men −65 · Beginner");
    expect(seat.gender).toBe("MALE");
    expect(seat.experienceLevel).toBe("BEGINNER");
  });
});

describe("claimTeammateTransfer eligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInviteFindOne.mockResolvedValue({
      _id: "inv1",
      registrationId: "reg1",
      fromUserId: "owner1",
      claimedAt: null,
    });
    mockRegistrationFindById.mockResolvedValue({
      _id: "reg1",
      userId: "owner1",
      divisionId: "div1",
      status: "CONFIRMED",
      save: vi.fn().mockResolvedValue(undefined),
    });
    mockRegistrationFindOne.mockReturnValue(lean(null));
    mockDivisionFindById.mockReturnValue(
      lean({ _id: "div1", gender: "MALE", experienceLevel: "BEGINNER" })
    );
  });

  it("rejects when the claimer's belt does not match the division", async () => {
    mockProfileFindOne.mockReturnValue(
      lean({
        gender: "Male",
        beltRank: "Blue",
        aadhaarImageKey: "aadhaar/claimer1.jpg",
        waiverAcceptedAt: new Date(),
      })
    );

    const { claimTeammateTransfer } = await import("./teammateTransfer");
    await expect(claimTeammateTransfer(actor, token)).rejects.toThrow(/white belts only/i);
    expect(mockInviteFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects when identity proof is missing", async () => {
    mockProfileFindOne.mockReturnValue(
      lean({
        gender: "Male",
        beltRank: "White",
        aadhaarImageKey: "",
        waiverAcceptedAt: new Date(),
      })
    );

    const { claimTeammateTransfer } = await import("./teammateTransfer");
    await expect(claimTeammateTransfer(actor, token)).rejects.toThrow(/identity proof/i);
  });
});
