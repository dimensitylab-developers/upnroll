import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocked the same way as requestService.test.ts — this test exercises
// updateMatchSchedule's validation logic, not a DB integration test.
vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));

const mockMatchFindById = vi.fn();
vi.mock("@/server/models/Match", () => ({
  Match: { findById: (...args: unknown[]) => mockMatchFindById(...args) },
  MATCH_STATUSES: ["PENDING", "SCHEDULED", "COMPLETED", "BYE"],
}));

vi.mock("@/server/models/Bracket", () => ({ Bracket: { findById: vi.fn() } }));
vi.mock("@/server/models/Registration", () => ({ Registration: { find: () => ({ lean: () => Promise.resolve([]) }) } }));
vi.mock("@/server/models/FighterProfile", () => ({ FighterProfile: { find: () => ({ lean: () => Promise.resolve([]) }) } }));
vi.mock("@/server/models/Event", () => ({ Event: { find: () => ({ lean: () => Promise.resolve([]) }) } }));
vi.mock("@/server/models/Division", () => ({ Division: { find: () => ({ lean: () => Promise.resolve([]) }) } }));
vi.mock("@/server/models/User", () => ({ User: { find: () => ({ select: () => ({ lean: () => Promise.resolve([]) }) }) } }));
vi.mock("@/server/notifications/whatsapp", () => ({ notifyWhatsApp: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/server/email/console", () => ({ getEmailAdapter: () => ({ send: vi.fn().mockResolvedValue(undefined) }) }));
vi.mock("./matchConflict", () => ({ detectScheduleConflicts: vi.fn().mockResolvedValue([]) }));
vi.mock("./outboxService", () => ({
  enqueueOutboxJob: vi.fn().mockResolvedValue(undefined),
  supersedeOutboxJobsByPrefix: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./reminderService", () => ({
  scheduleMatchReminderForMatch: vi.fn().mockResolvedValue({ scheduled: true }),
}));

const mockWriteAuditLog = vi.fn().mockResolvedValue(undefined);
vi.mock("@/server/audit/log", () => ({
  writeAuditLog: (...args: unknown[]) => mockWriteAuditLog(...args),
}));

function matchDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: "match1",
    eventId: "event1",
    competitorARegistrationId: "regA",
    competitorBRegistrationId: "regB",
    scheduledAt: null,
    mat: "",
    status: "PENDING",
    scheduleVersion: 0,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const admin = Object.freeze({ userId: "admin1", role: "ADMIN" as const });

describe("updateMatchSchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets the schedule when both competitors are assigned", async () => {
    const { updateMatchSchedule } = await import("./matchService");
    const match = matchDoc();
    mockMatchFindById.mockResolvedValue(match);

    const result = await updateMatchSchedule(admin, "match1", { scheduledAt: new Date("2026-12-01T10:00:00Z"), mat: "Mat 1" });

    expect(result.match.scheduledAt).toEqual(new Date("2026-12-01T10:00:00Z"));
    expect(result.match.mat).toBe("Mat 1");
    expect(match.save).toHaveBeenCalled();
    expect(mockWriteAuditLog).toHaveBeenCalled();
  });

  it("rejects scheduling a match that doesn't have both competitors yet", async () => {
    const { updateMatchSchedule } = await import("./matchService");
    const match = matchDoc({ competitorBRegistrationId: null });
    mockMatchFindById.mockResolvedValue(match);

    await expect(
      updateMatchSchedule(admin, "match1", { scheduledAt: new Date("2026-12-01T10:00:00Z") })
    ).rejects.toThrow(/both competitors/i);
    expect(match.save).not.toHaveBeenCalled();
  });

  it("rejects an invalid date", async () => {
    const { updateMatchSchedule } = await import("./matchService");
    const match = matchDoc();
    mockMatchFindById.mockResolvedValue(match);

    await expect(
      updateMatchSchedule(admin, "match1", { scheduledAt: new Date("not-a-date") })
    ).rejects.toThrow(/invalid/i);
    expect(match.save).not.toHaveBeenCalled();
  });

  it("allows clearing the mat without touching the date", async () => {
    const { updateMatchSchedule } = await import("./matchService");
    const match = matchDoc({ mat: "Mat 2" });
    mockMatchFindById.mockResolvedValue(match);

    const result = await updateMatchSchedule(admin, "match1", { mat: "" });

    expect(result.match.mat).toBe("");
    expect(match.save).toHaveBeenCalled();
  });

  it("throws NotFoundError when the match doesn't exist", async () => {
    const { updateMatchSchedule } = await import("./matchService");
    mockMatchFindById.mockResolvedValue(null);

    await expect(updateMatchSchedule(admin, "missing", { mat: "Mat 1" })).rejects.toThrow(/not found/i);
  });
});
