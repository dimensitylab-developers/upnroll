import { describe, expect, it } from "vitest";
import { isSafeAppPath, resolveAuthReturnPath } from "./safe-app-path";

describe("isSafeAppPath", () => {
  it("accepts same-origin app paths", () => {
    expect(isSafeAppPath("/")).toBe(true);
    expect(isSafeAppPath("/events")).toBe(true);
    expect(isSafeAppPath("/events/demo?x=1")).toBe(true);
    expect(isSafeAppPath("/login")).toBe(true);
  });

  it("rejects external and protocol-relative destinations", () => {
    expect(isSafeAppPath("https://evil.example/")).toBe(false);
    expect(isSafeAppPath("//evil.example")).toBe(false);
    expect(isSafeAppPath("/\\evil")).toBe(false);
  });

  it("rejects verify and API paths", () => {
    expect(isSafeAppPath("/verify")).toBe(false);
    expect(isSafeAppPath("/api/auth/google")).toBe(false);
  });
});

describe("resolveAuthReturnPath", () => {
  it("falls back when candidate is missing or current auth page", () => {
    expect(resolveAuthReturnPath(undefined, { current: "/login", fallback: "/" })).toBe("/");
    expect(resolveAuthReturnPath("/login", { current: "/login", fallback: "/" })).toBe("/");
    expect(resolveAuthReturnPath("/register", { current: "/register", fallback: "/login" })).toBe("/login");
  });

  it("keeps a safe cross-page destination", () => {
    expect(resolveAuthReturnPath("/events", { current: "/login", fallback: "/" })).toBe("/events");
    expect(resolveAuthReturnPath("/login", { current: "/register", fallback: "/" })).toBe("/login");
  });
});
