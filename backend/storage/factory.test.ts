import { afterEach, describe, expect, it, vi } from "vitest";

describe("getStorageAdapter", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("defaults to local disk outside production", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.STORAGE_DRIVER;
    const { getStorageAdapter } = await import("./factory");
    const { LocalDiskStorageAdapter } = await import("./local-disk");
    expect(getStorageAdapter()).toBeInstanceOf(LocalDiskStorageAdapter);
  });

  it("selects GridFS when STORAGE_DRIVER=gridfs in development", async () => {
    process.env.NODE_ENV = "development";
    process.env.STORAGE_DRIVER = "gridfs";
    const { getStorageAdapter } = await import("./factory");
    const { GridFSStorageAdapter } = await import("./gridfs");
    expect(getStorageAdapter()).toBeInstanceOf(GridFSStorageAdapter);
  });

  it("requires an explicit driver in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.STORAGE_DRIVER;
    const { getStorageAdapter } = await import("./factory");
    expect(() => getStorageAdapter()).toThrow(/STORAGE_DRIVER/);
  });

  it("allows local disk in production when explicitly selected", async () => {
    process.env.NODE_ENV = "production";
    process.env.STORAGE_DRIVER = "local";
    const { getStorageAdapter } = await import("./factory");
    const { LocalDiskStorageAdapter } = await import("./local-disk");
    expect(getStorageAdapter()).toBeInstanceOf(LocalDiskStorageAdapter);
  });
});
