import { z } from "zod";

/** Canonical 24-char hex ObjectId. Pure check — safe for Server Action schemas. */
export function isMongoObjectId(value: string): boolean {
  return typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);
}

export const objectIdSchema = z
  .string()
  .trim()
  .refine(isMongoObjectId, { message: "Invalid identifier." });
