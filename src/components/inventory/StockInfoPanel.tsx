interface StockInfoPanelProps {
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  newStockPreview: number;
  isInvalidPreview: boolean;
}

const formatDecimal = (value: number): string => {
  if (Number.isInteger(value)) {
    return `${value}`;
  }

  return value.toFixed(6);
};

interface InfoItemProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoItem({ label, value, highlight = false }: InfoItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-semibold ${
          highlight ? "text-brand-600 dark:text-brand-400" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function StockInfoPanel({
  currentStock,
  reservedStock,
  availableStock,
  newStockPreview,
  isInvalidPreview,
}: StockInfoPanelProps) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Stok Saat Ini" value={formatDecimal(currentStock)} />
        <InfoItem label="Stok Direservasi" value={formatDecimal(reservedStock)} />
        <InfoItem label="Stok Tersedia" value={formatDecimal(availableStock)} />
        <InfoItem label="Stok Baru (Pratinjau)" value={formatDecimal(newStockPreview)} highlight />
      </div>

      {isInvalidPreview && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
          Pratinjau stok baru tidak boleh kurang dari nol.
        </p>
      )}
    </div>
  );
}
