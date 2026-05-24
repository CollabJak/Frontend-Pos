import { z } from "zod";
import {
  locationTypeEnum,
  productVariantLocationTypeSchema,
  productVariantLocationTypeBulkSchema,
} from "../Schemas/productVariantLocationTypeSchema";

export type LocationType = z.infer<typeof locationTypeEnum>;

export type ProductVariantLocationTypeData = z.infer<
  typeof productVariantLocationTypeSchema
>;

export type ProductVariantLocationTypeBulkData = z.infer<
  typeof productVariantLocationTypeBulkSchema
>;
