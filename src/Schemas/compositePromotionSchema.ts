import { z } from "zod";
import {
  promotionConditionOperatorValues,
  promotionConditionTypeValues,
} from "./promotionConditionSchema";
import { promotionActionTypeValues } from "./promotionActionSchema";

const VALID_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Single Condition Item Schema (without requiring promotion_id)
export const singlePromotionConditionSchema = z
  .object({
    id: z.number().optional(),
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
        condition_value.customer_group_ids ??
        condition_value.location_ids ??
        condition_value.payment_method_ids ??
        condition_value.payment_methods ??
        condition_value.values ??
        condition_value.channels ??
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
      condition_value.customer_group_id ??
      condition_value.location_id ??
      condition_value.payment_method_id ??
      condition_value.payment_method ??
      condition_value.value ??
      condition_value.channel ??
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

// Single Action Item Schema (without requiring promotion_id)
export const singlePromotionActionSchema = z
  .object({
    id: z.number().optional(),
    action_type: z.enum(promotionActionTypeValues, {
      message: "Tipe aksi wajib dipilih",
    }),
    action_value: z.record(z.string(), z.unknown()),
  })
  .superRefine((data, ctx) => {
    const { action_type, action_value } = data;

    if (!action_value || typeof action_value !== "object") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nilai aksi wajib diisi",
        path: ["action_value"],
      });
      return;
    }

    if (action_type === "discount_percent") {
      const val = action_value.value ?? action_value.percent;
      if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Persentase diskon wajib diisi",
          path: ["action_value", "value"],
        });
      } else {
        const num = Number(val);
        if (num <= 0 || num > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Persentase diskon harus di antara 0.01% dan 100%",
            path: ["action_value", "value"],
          });
        }
      }
    } else if (action_type === "discount_amount") {
      const val = action_value.value ?? action_value.amount;
      if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah diskon wajib diisi",
          path: ["action_value", "value"],
        });
      } else if (Number(val) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah diskon harus lebih dari 0",
          path: ["action_value", "value"],
        });
      }
    } else if (action_type === "override_price") {
      const val = action_value.value ?? action_value.price;
      if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harga khusus wajib diisi",
          path: ["action_value", "value"],
        });
      } else if (Number(val) < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harga khusus tidak boleh kurang dari 0",
          path: ["action_value", "value"],
        });
      }
    } else if (action_type === "cashback") {
      const val = action_value.value ?? action_value.amount;
      if (val === "" || val === null || val === undefined || Number.isNaN(Number(val))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah cashback wajib diisi",
          path: ["action_value", "value"],
        });
      } else if (Number(val) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah cashback harus lebih dari 0",
          path: ["action_value", "value"],
        });
      }
    } else if (action_type === "free_item") {
      const variantId = action_value.product_variant_id ?? action_value.item_id;
      const itemName = action_value.item_name ?? action_value.item_code;
      const hasVariant =
        variantId !== undefined &&
        variantId !== null &&
        variantId !== "" &&
        !Number.isNaN(Number(variantId)) &&
        Number(variantId) > 0;
      const hasItemName = typeof itemName === "string" && itemName.trim() !== "";

      if (!hasVariant && !hasItemName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Varian produk gratis wajib dipilih",
          path: ["action_value", "product_variant_id"],
        });
      }
      const qty = action_value.qty ?? action_value.quantity;
      if (qty === "" || qty === null || qty === undefined || Number.isNaN(Number(qty)) || Number(qty) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah item gratis minimal 1",
          path: ["action_value", "qty"],
        });
      }
    } else if (action_type === "bundle_price") {
      const qty = action_value.qty ?? action_value.min_qty;
      if (qty === "" || qty === null || qty === undefined || Number.isNaN(Number(qty)) || Number(qty) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Jumlah paket minimal 1",
          path: ["action_value", "qty"],
        });
      }
      const price = action_value.price ?? action_value.value;
      if (price === "" || price === null || price === undefined || Number.isNaN(Number(price))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harga paket wajib diisi",
          path: ["action_value", "price"],
        });
      } else if (Number(price) < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Harga paket tidak boleh kurang dari 0",
          path: ["action_value", "price"],
        });
      }
    }
  });

// Single Product Item Schema
export const singlePromotionProductSchema = z.object({
  id: z.number().optional(),
  product_variant_id: z
    .number({ message: "Varian produk wajib dipilih" })
    .int("ID varian produk harus bilangan bulat")
    .min(1, "Varian produk wajib dipilih"),
  product_variant_name: z.string().optional(),
});

// Composite Promotion Schema
export const compositePromotionSchema = z
  .object({
    // Step 1: Info Promosi
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
    end_date: z.string().optional().nullable(),
    is_active: z.boolean(),

    // Step 2: Syarat Promosi (0..N)
    conditions: z.array(singlePromotionConditionSchema),

    // Step 3: Aksi Promosi (1..N)
    actions: z
      .array(singlePromotionActionSchema)
      .min(1, "Minimal harus menambahkan 1 aksi promosi"),

    // Step 4: Produk Promosi (0..N)
    products: z.array(singlePromotionProductSchema),
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

export type SinglePromotionConditionFormData = z.infer<typeof singlePromotionConditionSchema>;
export type SinglePromotionActionFormData = z.infer<typeof singlePromotionActionSchema>;
export type SinglePromotionProductFormData = z.infer<typeof singlePromotionProductSchema>;
export type CompositePromotionFormData = z.infer<typeof compositePromotionSchema>;
