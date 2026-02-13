import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(255, "Location name is too long"),
  type: z.enum(["store", "warehouse", "pos", "hq"], {
    message: "Location type is required",
  }),
  parent_id: z
    .number()
    .int("Parent location is invalid")
    .positive("Parent location is invalid")
    .nullable()
    .optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;
