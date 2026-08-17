import { z } from "zod";

export const SubscriptionPlanSchema = z.object({
    name: z.string().min(1, "Nama paket wajib diisi").max(255, "Nama paket maksimal 255 karakter"),
    duration: z.coerce.number().min(1, "Durasi minimal 1 hari"),
    price: z.coerce.number().min(0, "Harga tidak boleh bernilai negatif"),
    description: z.string().optional().nullable(),
    is_popular: z.coerce.boolean().default(false),
    billing_cycle: z.enum(["monthly", "yearly"], {
        message: "Siklus penagihan wajib dipilih",
    }).default("monthly"),
    features: z.record(z.string(), z.any()).optional().nullable().default({}),
});

export type SubscriptionPlanFormValues = z.infer<typeof SubscriptionPlanSchema>;
