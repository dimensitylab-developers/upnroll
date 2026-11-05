import { z } from "zod";

export const createRegistrationSchema = z.object({
  divisionId: z.string().min(1, "Select a division."),
  consent: z.literal("yes", { error: "Tick the consent box." }),
  agreement: z.literal("yes", { error: "Tick the agreement box." }),
});
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
