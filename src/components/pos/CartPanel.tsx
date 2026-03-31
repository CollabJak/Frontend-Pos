import CartItem, { CartRowItem } from "./CartItem";

interface CartPanelProps {
  items: CartRowItem[];
  errorMessage: string | null;
  onIncrease: (variantId: number) => void;
  onDecrease: (variantId: number) => void;
  onRemove: (variantId: number) => void;
}

export default function CartPanel({
  items,
  errorMessage,
  onIncrease,
  onDecrease,
  onRemove,
}: CartPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <span>Item</span>
        <span>Qty</span>
        <span>Price</span>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cart is empty.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <CartItem
              key={item.variantId}
              item={item}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
