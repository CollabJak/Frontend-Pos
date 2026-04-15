import Button from "../ui/button/Button";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value).replace("Rp", "Rp.");

interface PaymentPanelProps {
  estimatedTotal: number;
  authoritativeTotal?: number | null;
  isPaying: boolean;
  disabled: boolean;
  errorMessage: string | null;
  onPayNow: () => void;
  onReprintReceipt?: () => void;
  reprintDisabled?: boolean;
}

export default function PaymentPanel({
  estimatedTotal,
  authoritativeTotal,
  isPaying,
  disabled,
  errorMessage,
  onPayNow,
}: PaymentPanelProps) {
  const subtotal = estimatedTotal / 1.11; // Reverse 11% tax for demo
  const tax = estimatedTotal - subtotal;

  return (
    <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
      {/* Totals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subtotal</span>
          <span className="text-sm font-bold text-gray-800 dark:text-white/90">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax (11%)</span>
          <span className="text-sm font-bold text-gray-800 dark:text-white/90">{formatCurrency(tax)}</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-black tracking-tight text-gray-800 dark:text-white">Total</span>
          <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
            {formatCurrency(authoritativeTotal ?? estimatedTotal)}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Payment Methods */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "card", label: "CARD", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" },
          { id: "cash", label: "CASH", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
          { id: "scan", label: "SCAN", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" },
        ].map((method) => (
          <button
            key={method.id}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-brand-50/50 py-4 text-brand-600 transition-all hover:bg-brand-50 active:scale-95 dark:bg-brand-500/5 dark:text-brand-400 dark:hover:bg-brand-500/10"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={method.icon} />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
          </button>
        ))}
      </div>

      {/* Pay Button */}
      <Button
        className="h-16 w-full rounded-xl text-lg font-black uppercase tracking-widest shadow-lg transition-all active:scale-[0.98]"
        onClick={onPayNow}
        disabled={disabled || isPaying}
      >
        {isPaying ? "Processing..." : `Pay ${formatCurrency(authoritativeTotal ?? estimatedTotal)}`}
      </Button>
    </div>
  );
}
