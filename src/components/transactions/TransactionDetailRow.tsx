import { useMemo } from "react";
import { useTransactionDetail } from "../../hooks/api/useTransactionDetail";
import { formatCurrency } from "../../utils/currency";
import type { PromotionApplied } from "../../types/transaction";

interface Props {
  transactionId: number;
  onCollapse: () => void;
}

interface AggregatedPromotion {
  promotion_name: string;
  amount: number;
}

const toNumber = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function TransactionDetailRow({ transactionId, onCollapse }: Props) {
  const { data, isLoading, isError } = useTransactionDetail(transactionId);

  const itemLevelPromotions = useMemo<AggregatedPromotion[]>(() => {
    if (!data?.data) return [];

    const promoMap = new Map<string, number>();
    data.data.items.forEach((item) => {
      (item.promotions_applied || []).forEach((promo: PromotionApplied) => {
        const current = promoMap.get(promo.promotion_name) || 0;
        promoMap.set(promo.promotion_name, current + parseFloat(promo.amount));
      });
    });

    return Array.from(promoMap.entries()).map(([name, amount]) => ({
      promotion_name: name,
      amount,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <tr>
        <td colSpan={10} className="px-5 py-8 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Memuat detail transaksi...</div>
        </td>
      </tr>
    );
  }

  if (isError || !data?.data) {
    return (
      <tr>
        <td colSpan={10} className="px-5 py-4 text-center">
          <div className="text-sm text-red-500">Gagal memuat detail transaksi</div>
        </td>
      </tr>
    );
  }

  const detail = data.data;
  const breakdown = detail.pricing_breakdown;
  const hasItemLevelPromo = itemLevelPromotions.length > 0;
  const hasTransactionPromo = breakdown.transaction_discount_details && breakdown.transaction_discount_details.length > 0;
  const hasMemberDiscount = parseFloat(breakdown.member_discount) > 0;
  const hasAnyDiscount = hasItemLevelPromo || hasTransactionPromo || hasMemberDiscount;

  return (
    <tr className="bg-gray-50 dark:bg-gray-900/50">
      <td colSpan={10} className="px-5 py-6">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Nama Item</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">QTY</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Harga</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Diskon</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {detail.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.sku}</div>
                        {item.promotions_applied && item.promotions_applied.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.promotions_applied.map((promo, idx) => (
                              <div key={idx} className="text-xs text-brand-600 dark:text-brand-400">
                                Promo: {promo.promotion_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{parseFloat(item.qty)}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(toNumber(item.price))}</td>
                      <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                        {parseFloat(item.discount) > 0 ? `-${formatCurrency(toNumber(item.discount))}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(toNumber(item.subtotal))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex justify-end">
              <div className="w-full max-w-md space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal Transaksi</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(toNumber(breakdown.subtotal))}</span>
                </div>

                {hasItemLevelPromo && (
                  <>
                    <div className="border-t border-gray-200 pt-2.5 dark:border-gray-700"></div>
                    <div className="text-gray-600 dark:text-gray-400">Detail Diskon:</div>
                    {itemLevelPromotions.map((promo, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-gray-500 dark:text-gray-400">• {promo.promotion_name}</span>
                        <span className="text-red-600 dark:text-red-400">-{formatCurrency(promo.amount)}</span>
                      </div>
                    ))}
                  </>
                )}

                {hasTransactionPromo && (
                  <>
                    <div className="border-t border-gray-200 pt-2.5 dark:border-gray-700"></div>
                    <div className="text-gray-600 dark:text-gray-400">Diskon Transaksi:</div>
                    {breakdown.transaction_discount_details.map((promo, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-gray-500 dark:text-gray-400">• {promo.promotion_name}</span>
                        <span className="text-red-600 dark:text-red-400">-{formatCurrency(toNumber(promo.amount))}</span>
                      </div>
                    ))}
                  </>
                )}

                {hasMemberDiscount && (
                  <>
                    <div className="border-t border-gray-200 pt-2.5 dark:border-gray-700"></div>
                    <div className="text-gray-600 dark:text-gray-400">Diskon Member:</div>
                    <div className="flex justify-between pl-4">
                      <span className="text-gray-500 dark:text-gray-400">• Harga Khusus Member</span>
                      <span className="text-red-600 dark:text-red-400">-{formatCurrency(toNumber(breakdown.member_discount))}</span>
                    </div>
                  </>
                )}

                {hasAnyDiscount && (
                  <>
                    <div className="border-t border-gray-200 pt-2.5 dark:border-gray-700"></div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">Total Diskon</span>
                      <span className="text-red-600 dark:text-red-400">
                        -{formatCurrency(
                          toNumber(breakdown.transaction_discount) +
                          toNumber(breakdown.member_discount) +
                          toNumber(breakdown.item_level_discount)
                        )}
                      </span>
                    </div>
                  </>
                )}

                {parseFloat(breakdown.tax_amount) > 0 && (
                  <>
                    <div className="border-t border-gray-200 pt-2.5 dark:border-gray-700"></div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pajak</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(toNumber(breakdown.tax_amount))}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-gray-300 pt-2.5 dark:border-gray-600"></div>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-800 dark:text-white">Total Transaksi</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(toNumber(breakdown.grand_total))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onCollapse}
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              <span>Tutup Detail</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
