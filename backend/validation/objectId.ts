import { ValidationError } from "@/server/http/errors";

/** True only for canonical 24-char hex ObjectId strings (rejects Mongoose's looser isValid). */
export function isMongoObjectId(value: string): boolean {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
}

/** Throws ValidationError when the id is not a canonical ObjectId. */
export function requireObjectId(value: string, label = "identifier"): string {
  if (!isMongoObjectId(value)) {
    throw new ValidationError(`Invalid ${label}.`);
  }
  return value;
}
