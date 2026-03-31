import Label from "../form/Label";
import { Input } from "../form/input/InputField";
import ProductCard from "./ProductCard";

export interface ProductGridItem {
  variantId: number;
  name: string;
  price: number;
  stock: number;
}

interface ProductGridProps {
  search: string;
  onSearchChange: (value: string) => void;
  products: ProductGridItem[];
  isLoading: boolean;
  errorMessage: string | null;
  onAddToCart: (product: ProductGridItem) => void;
}

export default function ProductGrid({
  search,
  onSearchChange,
  products,
  isLoading,
  errorMessage,
  onAddToCart,
}: ProductGridProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pos-search">Search</Label>
        <Input
          id="pos-search"
          placeholder="Search product..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading products...</p>
      ) : null}

      {!isLoading && products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No products found.</p>
      ) : null}

      {!isLoading && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.variantId}
              name={product.name}
              price={product.price}
              stock={product.stock}
              disabled={product.stock <= 0}
              onAdd={() => onAddToCart(product)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
