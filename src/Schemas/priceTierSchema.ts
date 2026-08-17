import { z } from "zod";

export const priceTierSchema = z
  .object({
    product_variant_id: z.number().int().min(1, "Varian produk wajib dipilih"),
    customer_group_id: z.number().int().min(1, "Grup pelanggan wajib dipilih"),
    min_qty: z
      .number({ message: "Jumlah minimal harus berupa angka" })
      .min(0, "Jumlah minimal pembelian minimal 0"),
    price: z
      .number({ message: "Harga harus berupa angka" })
      .min(0, "Harga minimal 0"),
    location_id: z.number().int().min(1, "Lokasi wajib dipilih"),
    start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
    end_date: z.string().optional(),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
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

export type PriceTierFormData = z.infer<typeof priceTierSchema>;
