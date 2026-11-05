import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your display name.").max(60),
  gym: z.string().trim().max(80).optional().default(""),
  discipline: z.string().trim().max(80).optional().default(""),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
