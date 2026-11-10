import { z } from "zod";
import { CONTENT_TYPE_OPTIONS } from "./content-types";

export const createContentSchema = z.object({
  type: z.enum(CONTENT_TYPE_OPTIONS),
  title: z.string().trim().min(2, "Enter a title."),
  body: z.string().trim().min(2, "Enter the body text."),
});
export type CreateContentInput = z.infer<typeof createContentSchema>;

export const updateContentSchema = createContentSchema.extend({
  entryId: z.string().trim().min(1, "Missing content entry."),
});
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
