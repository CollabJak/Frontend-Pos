import { z } from "zod";

const numberField = (requiredMessage: string, invalidMessage: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    },
    z.number().catch(() => NaN),
  ).refine((val) => !isNaN(val), {
    message: invalidMessage,
  });

export const subscriptionPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Subscription plan name is required")
    .max(255, "Subscription plan name is too long"),
  duration: numberField("Duration is required", "Duration must be a number")
    .refine((val) => Number.isInteger(val), {
      message: "Duration must be an integer",
    })
    .refine((val) => val >= 1, {
      message: "Duration must be at least 1",
    }),
  price: numberField("Price is required", "Price must be a number").refine(
    (val) => val >= 0,
    {
      message: "Price must be at least 0",
    },
  ),
  description: z.string().optional().or(z.literal("")),
});

export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>;
