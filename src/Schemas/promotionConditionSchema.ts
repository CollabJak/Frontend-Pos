import { z } from "zod";

export const promotionConditionTypeValues = [
  "customer_group",
  "min_qty",
  "location",
  "weekday",
  "channel",
  "total_transaction",
  "payment_method",
  "time_range",
] as const;

export const promotionConditionOperatorValues = [
  "=",
  ">",
  "<",
  ">=",
  "<=",
  "IN",
  "BETWEEN",
] as const;

export type PromotionConditionType = (typeof promotionConditionTypeValues)[number];
export type PromotionConditionOperator = (typeof promotionConditionOperatorValues)[number];

const VALID_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const getDefaultConditionValue = (
  type: PromotionConditionType,
  operator: PromotionConditionOperator
): Record<string, unknown> => {
  if (type === "time_range") {
    return { start_time: "", end_time: "" };
  }
  if (operator === "BETWEEN") {
    return { min: "", max: "" };
  }
  if (operator === "IN") {
    if (type === "weekday") {
      return { weekdays: [] };
    }
    return { values: [] };
  }
  if (type === "weekday") {
    return { value: "monday" };
  }
  return { value: "" };
};

export const promotionConditionSchema = z
  .object({
    promotion_id: z.number().int().min(1, "Promosi wajib dipilih"),
    condition_type: z.enum(promotionConditionTypeValues, {
      message: "Tipe syarat wajib dipilih",
    }),
    condition_operator: z.enum(promotionConditionOperatorValues, {
      message: "Operator syarat wajib dipilih",
    }),
    condition_value: z.record(z.string(), z.unknown()),
  })
  .superRefine((data, ctx) => {
    const { condition_type, condition_operator, condition_value } = data;

    if (!condition_value || typeof condition_value !== "object") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nilai syarat wajib diisi",
        path: ["condition_value"],
      });
      return;
    }

    // 1. Time Range condition
    if (condition_type === "time_range") {
      const startTime = condition_value.start_time ?? condition_value.start;
      const endTime = condition_value.end_time ?? condition_value.end;

      if (!startTime || typeof startTime !== "string" || startTime.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Waktu mulai wajib diisi",
          path: ["condition_value"],
        });
      }
      if (!endTime || typeof endTime !== "string" || endTime.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Waktu selesai wajib diisi",
          path: ["condition_value"],
        });
      }
      return;
    }

    // 2. BETWEEN operator
    if (condition_operator === "BETWEEN") {
      const min = condition_value.min ?? condition_value.from;
      const max = condition_value.max ?? condition_value.to;

      if (min === undefined || min === null || min === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nilai minimal wajib diisi",
          path: ["condition_value"],
        });
      }
      if (max === undefined || max === null || max === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nilai maksimal wajib diisi",
          path: ["condition_value"],
        });
      }

      if (
        min !== undefined &&
        min !== null &&
        min !== "" &&
        max !== undefined &&
        max !== null &&
        max !== ""
      ) {
        const numMin = Number(min);
        const numMax = Number(max);

        if (Number.isNaN(numMin)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nilai minimal harus berupa angka",
            path: ["condition_value"],
          });
        }
        if (Number.isNaN(numMax)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nilai maksimal harus berupa angka",
            path: ["condition_value"],
          });
        }
        if (!Number.isNaN(numMin) && !Number.isNaN(numMax)) {
          if (condition_type === "min_qty" && numMin < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Jumlah minimal kuantitas minimal 1",
              path: ["condition_value"],
            });
          }
          if (condition_type === "total_transaction" && numMin < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nominal transaksi tidak boleh negatif",
              path: ["condition_value"],
            });
          }
          if (numMax < numMin) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Nilai maksimal harus lebih besar atau sama dengan nilai minimal",
              path: ["condition_value"],
            });
          }
        }
      }
      return;
    }

    // 3. IN operator
    if (condition_operator === "IN") {
      if (condition_type === "weekday") {
        const weekdays = condition_value.weekdays ?? condition_value.values;
        if (!Array.isArray(weekdays) || weekdays.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Pilih minimal satu hari",
            path: ["condition_value"],
          });
          return;
        }

        const invalid = weekdays.some(
          (w) => typeof w !== "string" || !VALID_WEEKDAYS.includes(w.toLowerCase())
        );
        if (invalid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Pilihan hari tidak valid",
            path: ["condition_value"],
          });
        }
        return;
      }

      const list =
        condition_value.values ??
        condition_value.customer_group_ids ??
        condition_value.location_ids ??
        condition_value.channels ??
        condition_value.payment_methods ??
        (Array.isArray(condition_value.value) ? condition_value.value : null);

      if (!Array.isArray(list) || list.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Daftar nilai syarat tidak boleh kosong",
          path: ["condition_value"],
        });
        return;
      }

      if (condition_type === "min_qty") {
        const invalid = list.some((item) => {
          const n = Number(item);
          return Number.isNaN(n) || n < 1;
        });
        if (invalid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Semua nilai kuantitas harus berupa angka minimal 1",
            path: ["condition_value"],
          });
        }
      } else if (condition_type === "total_transaction") {
        const invalid = list.some((item) => {
          const n = Number(item);
          return Number.isNaN(n) || n < 0;
        });
        if (invalid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Semua nominal transaksi harus berupa angka tidak negatif",
            path: ["condition_value"],
          });
        }
      }
      return;
    }

    // 4. Comparison operators (=, >, <, >=, <=)
    const singleVal =
      condition_value.value ??
      condition_value.customer_group_id ??
      condition_value.location_id ??
      condition_value.channel ??
      condition_value.payment_method ??
      condition_value.id;

    if (singleVal === undefined || singleVal === null || singleVal === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nilai syarat wajib diisi",
        path: ["condition_value"],
      });
      return;
    }

    if (condition_type === "weekday") {
      if (
        typeof singleVal !== "string" ||
        !VALID_WEEKDAYS.includes(singleVal.toLowerCase())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Hari yang dipilih tidak valid",
          path: ["condition_value"],
        });
      }
    } else if (condition_type === "min_qty") {
      const num = Number(singleVal);
      if (Number.isNaN(num) || num < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kuantitas minimal harus berupa angka minimal 1",
          path: ["condition_value"],
        });
      }
    } else if (condition_type === "total_transaction") {
      const num = Number(singleVal);
      if (Number.isNaN(num) || num < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nominal transaksi harus berupa angka dan tidak boleh negatif",
          path: ["condition_value"],
        });
      }
    }
  });

export type PromotionConditionFormData = z.infer<typeof promotionConditionSchema>;
