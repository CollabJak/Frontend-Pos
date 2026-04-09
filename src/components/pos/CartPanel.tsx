import CartItem from "./CartItem";
import { PosCartItem } from "../../stores/pos.store";

interface CartPanelProps {
  items: PosCartItem[];
  errorMessage: string | null;
  onIncrease: (variantId: number) => void;
  onDecrease: (variantId: number) => void;
  onRemove: (variantId: number) => void;
  onClear: () => void;
}

export default function CartPanel({
  items,
  errorMessage,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
}: CartPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white">
          Active Cart
        </h3>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-bold tracking-widest text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 uppercase"
          >
            Clear All
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="mb-4 rounded-full bg-gray-100 p-6 dark:bg-white/5">
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
              No items in cart
            </p>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <CartItem
                key={item.variantId}
                item={item}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))}
            
            {/* End of items indicator */}
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <svg
                className="mb-2 h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                End of Items
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
