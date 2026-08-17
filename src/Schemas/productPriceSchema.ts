import { z } from "zod";

export const productPriceSchema = z
  .object({
    product_variant_id: z.number().int().min(1, "Varian produk wajib dipilih"),
    price: z.number({ message: "Harga harus berupa angka" }).min(0, "Harga minimal 0"),
    price_type: z.enum(["sell", "purchase", "wholesale", "cost", "member"], {
      message: "Tipe harga wajib dipilih",
    }),
    location_id: z.number().int().min(1, "Lokasi wajib dipilih"),
    start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
    end_date: z.string().optional(),
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

export type ProductPriceFormData = z.infer<typeof productPriceSchema>;
