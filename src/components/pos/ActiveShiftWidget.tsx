import type { PosShift } from "../../types/types";
import { formatCurrency } from "../../utils/currency";

interface ActiveShiftWidgetProps {
  shift: PosShift;
  cashierName: string;
  onAddCashMovement: () => void;
  onCloseShift: () => void;
}

export default function ActiveShiftWidget({
  shift,
  cashierName,
  onAddCashMovement,
  onCloseShift,
}: ActiveShiftWidgetProps) {

  // Format local date time
  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " (" + date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }) + ")";
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Shift Details */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Shift Register Open
            </span>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

          {/* Cashier Info */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Active Cashier
            </p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
              {cashierName}
            </p>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

          {/* Opened At */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Session Opened At
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {formatTime(shift.opened_at)}
            </p>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

          {/* Expected Cash */}
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Expected Cash Drawer Value
            </p>
            <p className="text-sm font-black text-brand-600 dark:text-brand-400">
              {formatCurrency(shift.expected_cash)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <button
            onClick={onAddCashMovement}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg
              className="mr-1.5 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Adjust Cash
          </button>
          
          <button
            onClick={onCloseShift}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 focus:outline-hidden dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          >
            <svg
              className="mr-1.5 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
            Close Register Shift
          </button>
        </div>
      </div>
    </div>
  );
}
