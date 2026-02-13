import z from "zod";
export const BrandSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Brand name is required"),
  description: z.string().optional(),
});

export type BrandFormData = z.infer<typeof BrandSchema>;
