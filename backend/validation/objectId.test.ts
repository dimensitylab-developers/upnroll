import { describe, it, expect } from "vitest";
import { isMongoObjectId, requireObjectId } from "./objectId";
import { ValidationError } from "@/server/http/errors";

describe("isMongoObjectId", () => {
  it("accepts a 24-char hex id", () => {
    expect(isMongoObjectId("507f1f77bcf86cd799439011")).toBe(true);
  });

  it("rejects short, empty, and non-hex values", () => {
    expect(isMongoObjectId("")).toBe(false);
    expect(isMongoObjectId("abc")).toBe(false);
    expect(isMongoObjectId("507f1f77bcf86cd79943901g")).toBe(false);
    expect(isMongoObjectId("not-an-object-id!!!!!!")).toBe(false);
  });
});

describe("requireObjectId", () => {
  it("returns the id when valid", () => {
    expect(requireObjectId("507f1f77bcf86cd799439011")).toBe("507f1f77bcf86cd799439011");
  });

  it("throws ValidationError when invalid", () => {
    expect(() => requireObjectId("bad", "registration")).toThrow(ValidationError);
  });
});
