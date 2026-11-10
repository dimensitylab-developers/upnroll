import { z } from "zod";
import { objectIdSchema } from "@/lib/object-id";

const dateString = z.string().min(1, "Required.").transform((v) => new Date(v));

export const createEventSchema = z
  .object({
    name: z.string().trim().min(2, "Enter an event name."),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
    venue: z.string().trim().optional().default(""),
    startDate: dateString,
    registrationOpensAt: dateString,
    registrationClosesAt: dateString,
    feeAmount: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (e.g. 1500 or 1500.00)."),
    currency: z.string().trim().length(3).default("INR"),
    matCount: z.coerce.number().int().min(1, "Set at least one mat.").default(1),
  })
  .refine((v) => v.registrationOpensAt < v.registrationClosesAt, {
    message: "Registration must open before it closes.",
    path: ["registrationClosesAt"],
  });
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const createDivisionSchema = z.object({
  eventId: objectIdSchema,
  name: z.string().trim().min(1, "Enter a division name."),
  discipline: z.string().trim().min(1, "Enter a discipline."),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1."),
});
export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
