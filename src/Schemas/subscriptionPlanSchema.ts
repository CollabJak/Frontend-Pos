import { z } from "zod";

export const SubscriptionPlanSchema = z.object({
    name: z.string().min(1, "Plan Name is required").max(255),
    duration: z.coerce.number().min(1, "Duration must be at least 1 day"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    description: z.string().optional().nullable(),
    is_popular: z.coerce.boolean().default(false),
    billing_cycle: z.enum(["monthly", "yearly"]).default("monthly"),
    features: z.record(z.string(), z.any()).optional().nullable().default({}),
});

export type SubscriptionPlanFormValues = z.infer<typeof SubscriptionPlanSchema>;
