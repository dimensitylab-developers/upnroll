import { describe, it, expect } from "vitest";
import { ObjectId } from "mongodb";
import { ValidationError } from "@/server/http/errors";
import { formatGridFsKey, isGridFsKey, parseGridFsKey } from "./keys";

describe("gridfs storage keys", () => {
  it("formats and parses a round-trip id", () => {
    const id = new ObjectId();
    const key = formatGridFsKey(id);
    expect(key).toBe(`gridfs:${id.toHexString()}`);
    expect(isGridFsKey(key)).toBe(true);
    expect(parseGridFsKey(key).equals(id)).toBe(true);
  });

  it("rejects non-gridfs and malformed keys", () => {
    expect(isGridFsKey("profiles/x.png")).toBe(false);
    expect(() => parseGridFsKey("profiles/x.png")).toThrow(ValidationError);
    expect(() => parseGridFsKey("gridfs:not-an-objectid")).toThrow(ValidationError);
    expect(() => parseGridFsKey("gridfs:")).toThrow(ValidationError);
  });
});
