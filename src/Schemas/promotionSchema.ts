import { z } from "zod";

export const promotionSchema = z
  .object({
    code: z
      .string()
      .min(1, "Kode promosi wajib diisi")
      .max(255, "Kode promosi maksimal 255 karakter"),
    name: z
      .string()
      .min(1, "Nama promosi wajib diisi")
      .max(255, "Nama promosi maksimal 255 karakter"),
    type: z
      .string()
      .min(1, "Tipe promosi wajib diisi")
      .max(255, "Tipe promosi maksimal 255 karakter"),
    priority: z
      .number({ message: "Prioritas harus berupa angka" })
      .int("Prioritas promosi harus berupa bilangan bulat"),
    is_stackable: z.boolean(),
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

export type PromotionFormData = z.infer<typeof promotionSchema>;
