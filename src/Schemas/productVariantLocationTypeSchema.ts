import { z } from "zod";

export const locationTypeEnum = z.enum(["store", "warehouse", "pos", "hq"]);

export const productVariantLocationTypeSchema = z.object({
  location_types: z.array(locationTypeEnum).min(0),
});

export const productVariantLocationTypeBulkSchema = z.object({
  product_variant_ids: z.array(z.number().int().min(1)),
  location_types: z.array(locationTypeEnum).min(0),
});
