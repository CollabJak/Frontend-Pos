import { z } from "zod";
import { customerGroupCodeValues } from "./customerGroupSchema";

export const groupPriceRowSchema = z
  .object({
    id: z.number().optional(),
    product_variant_id: z
      .number({ message: "Varian produk wajib dipilih" })
      .int()
      .min(1, "Varian produk wajib dipilih"),
    product_variant_name: z.string().optional(),
    location_id: z
      .number({ message: "Lokasi wajib dipilih" })
      .int()
      .min(1, "Lokasi wajib dipilih"),
    location_name: z.string().optional(),
    price: z
      .number({ message: "Harga harus berupa angka" })
      .min(0, "Harga minimal Rp 0"),
    start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
    end_date: z.string().optional().or(z.literal("")),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.start_date) return;

    const startDate = new Date(data.start_date);
    if (Number.isNaN(startDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format tanggal mulai tidak valid",
        path: ["start_date"],
      });
    }

    if (!data.end_date || data.end_date.trim() === "") {
      return;
    }

    const endDate = new Date(data.end_date);
    if (Number.isNaN(endDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format tanggal selesai tidak valid",
        path: ["end_date"],
      });
      return;
    }

    if (endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal selesai harus sama atau setelah tanggal mulai",
        path: ["end_date"],
      });
    }
  });

export const compositeCustomerGroupSchema = z.object({
  code: z.enum(customerGroupCodeValues, {
    message: "Kode grup pelanggan wajib dipilih",
  }),
  name: z
    .string()
    .min(1, "Nama grup pelanggan wajib diisi")
    .max(255, "Nama grup pelanggan maksimal 255 karakter"),
  description: z.string().optional().or(z.literal("")),
  discount_percent: z
    .number({ message: "Persentase diskon harus berupa angka" })
    .min(0, "Persentase diskon minimal 0%")
    .max(100, "Persentase diskon maksimal 100%"),
  is_default: z.boolean(),
  is_active: z.boolean(),
  prices: z.array(groupPriceRowSchema),
});

export type GroupPriceRowFormData = z.infer<typeof groupPriceRowSchema>;
export type CompositeCustomerGroupFormData = z.infer<typeof compositeCustomerGroupSchema>;
