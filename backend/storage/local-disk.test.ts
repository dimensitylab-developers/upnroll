import { describe, it, expect } from "vitest";
import { ValidationError } from "@/server/http/errors";
import { resolveStoragePath } from "./local-disk";

describe("resolveStoragePath", () => {
  it("rejects a key that escapes the storage root", () => {
    expect(() => resolveStoragePath("../secrets.txt")).toThrow(ValidationError);
    expect(() => resolveStoragePath("..\\secrets.txt")).toThrow(ValidationError);
    expect(() => resolveStoragePath("/etc/passwd")).toThrow(ValidationError);
    expect(() => resolveStoragePath("a\0b")).toThrow(ValidationError);
  });

  it("accepts a key inside the storage root", () => {
    expect(resolveStoragePath("profiles/fighter.png")).toContain("profiles");
  });
});
