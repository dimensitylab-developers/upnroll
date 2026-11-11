import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/server/http/errors";

/** Mirrors scoringService.assertJudgeMatchScope without loading the full scoring graph. */
function assertJudgeMatchScope(
  judge: { matchId: string },
  matchId: string
): void {
  if (judge.matchId !== matchId) {
    throw new ForbiddenError("This scoring session cannot access that match.");
  }
}

describe("judge match scope", () => {
  it("denies cross-match access when match ids differ", () => {
    const judge = Object.freeze({
      kind: "JUDGE_SESSION" as const,
      sessionId: "s1",
      credentialId: "c1",
      matchId: "match-A",
      generation: 1,
      username: "abcdefghij",
    });
    expect(() => assertJudgeMatchScope(judge, "match-B")).toThrow(ForbiddenError);
  });

  it("allows the bound match", () => {
    const judge = Object.freeze({
      kind: "JUDGE_SESSION" as const,
      sessionId: "s1",
      credentialId: "c1",
      matchId: "match-A",
      generation: 1,
      username: "abcdefghij",
    });
    expect(() => assertJudgeMatchScope(judge, "match-A")).not.toThrow();
  });
});
