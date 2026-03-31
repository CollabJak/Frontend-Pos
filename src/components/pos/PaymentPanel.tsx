import Button from "../ui/button/Button";

const formatAmount = (value: number): string => new Intl.NumberFormat("id-ID").format(value);

interface PaymentPanelProps {
  total: number;
  isPaying: boolean;
  disabled: boolean;
  errorMessage: string | null;
  onPayNow: () => void;
}

export default function PaymentPanel({
  total,
  isPaying,
  disabled,
  errorMessage,
  onPayNow,
}: PaymentPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">Total</span>
          <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{formatAmount(total)}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      <Button className="w-full" onClick={onPayNow} disabled={disabled || isPaying}>
        {isPaying ? "Processing..." : "Pay Now"}
      </Button>
    </div>
  );
}
