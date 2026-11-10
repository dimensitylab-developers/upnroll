import { beforeEach, describe, expect, it, vi } from "vitest";

const put = vi.fn();
const del = vi.fn();

vi.mock("@/server/storage/factory", () => ({
  getStorageAdapter: () => ({ put, delete: del, open: vi.fn(), get: vi.fn() }),
}));

import { saveProfilePhoto } from "./profilePhoto";

const fighter = { userId: "507f1f77bcf86cd799439011", role: "FIGHTER" as const };

describe("saveProfilePhoto", () => {
  beforeEach(() => {
    put.mockReset();
    del.mockReset();
  });

  it("persists the adapter-returned storage key (gridfs:<id>), not the path label", async () => {
    put.mockResolvedValue("gridfs:aaaaaaaaaaaaaaaaaaaaaaaa");

    const stored = await saveProfilePhoto(fighter, Buffer.from("img"), ".jpg");

    expect(put).toHaveBeenCalledWith(
      "profiles/507f1f77bcf86cd799439011.jpg",
      expect.any(Buffer),
      "image/jpeg",
      expect.objectContaining({ metadata: expect.objectContaining({ purpose: "profile-photo" }) })
    );
    expect(stored).toBe("gridfs:aaaaaaaaaaaaaaaaaaaaaaaa");
  });

  it("returns the path key unchanged when the local adapter echoes it", async () => {
    put.mockImplementation(async (key: string) => key);

    const stored = await saveProfilePhoto(fighter, Buffer.from("img"), ".png");

    expect(stored).toBe("profiles/507f1f77bcf86cd799439011.png");
  });

  it("deletes a previous gridfs key before putting a new file", async () => {
    put.mockResolvedValue("gridfs:bbbbbbbbbbbbbbbbbbbbbbbb");

    await saveProfilePhoto(fighter, Buffer.from("img"), ".jpg", "gridfs:aaaaaaaaaaaaaaaaaaaaaaaa");

    expect(del).toHaveBeenCalledWith("gridfs:aaaaaaaaaaaaaaaaaaaaaaaa");
  });

  it("skips delete when previous key equals the local path label (in-place overwrite)", async () => {
    put.mockImplementation(async (key: string) => key);
    const label = "profiles/507f1f77bcf86cd799439011.jpg";

    await saveProfilePhoto(fighter, Buffer.from("img"), ".jpg", label);

    expect(del).not.toHaveBeenCalled();
  });
});
