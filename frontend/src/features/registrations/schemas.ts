import { z } from "zod";
import { objectIdSchema } from "@/lib/object-id";

export const createRegistrationSchema = z.object({
  divisionId: objectIdSchema,
  consent: z.literal("yes", { error: "Tick the consent box." }),
  agreement: z.literal("yes", { error: "Tick the agreement box." }),
});
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
