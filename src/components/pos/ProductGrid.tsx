import ProductCard from "./ProductCard";
import { PosGridItem } from "../../stores/pos.store";

interface ProductGridProps {
  products: PosGridItem[];
  isLoading: boolean;
  errorMessage: string | null;
  onAddToCart: (product: PosGridItem) => void;
}

export default function ProductGrid({
  products,
  isLoading,
  errorMessage,
  onAddToCart,
}: ProductGridProps) {
  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[320px] animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
          ))}
        </div>
      ) : null}

      {!isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Tidak ada produk yang ditemukan pada kategori ini.</p>
        </div>
      ) : null}

      {!isLoading && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.variantId}
              product={product}
              disabled={product.stock <= 0}
              onAdd={() => onAddToCart(product)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
