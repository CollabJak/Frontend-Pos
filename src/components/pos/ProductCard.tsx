import Button from "../ui/button/Button";

const formatAmount = (value: number): string => new Intl.NumberFormat("id-ID").format(value);

interface ProductCardProps {
  name: string;
  price: number;
  stock: number;
  disabled: boolean;
  onAdd: () => void;
}

export default function ProductCard({
  name,
  price,
  stock,
  disabled,
  onAdd,
}: ProductCardProps) {
  const stockBadgeClass =
    stock > 0
      ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
      : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">{name}</h4>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Price: {formatAmount(price)}</p>
      <div className="mt-3">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stockBadgeClass}`}>
          Stock: {stock}
        </span>
      </div>
      <div className="mt-4">
        <Button
          size="sm"
          variant={disabled ? "outline" : "primary"}
          className="w-full"
          onClick={onAdd}
          disabled={disabled}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
