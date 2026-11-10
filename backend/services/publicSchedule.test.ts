import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));

const mockEventFindOne = vi.fn();
vi.mock("@/server/models/Event", () => ({
  Event: { findOne: (...args: unknown[]) => mockEventFindOne(...args) },
}));

vi.mock("@/server/models/Bracket", () => ({ Bracket: { find: vi.fn(), findById: vi.fn() } }));
vi.mock("@/server/models/Match", () => ({
  Match: { find: vi.fn(), findById: vi.fn() },
  MATCH_STATUSES: ["PENDING", "SCHEDULED", "COMPLETED", "BYE"],
}));
vi.mock("@/server/models/Registration", () => ({ Registration: { find: vi.fn() } }));
vi.mock("@/server/models/FighterProfile", () => ({ FighterProfile: { find: vi.fn() } }));
vi.mock("@/server/models/Division", () => ({ Division: { find: vi.fn() } }));
vi.mock("@/server/audit/log", () => ({ writeAuditLog: vi.fn() }));
vi.mock("@/server/notifications/whatsapp", () => ({ notifyWhatsApp: vi.fn() }));

const publicStatuses = ["REGISTRATION_OPEN", "REGISTRATION_CLOSED", "COMPLETED"];

describe("public schedule and results", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEventFindOne.mockReturnValue({ lean: () => Promise.resolve(null) });
  });

  it("does not load a schedule for an event outside the public statuses", async () => {
    const { listPublicSchedule } = await import("./matchService");
    const { NotFoundError } = await import("@/server/http/errors");

    await expect(listPublicSchedule("draft-cup")).rejects.toBeInstanceOf(NotFoundError);
    expect(mockEventFindOne).toHaveBeenCalledWith({
      slug: "draft-cup",
      status: { $in: publicStatuses },
    });
  });

  it("uses the same public-status filter for results", async () => {
    const { listPublicResults } = await import("./matchService");
    const { NotFoundError } = await import("@/server/http/errors");

    await expect(listPublicResults("draft-cup")).rejects.toBeInstanceOf(NotFoundError);
    expect(mockEventFindOne).toHaveBeenCalledWith({
      slug: "draft-cup",
      status: { $in: publicStatuses },
    });
  });
});
