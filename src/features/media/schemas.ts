import { z } from "zod";

export const createMediaSchema = z.object({
  caption: z.string().trim().min(2, "Enter a caption."),
  externalUrl: z.string().trim().url("Enter a valid URL."),
});
export type CreateMediaInput = z.infer<typeof createMediaSchema>;
