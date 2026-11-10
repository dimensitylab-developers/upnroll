export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  constructor(message = "The request was invalid.") {
    super("VALIDATION_ERROR", message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required.") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "This action conflicts with the current state.") {
    super("CONFLICT", message, 409);
  }
}

function isMongooseCastError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: string }).name === "CastError"
  );
}

function isMongooseValidationError(err: unknown): err is Error & { errors?: Record<string, { message?: string }> } {
  return typeof err === "object" && err !== null && "name" in err && (err as { name?: string }).name === "ValidationError";
}

function storageDriverMessage(err: unknown): string | null {
  if (!(err instanceof Error)) return null;
  if (err.message.includes("STORAGE_DRIVER must be set")) {
    return "Photo storage is not configured on the server. Your text details may still save — try again without a new photo, or ask an admin to set STORAGE_DRIVER.";
  }
  return null;
}

/** Normalizes any thrown value into a safe, user-facing message + AppError. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (isMongooseCastError(err)) {
    return new ValidationError("Invalid identifier.");
  }
  if (isMongooseValidationError(err)) {
    const first = err.errors ? Object.values(err.errors)[0]?.message : undefined;
    return new ValidationError(first || "Some profile fields were invalid. Check the form and try again.");
  }
  const storageMessage = storageDriverMessage(err);
  if (storageMessage) return new AppError("STORAGE_MISCONFIGURED", storageMessage, 500);
  if (err instanceof Error) return new AppError("INTERNAL_ERROR", "Something went wrong.", 500);
  return new AppError("INTERNAL_ERROR", "Something went wrong.", 500);
}
