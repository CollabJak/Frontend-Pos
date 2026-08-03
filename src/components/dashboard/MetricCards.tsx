import React from "react";
import {
  DollarLineIcon,
  BoxIconLine,
  PieChartIcon,
  AlertIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { useInventorySummary } from "../../hooks/useInventorySummary";
import { useDashboardSummary } from "../../hooks/useDashboardSummary";
import { useIncomeSummary } from "../../hooks/useIncomeSummary";
import { useGrossProfitSummary } from "../../hooks/useGrossProfitSummary";

const formatIDR = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value).replace("Rp", "Rp.");

const MetricCards: React.FC = () => {
  const { data: invData, isLoading: invLoading, isError: invError } = useInventorySummary();
  const { data: summaryResponse, isLoading: summaryLoading, isError: summaryError } = useDashboardSummary();
  const { data: incomeResponse, isLoading: incomeLoading, isError: incomeError } = useIncomeSummary();
  const { data: profitResponse, isLoading: profitLoading, isError: profitError } = useGrossProfitSummary();

  const summaryData = summaryResponse?.data;
  const incomeData = incomeResponse?.data;
  const profitData = profitResponse?.data;

  const metrics = [
    {
      title: "LABA KOTOR",
      value: profitLoading ? "..." : profitError ? "Error" : formatIDR(profitData?.gross_profit ?? 0),
      change: profitLoading ? "..." : (
        <div className="flex items-center gap-1">
          <span className={`text-xs font-bold uppercase ${(profitData?.gross_profit ?? 0) >= 0 ? "text-success-600" : "text-error-600"
            }`}>
            Margin: {profitData?.gross_margin_percent ?? 0}%
          </span>
          <span className="text-gray-600 text-xs ml-1 font-medium italic">
            (Omzet - HPP)
          </span>
        </div>
      ),
      icon: <BoxIconLine className="text-brand-500 size-6" />,
      badge: { color: "primary", label: "LABA" },
      trend: "custom",
    },
    {
      title: "PENDAPATAN TERBAYAR",
      value: incomeLoading ? "..." : incomeError ? "Error" : formatIDR(incomeData?.paid_revenue ?? 0),
      change: incomeLoading ? "..." : (
        <div className="flex items-center gap-1">
          <span className="text-gray-600 text-xs font-bold uppercase">
            Kotor: {formatIDR(incomeData?.gross_revenue ?? 0)}
          </span>
          {(incomeData?.gross_revenue ?? 0) > (incomeData?.paid_revenue ?? 0) * 1.1 && (
            <div className="size-1.5 rounded-full bg-warning-500 animate-pulse" title="Gap Pendapatan Signifikan"></div>
          )}
        </div>
      ),
      icon: <DollarLineIcon className="text-orange-500 size-6" />,
      badge: { color: "success", label: "KEUANGAN" },
      trend: "custom",
    },
    {
      title: "TOTAL TRANSAKSI",
      value: summaryLoading ? "..." : summaryError ? "Error" : (summaryData?.transactions_total ?? 0).toLocaleString(),
      change: summaryLoading ? "Memuat..." : (
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold uppercase">
          <span className="text-success-700">Terbayar: {summaryData?.transactions_paid ?? 0}</span>
          <span className="text-warning-700">Menunggu: {summaryData?.transactions_pending ?? 0}</span>
          <span className="text-error-700">Gagal: {summaryData?.transactions_failed ?? 0}</span>
        </div>
      ),
      icon: <PieChartIcon className="text-blue-500 size-6" />,
      badge: { color: "warning", label: "OPERASIONAL" },
      trend: "custom",
    },
    {
      title: "PERINGATAN STOK MENIPIS",
      value: invLoading ? "..." : invError ? "Error" : `${invData?.low_stock_products ?? 0} SKU`,
      change: (invData?.low_stock_products ?? 0) > 0 ? "Perlu Perhatian" : "Stok Aman",
      icon: <AlertIcon className="text-error-500 size-6" />,
      badge: { color: "error", label: "INVENTARIS" },
      trend: (invData?.low_stock_products ?? 0) > 0 ? "down" : "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              {metric.icon}
            </div>
            <Badge color={metric.badge.color as any} variant="light" size="sm">
              {metric.badge.label}
            </Badge>
          </div>

          <div className="mt-5">
            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
              {metric.title}
            </span>
            <h4 className="mt-1 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metric.value}
            </h4>

            <div className="flex items-center gap-1 mt-3">
              {metric.trend === "up" && (
                <span className="flex items-center text-success-500 text-xs font-medium">
                  <ArrowUpIcon className="size-4" />
                  {metric.change}
                </span>
              )}
              {metric.trend === "down" && (
                <span className="flex items-center text-error-500 text-xs font-medium">
                  <ArrowDownIcon className="size-4" />
                  {metric.change}
                </span>
              )}
              {metric.trend === "neutral" && (
                <span className="flex items-center text-gray-500 text-xs font-medium dark:text-gray-400">
                  {metric.change}
                </span>
              )}
              {metric.trend === "custom" && metric.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
