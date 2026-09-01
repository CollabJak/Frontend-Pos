import { z } from "zod";

export const promotionActionTypeValues = [
  "discount_percent",
  "discount_amount",
  "override_price",
  "free_item",
  "cashback",
] as const;

export type PromotionActionType = (typeof promotionActionTypeValues)[number];

/**
 * Tipe aksi yang DISEMBUNYIKAN dari form pembuatan/perubahan promosi
 * (Harga Khusus & Item Gratis). Value tetap valid di schema, backend, dan
 * pricing engine — data lama dengan tipe ini tetap tampil dan bisa diedit.
 */
export const hiddenPromotionActionTypes = [
  "override_price",
  "free_item",
] as const;

export const visiblePromotionActionTypes = promotionActionTypeValues.filter(
  (value): value is PromotionActionType =>
    !(hiddenPromotionActionTypes as readonly string[]).includes(value)
);

export const promotionActionTypeLabels: Record<PromotionActionType, string> = {
  discount_percent: "Diskon Persentase",
  discount_amount: "Diskon Nominal",
  override_price: "Harga Khusus",
  free_item: "Item Gratis",
  cashback: "Cashback",
};

export const promotionActionSchema = z
  .object({
    promotion_id: z.number().int().min(1, "Promosi wajib dipilih"),
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

export type PromotionActionFormData = z.infer<typeof promotionActionSchema>;
