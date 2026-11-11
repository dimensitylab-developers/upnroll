import { describe, expect, it, vi, beforeEach } from "vitest";

const updateMany = vi.fn().mockResolvedValue({ modifiedCount: 2 });

vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/server/models/OutboxJob", () => ({
  OutboxJob: { updateMany: (...args: unknown[]) => updateMany(...args) },
  OUTBOX_JOB_TYPES: [],
  OUTBOX_JOB_STATUSES: [],
}));
vi.mock("./reminderService", () => ({ processMatchReminderJob: vi.fn() }));
vi.mock("./notificationService", () => ({
  processMatchResultNotifyJob: vi.fn(),
  processScheduleChangedNotifyJob: vi.fn(),
}));
vi.mock("./rankingService", () => ({ recalculateRankingsSystem: vi.fn() }));
vi.mock("@/server/auth/actor", () => ({
  assertAdmin: vi.fn(),
}));

describe("outbox worker restart recovery", () => {
  beforeEach(() => {
    updateMany.mockClear();
  });

  it("re-queues stale PROCESSING jobs after a crash window", async () => {
    const { recoverStaleProcessingJobs } = await import("./outboxService");
    const count = await recoverStaleProcessingJobs(1_000);
    expect(count).toBe(2);
    expect(updateMany).toHaveBeenCalled();
    const filter = updateMany.mock.calls[0]?.[0] as { status: string };
    expect(filter.status).toBe("PROCESSING");
  });
});
