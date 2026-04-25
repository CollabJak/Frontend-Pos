import React from "react";
import { useDashboardSummary } from "../../hooks/useDashboardSummary";

const TransactionStatusDetails: React.FC = () => {
  const { data: summaryResponse, isLoading, isError } = useDashboardSummary();
  const summaryData = summaryResponse?.data;

  const calculatePercent = (value: number) => {
    if (!summaryData || summaryData.transactions_total === 0) return "0%";
    return `${Math.round((value / summaryData.transactions_total) * 100)}%`;
  };

  const statusItems = [
    {
      label: "Paid",
      value: summaryData?.transactions_paid ?? 0,
      percent: calculatePercent(summaryData?.transactions_paid ?? 0),
      color: "bg-success-500",
      textColor: "text-success-700 dark:text-success-400",
      bgColor: "bg-success-50 dark:bg-success-500/5",
    },
    {
      label: "Pending",
      value: summaryData?.transactions_pending ?? 0,
      percent: calculatePercent(summaryData?.transactions_pending ?? 0),
      color: "bg-warning-500",
      textColor: "text-warning-700 dark:text-warning-400",
      bgColor: "bg-warning-50 dark:bg-warning-500/5",
    },
    {
      label: "Failed",
      value: summaryData?.transactions_failed ?? 0,
      percent: calculatePercent(summaryData?.transactions_failed ?? 0),
      color: "bg-error-500",
      textColor: "text-error-700 dark:text-error-400",
      bgColor: "bg-error-50 dark:bg-error-500/5",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex gap-4 animate-pulse mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-16 bg-gray-100 rounded-xl dark:bg-gray-800"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-4 p-3 text-xs text-red-500 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-900/20">
        Data transaksi belum bisa dimuat. Mohon coba lagi nanti.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      {statusItems.map((item, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 ${item.bgColor}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-widest leading-none">
                {item.label}
              </p>
              <p className={`text-xl font-bold mt-1.5 leading-none ${item.textColor}`}>
                {item.value.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold ${item.textColor}`}>
              {item.percent}
            </span>
            <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full ${item.color} transition-all duration-500`}
                style={{ width: item.percent }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionStatusDetails;
