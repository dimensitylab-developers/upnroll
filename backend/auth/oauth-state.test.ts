import { describe, it, expect, beforeAll } from "vitest";
import { issueOAuthState, verifyOAuthState } from "./oauth-state";

beforeAll(() => {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
  process.env.SESSION_SECRET = "c".repeat(32);
});

describe("oauth state binding", () => {
  it("accepts a matching state param and cookie", () => {
    const { stateParam, cookieValue } = issueOAuthState();
    expect(verifyOAuthState(stateParam, cookieValue)).toBe(true);
  });

  it("rejects a missing cookie", () => {
    const { stateParam } = issueOAuthState();
    expect(verifyOAuthState(stateParam, null)).toBe(false);
  });

  it("rejects a swapped or tampered state", () => {
    const a = issueOAuthState();
    const b = issueOAuthState();
    expect(verifyOAuthState(a.stateParam, b.cookieValue)).toBe(false);
    expect(verifyOAuthState(`${a.stateParam}x`, a.cookieValue)).toBe(false);
  });
});
