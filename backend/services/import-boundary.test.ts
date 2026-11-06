import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const matchServiceSource = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "matchService.ts"), "utf8");

/**
 * registrationService calls recordMatchResult on the outer transaction session.
 * The import points that way. The reverse import would be a cycle.
 */
describe("service import boundary", () => {
  it("does not let matchService import registrationService", () => {
    expect(matchServiceSource).not.toMatch(/(?:from\s+|import\s*\(\s*)["'](?:\.\/|@\/server\/services\/)registrationService["']/);
  });
});
