import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the DB/model layer — this test is about decideRequest's *decision
// logic* (does the capacity re-check and rollback behave correctly), not a
// DB integration test. Same mocking style as session.test.ts.
vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));

const admin = Object.freeze({ userId: "admin1", role: "ADMIN" as const });

const mockRegistrationFindOne = vi.fn();
const mockRegistrationFindById = vi.fn();
const mockRegistrationCountDocuments = vi.fn();
vi.mock("@/server/models/Registration", () => ({
  Registration: {
    findOne: (...args: unknown[]) => mockRegistrationFindOne(...args),
    findById: (...args: unknown[]) => mockRegistrationFindById(...args),
    countDocuments: (...args: unknown[]) => mockRegistrationCountDocuments(...args),
  },
}));

const mockDivisionFindById = vi.fn();
vi.mock("@/server/models/Division", () => ({
  Division: { findById: (...args: unknown[]) => mockDivisionFindById(...args) },
}));

const mockRequestFindOneAndUpdate = vi.fn();
const mockRequestUpdateOne = vi.fn().mockResolvedValue(undefined);
vi.mock("@/server/models/RegistrationRequest", () => ({
  RegistrationRequest: {
    findOneAndUpdate: (...args: unknown[]) => mockRequestFindOneAndUpdate(...args),
    updateOne: (...args: unknown[]) => mockRequestUpdateOne(...args),
    findOne: () => ({ lean: () => Promise.resolve(null) }),
    create: vi.fn(),
    find: () => ({ sort: () => ({ lean: () => Promise.resolve([]) }) }),
  },
}));

const mockUserFindById = vi.fn();
vi.mock("@/server/models/User", () => ({
  User: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
    find: () => ({ lean: () => Promise.resolve([]) }),
  },
}));

const mockEmailSend = vi.fn().mockResolvedValue(undefined);
vi.mock("@/server/email/console", () => ({
  getEmailAdapter: () => ({ send: mockEmailSend }),
}));

const mockWriteAuditLog = vi.fn().mockResolvedValue(undefined);
vi.mock("@/server/audit/log", () => ({
  writeAuditLog: (...args: unknown[]) => mockWriteAuditLog(...args),
}));

function registrationDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: "reg1",
    userId: "u1",
    eventId: "evt1",
    divisionId: "divOld",
    status: "CONFIRMED",
    statusHistory: [],
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequestUpdateOne.mockResolvedValue(undefined);
  mockUserFindById.mockResolvedValue({ _id: "u1", email: "fighter@example.com" });
});

describe("decideRequest — TRANSFER capacity re-check (M-4 regression)", () => {
  it("applies the transfer when the target division still has capacity at approval time", async () => {
    mockRequestFindOneAndUpdate.mockResolvedValue({
      _id: "req1",
      type: "TRANSFER",
      registrationId: "reg1",
      requestedDivisionId: "divNew",
      userId: "u1",
    });
    const reg = registrationDoc();
    mockRegistrationFindById.mockResolvedValue(reg);
    mockDivisionFindById.mockResolvedValue({ _id: "divNew", capacity: 4 });
    mockRegistrationCountDocuments.mockResolvedValue(2);

    const { decideRequest } = await import("./requestService");
    const result = await decideRequest(admin, "req1", "APPROVED", "ok");

    expect(reg.divisionId).toBe("divNew");
    expect(reg.save).toHaveBeenCalledTimes(1);
    expect(mockRequestUpdateOne).not.toHaveBeenCalled();
    expect(result._id).toBe("req1");
  });

  it("rejects the transfer and reverts the request to PENDING when the target division is already at capacity", async () => {
    mockRequestFindOneAndUpdate.mockResolvedValue({
      _id: "req1",
      type: "TRANSFER",
      registrationId: "reg1",
      requestedDivisionId: "divNew",
      userId: "u1",
    });
    const reg = registrationDoc();
    mockRegistrationFindById.mockResolvedValue(reg);
    mockDivisionFindById.mockResolvedValue({ _id: "divNew", capacity: 4 });
    mockRegistrationCountDocuments.mockResolvedValue(4); // already at capacity

    const { decideRequest } = await import("./requestService");
    const { ConflictError } = await import("@/server/http/errors");

    await expect(decideRequest(admin, "req1", "APPROVED", "ok")).rejects.toBeInstanceOf(ConflictError);

    expect(reg.save).not.toHaveBeenCalled();
    expect(reg.divisionId).toBe("divOld"); // never mutated
    expect(mockRequestUpdateOne).toHaveBeenCalledWith(
      { _id: "req1" },
      expect.objectContaining({ status: "PENDING" })
    );
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "REGISTRATION_REQUEST_APPROVAL_FAILED" })
    );
    // No "approved" notification should have gone out for a transfer that didn't actually apply.
    expect(mockEmailSend).not.toHaveBeenCalled();
  });

  it("a second concurrent approval fails once the first approval has filled the division", async () => {
    // Simulates two admins approving two different TRANSFER requests into the
    // same division at nearly the same time: the recheck for the second call
    // reflects the first call's already-applied change, so it correctly fails
    // instead of overfilling the division.
    const requestA = { _id: "reqA", type: "TRANSFER", registrationId: "regA", requestedDivisionId: "divNew", userId: "u1" };
    const requestB = { _id: "reqB", type: "TRANSFER", registrationId: "regB", requestedDivisionId: "divNew", userId: "u2" };
    const regA = registrationDoc({ _id: "regA" });
    const regB = registrationDoc({ _id: "regB" });

    mockDivisionFindById.mockResolvedValue({ _id: "divNew", capacity: 1 });
    mockRegistrationCountDocuments
      .mockResolvedValueOnce(0) // first approval: division has room
      .mockResolvedValueOnce(1); // second approval: now full because of the first

    mockRequestFindOneAndUpdate.mockResolvedValueOnce(requestA).mockResolvedValueOnce(requestB);
    mockRegistrationFindById.mockResolvedValueOnce(regA).mockResolvedValueOnce(regB);

    const { decideRequest } = await import("./requestService");
    const { ConflictError } = await import("@/server/http/errors");

    await expect(decideRequest(admin, "reqA", "APPROVED", "")).resolves.toBeDefined();
    await expect(decideRequest(admin, "reqB", "APPROVED", "")).rejects.toBeInstanceOf(ConflictError);

    expect(regA.save).toHaveBeenCalledTimes(1);
    expect(regB.save).not.toHaveBeenCalled();
  });

  it("still blocks deciding the same request twice (pre-existing double-decision guard preserved)", async () => {
    mockRequestFindOneAndUpdate.mockResolvedValue(null); // no PENDING doc matched the filter

    const { decideRequest } = await import("./requestService");
    const { ConflictError } = await import("@/server/http/errors");

    await expect(decideRequest(admin, "req1", "APPROVED", "")).rejects.toBeInstanceOf(ConflictError);
    expect(mockRegistrationFindById).not.toHaveBeenCalled();
  });

  it("CANCELLATION approval is unaffected by the capacity fix (regression safety)", async () => {
    mockRequestFindOneAndUpdate.mockResolvedValue({
      _id: "req1",
      type: "CANCELLATION",
      registrationId: "reg1",
      userId: "u1",
    });
    const reg = registrationDoc();
    mockRegistrationFindById.mockResolvedValue(reg);

    const { decideRequest } = await import("./requestService");
    await decideRequest(admin, "req1", "APPROVED", "");

    expect(reg.status).toBe("CANCELLED");
    expect(reg.save).toHaveBeenCalledTimes(1);
    expect(mockDivisionFindById).not.toHaveBeenCalled();
  });
});
