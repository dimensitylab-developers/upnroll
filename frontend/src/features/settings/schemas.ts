import { z } from "zod";

export const updateSiteSettingsSchema = z.object({
  instagramHandle: z
    .string()
    .trim()
    .min(2, "Enter an Instagram handle.")
    .max(60)
    .regex(/^@?[A-Za-z0-9._]+$/, "Use a valid Instagram handle."),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email.")]).default(""),
  phoneDisplay: z.string().trim().max(40).default(""),
  phoneTel: z
    .string()
    .trim()
    .max(40)
    .regex(/^$|^\+?[0-9\s-]+$/, "Use digits for the phone link.")
    .default(""),
  city: z.string().trim().min(2, "Enter a city.").max(80),
});
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
