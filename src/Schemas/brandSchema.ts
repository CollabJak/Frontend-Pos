import z from "zod";
export const BrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
});

export type BrandFormData = z.infer<typeof BrandSchema>;