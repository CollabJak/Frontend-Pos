const formatAmount = (value: number): string => new Intl.NumberFormat("id-ID").format(value);

export interface CartRowItem {
  variantId: number;
  name: string;
  qty: number;
  unitPrice: number;
  maxQty: number;
}

interface CartItemProps {
  item: CartRowItem;
  onIncrease: (variantId: number) => void;
  onDecrease: (variantId: number) => void;
  onRemove: (variantId: number) => void;
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const lineTotal = item.qty * item.unitPrice;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{item.name}</p>
        <button
          type="button"
          onClick={() => onRemove(item.variantId)}
          className="text-xs font-medium text-red-600 transition hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
        >
          Remove
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 w-8 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => onDecrease(item.variantId)}
            disabled={item.qty <= 1}
          >
            -
          </button>
          <span className="min-w-7 text-center text-sm font-semibold text-gray-800 dark:text-white/90">
            {item.qty}
          </span>
          <button
            type="button"
            className="h-8 w-8 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => onIncrease(item.variantId)}
            disabled={item.qty >= item.maxQty}
          >
            +
          </button>
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{formatAmount(lineTotal)}</p>
      </div>
    </div>
  );
}
