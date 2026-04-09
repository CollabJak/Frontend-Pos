import { PosCartItem } from "../../stores/pos.store";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value).replace("Rp", "Rp.");

interface CartItemProps {
  item: PosCartItem;
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
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-transparent bg-white p-3 transition-all hover:border-gray-100 hover:shadow-sm dark:bg-white/[0.03] dark:hover:border-gray-800">
      <div className="flex items-center gap-4">
        {/* Item Image */}
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-4 ring-gray-50 dark:bg-white/5 dark:ring-white/5">
          <img
            src={item.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=1000&auto=format&fit=crop"}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Item Info */}
        <div className="flex flex-col min-w-0">
          <h5 className="truncate text-sm font-bold text-gray-800 dark:text-white/90">
            {item.variantName}
          </h5>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {item.name}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 text-right">
        <span className="text-sm font-bold text-gray-800 dark:text-white/90">
          {formatCurrency(item.unitPrice)}
        </span>
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-1 dark:bg-white/5">
          <button
            onClick={() => (item.qty > 1 ? onDecrease(item.variantId) : onRemove(item.variantId))}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:bg-white/10 dark:text-gray-500 dark:hover:bg-white/20 dark:hover:text-gray-300 shadow-sm"
          >
            -
          </button>
          <span className="min-w-[12px] text-center text-xs font-bold text-gray-700 dark:text-gray-300">
            {item.qty}
          </span>
          <button
            onClick={() => onIncrease(item.variantId)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500 text-white transition-colors hover:bg-brand-600 active:scale-95 shadow-sm"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
