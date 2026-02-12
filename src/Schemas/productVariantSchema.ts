import { z } from "zod";

export const productVariantAttributeSchema = z.object({
  atribute_id: z.number().int().min(1, "Atribute is required"),
  value: z.string().min(1, "Atribute value is required"),
});

export const productVariantSchema = z.object({
  product_id: z.number().int().min(1, "Product is required"),
  name: z.string().min(1, "Variant name is required"),
  barcode: z.string().optional(),
  atribute: z
    .array(productVariantAttributeSchema)
    .min(1, "At least one atribute is required"),
});

export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
