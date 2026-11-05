import { describe, it, expect } from "vitest";
import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, toAppError } from "./errors";

describe("AppError hierarchy", () => {
  it.each([
    [ValidationError, 400, "VALIDATION_ERROR"],
    [UnauthorizedError, 401, "UNAUTHORIZED"],
    [ForbiddenError, 403, "FORBIDDEN"],
    [NotFoundError, 404, "NOT_FOUND"],
    [ConflictError, 409, "CONFLICT"],
  ] as const)("%s maps to status %i and code %s", (ErrorClass, status, code) => {
    const err = new ErrorClass();
    expect(err.statusCode).toBe(status);
    expect(err.code).toBe(code);
    expect(err).toBeInstanceOf(AppError);
  });

  it("toAppError passes through an existing AppError unchanged", () => {
    const original = new NotFoundError("missing thing");
    expect(toAppError(original)).toBe(original);
  });

  it("toAppError converts an unknown thrown value into a safe 500", () => {
    const wrapped = toAppError(new Error("raw db error with secrets"));
    expect(wrapped.statusCode).toBe(500);
    expect(wrapped.code).toBe("INTERNAL_ERROR");
    expect(wrapped.message).not.toContain("secrets");
  });
});
