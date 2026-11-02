import { z } from "zod";
import { CONTENT_TYPES } from "@/server/models/ContentEntry";

export const createContentSchema = z.object({
  type: z.enum(CONTENT_TYPES),
  title: z.string().trim().min(2, "Enter a title."),
  body: z.string().trim().min(2, "Enter the body text."),
});
export type CreateContentInput = z.infer<typeof createContentSchema>;
