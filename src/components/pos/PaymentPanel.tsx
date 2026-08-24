import Button from "../ui/button/Button";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value).replace("Rp", "Rp.");

const getMethodIconPath = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "cash":
      return "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z";
    case "qris":
      return "M12 4v1m6 11h.01M18 8h.01M6 12h.01M18 12h.01M6 16h.01M12 16h.01M18 16h.01M6 8h.01M12 8h.01M12 12h.01M4 4h4v4H4V4zm0 12h4v4H4v-4zm12-12h4v4h-4V4z";
    default:
      return "M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z";
  }
};

interface PaymentPanelProps {
  subtotal: number;
  discount: number;
  tax: number;
  taxLabel?: string;
  total: number;
  isPaying: boolean;
  disabled: boolean;
  errorMessage: string | null;
  onPayNow: () => void;
  onReprintReceipt?: () => void;
  reprintDisabled?: boolean;
  isCalculatingPrice?: boolean;
  paymentMethods?: any[];
  selectedPaymentMethodId?: number | null;
  onSelectPaymentMethod?: (id: number | null) => void;
}

export default function PaymentPanel({
  subtotal,
  discount,
  tax,
  taxLabel,
  total,
  isPaying,
  disabled,
  errorMessage,
  onPayNow,
  isCalculatingPrice = false,
  paymentMethods = [],
  selectedPaymentMethodId = null,
  onSelectPaymentMethod,
}: PaymentPanelProps) {
  return (
    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
      {/* Totals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal</span>
          {isCalculatingPrice ? (
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : (
            <span className="text-sm font-bold text-gray-800 dark:text-white/90">{formatCurrency(subtotal)}</span>
          )}
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-success-600 dark:text-success-400">
            <span className="text-sm font-medium">Diskon</span>
            {isCalculatingPrice ? (
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <span className="text-sm font-bold">- {formatCurrency(discount)}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {taxLabel || (tax > 0 ? "Pajak" : "Pajak (0%)")}
          </span>
          {isCalculatingPrice ? (
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : (
            <span className="text-sm font-bold text-gray-800 dark:text-white/90">{formatCurrency(tax)}</span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-black tracking-tight text-gray-800 dark:text-white">Total</span>
          {isCalculatingPrice ? (
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : (
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {formatCurrency(total)}
            </span>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Payment Methods */}
      {paymentMethods && paymentMethods.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => {
            const isSelected = selectedPaymentMethodId === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onSelectPaymentMethod?.(method.id)}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl py-3.5 transition-all duration-300 active:scale-95 border ${
                  isSelected
                    ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/25 dark:bg-brand-600 dark:border-brand-600"
                    : "bg-brand-50/50 border-transparent text-brand-600 hover:bg-brand-50 dark:bg-brand-500/5 dark:text-brand-400 dark:hover:bg-brand-500/10"
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getMethodIconPath(method.type)} />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-full px-1">
                  {method.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Pay Button */}
      <Button
        className="h-16 w-full rounded-xl text-lg font-black uppercase tracking-widest shadow-lg transition-all active:scale-[0.98]"
        onClick={onPayNow}
        disabled={disabled || isPaying || isCalculatingPrice}
      >
        {isPaying ? "Memproses..." : isCalculatingPrice ? "Menghitung..." : `Bayar ${formatCurrency(total)}`}
      </Button>
    </div>
  );
}
