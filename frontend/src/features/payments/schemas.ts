import { z } from "zod";
import { objectIdSchema } from "@/lib/object-id";

/**
 * UTR/transaction reference format. Conservative generic placeholder
 * (alphanumeric, 6-30 chars) pending the client's actual UPI/bank
 * reference format — see docs/decisions/open-decisions.md (OD-005/OD-006).
 */
export const utrSchema = z
  .string()
  .trim()
  .min(6, "Transaction reference looks too short.")
  .max(30, "Transaction reference looks too long.")
  .regex(/^[A-Za-z0-9]+$/, "Transaction reference should only contain letters and numbers.");

export const submitPaymentSchema = z.object({
  registrationId: objectIdSchema,
  utr: utrSchema,
});
export type SubmitPaymentInput = z.infer<typeof submitPaymentSchema>;
