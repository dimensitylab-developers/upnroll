import { Readable, Writable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";
import { ValidationError } from "@/server/http/errors";

const { mockBucket, MockGridFSBucket } = vi.hoisted(() => {
  const mockBucket = {
    openUploadStream: vi.fn(),
    openDownloadStream: vi.fn(),
    find: vi.fn(),
    delete: vi.fn(),
  };
  class MockGridFSBucket {
    constructor() {
      return mockBucket;
    }
  }
  return { mockBucket, MockGridFSBucket };
});

vi.mock("mongodb", async () => {
  const actual = await vi.importActual<typeof import("mongodb")>("mongodb");
  return {
    ...actual,
    GridFSBucket: MockGridFSBucket,
  };
});

vi.mock("@/server/db/connect", () => ({
  connectDB: vi.fn(async () => undefined),
}));

vi.mock("mongoose", () => ({
  default: {
    connection: {
      db: { mocked: true },
    },
  },
}));

import { GridFSStorageAdapter, resetGridFsBucketForTests } from "./gridfs";
import { formatGridFsKey } from "./keys";

function mockUploadStream(id = new ObjectId()) {
  const state = { aborted: false, errored: false };
  const stream = new Writable({
    write(_chunk, _enc, cb) {
      if (state.errored) {
        cb(new Error("forced write failure"));
        return;
      }
      cb();
    },
  }) as Writable & {
    id: ObjectId;
    abort: ReturnType<typeof vi.fn>;
    state: typeof state;
  };
  stream.id = id;
  stream.abort = vi.fn(async () => {
    state.aborted = true;
  });
  stream.state = state;
  return stream;
}

describe("GridFSStorageAdapter", () => {
  beforeEach(() => {
    resetGridFsBucketForTests();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetGridFsBucketForTests();
  });

  it("puts bytes and returns a gridfs key with metadata content type", async () => {
    const id = new ObjectId();
    const upload = mockUploadStream(id);
    mockBucket.openUploadStream.mockReturnValue(upload);

    const adapter = new GridFSStorageAdapter();
    const key = await adapter.put("payment-screenshots/r1/a.png", Buffer.from("png"), "image/png", {
      metadata: { purpose: "payment-screenshot", ownerUserId: "u1" },
    });

    expect(key).toBe(formatGridFsKey(id));
    expect(mockBucket.openUploadStream).toHaveBeenCalledWith(
      "payment-screenshots/r1/a.png",
      expect.objectContaining({
        metadata: expect.objectContaining({
          purpose: "payment-screenshot",
          ownerUserId: "u1",
          contentType: "image/png",
        }),
      })
    );
  });

  it("rejects a gridfs key as a put filename label", async () => {
    const adapter = new GridFSStorageAdapter();
    await expect(adapter.put("gridfs:aaaaaaaaaaaaaaaaaaaaaaaa", Buffer.from("x"), "image/png")).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(mockBucket.openUploadStream).not.toHaveBeenCalled();
  });

  it("aborts the upload stream when writing fails", async () => {
    const id = new ObjectId();
    const upload = mockUploadStream(id);
    upload.state.errored = true;
    mockBucket.openUploadStream.mockReturnValue(upload);
    mockBucket.delete.mockResolvedValue(undefined);

    const adapter = new GridFSStorageAdapter();
    await expect(adapter.put("profiles/u1.png", Buffer.from("bad"), "image/png")).rejects.toThrow(
      /forced write failure/
    );
    expect(upload.abort).toHaveBeenCalledTimes(1);
  });

  it("opens by id from the storage key and does not accept a raw filename", async () => {
    const id = new ObjectId();
    const key = formatGridFsKey(id);
    mockBucket.find.mockReturnValue({
      limit: () => ({
        toArray: async () => [{ _id: id, length: 4, metadata: { contentType: "image/png" } }],
      }),
    });
    const download = Readable.from([Buffer.from("data")]);
    mockBucket.openDownloadStream.mockReturnValue(download);

    const adapter = new GridFSStorageAdapter();
    const opened = await adapter.open(key);
    expect(opened.contentType).toBe("image/png");
    expect(opened.length).toBe(4);
    expect(mockBucket.openDownloadStream).toHaveBeenCalledWith(id);
  });

  it("treats a missing file delete as success", async () => {
    const id = new ObjectId();
    mockBucket.delete.mockRejectedValue(new Error(`File not found for id ${id}`));
    const adapter = new GridFSStorageAdapter();
    await expect(adapter.delete(formatGridFsKey(id))).resolves.toBeUndefined();
  });

  it("returns a non-HTTP signed url marker", async () => {
    const id = new ObjectId();
    const adapter = new GridFSStorageAdapter();
    await expect(adapter.getSignedUrl(formatGridFsKey(id))).resolves.toBe(`gridfs://${id.toHexString()}`);
  });
});
