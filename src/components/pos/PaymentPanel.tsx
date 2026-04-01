import Button from "../ui/button/Button";
import { Input } from "../form/input/InputField";

const formatAmount = (value: number): string => new Intl.NumberFormat("id-ID").format(value);

interface PaymentPanelProps {
  estimatedTotal: number;
  authoritativeTotal?: number | null;
  paid?: number | null;
  change?: number | null;
  amountPaid: number | "";
  onAmountPaidChange: (value: number | "") => void;
  isPaying: boolean;
  disabled: boolean;
  errorMessage: string | null;
  onPayNow: () => void;
}

export default function PaymentPanel({
  estimatedTotal,
  authoritativeTotal,
  paid,
  change,
  amountPaid,
  onAmountPaidChange,
  isPaying,
  disabled,
  errorMessage,
  onPayNow,
}: PaymentPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">Estimated Total (incl. tax)</span>
          <span className="text-lg font-semibold text-gray-800 dark:text-white/90">{formatAmount(estimatedTotal)}</span>
        </div>

        {authoritativeTotal !== null && authoritativeTotal !== undefined ? (
          <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Final Total</span>
              <span className="font-semibold text-gray-800 dark:text-white/90">{formatAmount(authoritativeTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Paid</span>
              <span className="font-semibold text-gray-800 dark:text-white/90">{formatAmount(paid ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Change</span>
              <span className="font-semibold text-gray-800 dark:text-white/90">{formatAmount(change ?? 0)}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="amount-paid" className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
          Cash Received
        </label>
        <Input
          id="amount-paid"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter paid amount"
          value={amountPaid}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw.trim() === "") {
              onAmountPaidChange("");
              return;
            }

            const parsed = Number(raw);
            onAmountPaidChange(Number.isFinite(parsed) ? parsed : "");
          }}
        />
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
