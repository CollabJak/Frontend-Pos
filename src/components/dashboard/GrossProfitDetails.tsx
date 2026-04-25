import React from "react";
import { useGrossProfitSummary } from "../../hooks/useGrossProfitSummary";

const formatIDR = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value).replace("Rp", "Rp.");

const GrossProfitDetails: React.FC = () => {
  const { data: profitResponse, isLoading, isError } = useGrossProfitSummary();
  const profitData = profitResponse?.data;

  // Use gross_revenue as the 100% basis if available, else 0
  const calculatePercent = (value: number) => {
    if (!profitData || profitData.gross_revenue === 0) return "0%";
    const percent = Math.round((value / profitData.gross_revenue) * 100);
    return `${percent}%`;
  };

  const statusItems = [
    {
      label: "Gross Revenue",
      value: profitData?.gross_revenue ?? 0,
      percent: "100%", // Base
      color: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-500/5",
    },
    {
      label: "Gross Cost",
      value: profitData?.gross_cost ?? 0,
      percent: calculatePercent(profitData?.gross_cost ?? 0),
      color: "bg-orange-500",
      textColor: "text-orange-700 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-500/5",
    },
    {
      label: "Gross Profit",
      value: profitData?.gross_profit ?? 0,
      percent: calculatePercent(profitData?.gross_profit ?? 0),
      color: "bg-gray-300",
      textColor: "text-gray-300 dark:text-gray-300",
      bgColor: "bg-brand-50 dark:bg-brand-500/5",
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
        Data gross profit belum bisa dimuat. Mohon coba lagi nanti.
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
                {formatIDR(item.value)}
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

export default GrossProfitDetails;
