import { z } from "zod";

export const createRequestSchema = z.object({
  registrationId: z.string().min(1),
  type: z.enum(["CANCELLATION", "TRANSFER"]),
  requestedDivisionId: z.string().optional(),
  reason: z.string().trim().min(5, "Explain the reason for this request."),
});
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
