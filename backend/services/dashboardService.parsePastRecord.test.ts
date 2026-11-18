import { describe, expect, it } from "vitest";
import { parsePastRecord } from "./dashboardService";

describe("parsePastRecord", () => {
  it("parses W-L text for the desk badge", () => {
    expect(parsePastRecord("0-1")).toEqual({ wins: 0, losses: 1 });
    expect(parsePastRecord("3–2")).toEqual({ wins: 3, losses: 2 });
    expect(parsePastRecord("12 — 4 overall")).toEqual({ wins: 12, losses: 4 });
  });

  it("returns null when the text is not a record", () => {
    expect(parsePastRecord("")).toBeNull();
    expect(parsePastRecord("debut")).toBeNull();
    expect(parsePastRecord(null)).toBeNull();
  });
});
