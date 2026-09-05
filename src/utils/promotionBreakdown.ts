import type { PosCalculateCartResult } from "../services/api/posService";

/**
 * Util agregasi breakdown promosi untuk UI cart (FR-7 BRD v1.4).
 * FE mengagregasi sendiri dari field kontrak FR-6, tanpa endpoint tambahan:
 * - Diskon  = items[].promotion_breakdown (Mode A per-variant) + transaction_discounts (Mode B)
 * - Cashback = cashbacks (flat, tidak mengurangi total — FR-4)
 */

export interface PromotionAmountRow {
  promotion_id: number;
  promotion_name: string;
  amount: number;
}

/**
 * Gabungkan semua sumber diskon cart per promosi (Mode A + Mode B),
 * dijumlahkan per promotion_id agar popup menampilkan satu baris per promo.
 */
export function aggregateDiscountRows(
  snapshot: PosCalculateCartResult | null
): PromotionAmountRow[] {
  if (!snapshot) {
    return [];
  }

  const byId = new Map<number, PromotionAmountRow>();

  const addRow = (promotionId: number, promotionName: string, amount: number) => {
    const existing = byId.get(promotionId);
    if (existing) {
      existing.amount += amount;
      return;
    }
    byId.set(promotionId, { promotion_id: promotionId, promotion_name: promotionName, amount });
  };

  (snapshot.items ?? []).forEach((item) => {
    (item.promotion_breakdown ?? []).forEach((row) => {
      addRow(Number(row.promotion_id), String(row.promotion_name ?? ""), Number(row.amount ?? 0));
    });
  });

  (snapshot.transaction_discounts ?? []).forEach((row) => {
    addRow(Number(row.promotion_id), String(row.promotion_name ?? ""), Number(row.amount ?? 0));
  });

  return Array.from(byId.values());
}

/** Baris cashback untuk popup (sudah diagregasi per promosi oleh backend). */
export function getCashbackRows(
  snapshot: PosCalculateCartResult | null
): PromotionAmountRow[] {
  if (!snapshot) {
    return [];
  }

  return (snapshot.cashbacks ?? []).map((row) => ({
    promotion_id: Number(row.promotion_id),
    promotion_name: String(row.promotion_name ?? ""),
    amount: Number(row.amount ?? 0),
  }));
}
