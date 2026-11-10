import { beforeEach, describe, expect, it, vi } from "vitest";

const put = vi.fn();
const del = vi.fn();
const save = vi.fn();
const auditLog = vi.fn();

vi.mock("@/server/db/connect", () => ({ connectDB: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/server/storage/factory", () => ({
  getStorageAdapter: () => ({ put, delete: del, open: vi.fn(), get: vi.fn() }),
}));
vi.mock("@/server/audit/log", () => ({ writeAuditLog: (...args: unknown[]) => auditLog(...args) }));
vi.mock("@/server/models/Event", () => ({
  Event: {
    findById: vi.fn(async () => ({
      _id: "evt1",
      paymentInstructions: { feeMinorUnits: 100, currency: "INR", qrImageKey: "gridfs:aaaaaaaaaaaaaaaaaaaaaaaa" },
      save,
    })),
  },
}));

import { setEventPaymentQr } from "./eventService";

const admin = { userId: "admin1", role: "ADMIN" as const };

describe("setEventPaymentQr storage keys", () => {
  beforeEach(() => {
    put.mockReset();
    del.mockReset();
    save.mockReset().mockResolvedValue(undefined);
    auditLog.mockReset();
  });

  it("stores the adapter-returned key on the event, not the path label", async () => {
    put.mockResolvedValue("gridfs:cccccccccccccccccccccccc");

    const event = await setEventPaymentQr(admin, "evt1", Buffer.from("png"), ".png", "image/png");

    expect(put).toHaveBeenCalledWith(
      "events/evt1/payment-qr.png",
      expect.any(Buffer),
      "image/png",
      expect.objectContaining({ metadata: expect.objectContaining({ purpose: "payment-qr" }) })
    );
    expect(del).toHaveBeenCalledWith("gridfs:aaaaaaaaaaaaaaaaaaaaaaaa");
    expect(event.paymentInstructions?.qrImageKey).toBe("gridfs:cccccccccccccccccccccccc");
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({ after: { qrImageKey: "gridfs:cccccccccccccccccccccccc" } })
    );
  });
});
