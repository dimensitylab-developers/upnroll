import { z } from "zod";
import { objectIdSchema } from "@/lib/object-id";

export const createRequestSchema = z.object({
  registrationId: objectIdSchema,
  type: z.enum(["CANCELLATION", "TRANSFER"]),
  requestedDivisionId: objectIdSchema.optional(),
  reason: z.string().trim().min(5, "Explain the reason for this request."),
});
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
