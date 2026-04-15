import Badge from "../ui/badge/Badge";
import { PosGridItem } from "../../stores/pos.store";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value).replace("Rp", "Rp.");

interface ProductCardProps {
  product: PosGridItem;
  disabled: boolean;
  onAdd: () => void;
}

export default function ProductCard({
  product,
  disabled,
  onAdd,
}: ProductCardProps) {
  return (
    <div
      onClick={!disabled ? onAdd : undefined}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03] ${disabled ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer active:scale-[0.98]"
        }`}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab752?q=80&w=1000&auto=format&fit=crop"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 line-clamp-2">
            {product.name}
          </h4>
          <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(product.price)}
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {product.description || "Premium quality product crafted with care."}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {product.isBestSeller && (
            <Badge color="success" size="sm" variant="light">
              Best Seller
            </Badge>
          )}
          <Badge color="info" size="sm" variant="light">
            12OZ
          </Badge>
        </div>
      </div>

      {disabled && (
        <div className="absolute inset-x-0 bottom-0 bg-red-500 py-1 text-center text-[10px] font-bold uppercase text-white">
          Out of Stock
        </div>
      )}
    </div>
  );
}
