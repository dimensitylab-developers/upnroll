import { z } from "zod";

export const createRegistrationSchema = z.object({
  divisionId: z.string().min(1, "Select a division."),
});
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
