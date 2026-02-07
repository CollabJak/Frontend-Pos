import { z } from "zod";

export const unitSchema = z.object({
  name: z.string().min(1, "Unit name is required").max(255, "Unit name is too long"),
  symbol: z.string().min(1, "Unit symbol is required").max(50, "Unit symbol is too long"),
  description: z.string().optional().or(z.literal("")),
});

export type UnitFormData = z.infer<typeof unitSchema>;
