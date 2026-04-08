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

const MetricCards: React.FC = () => {
  const metrics = [
    {
      title: "REVENUE TODAY",
      value: "IDR 12.5M",
      change: "+14.2% vs yesterday",
      icon: <DollarLineIcon className="text-brand-500 size-6" />,
      badge: { color: "success", label: "FINANCE" },
      trend: "up",
    },
    {
      title: "TRANSACTIONS",
      value: "45",
      change: "Updated 2 mins ago",
      icon: <BoxIconLine className="text-orange-500 size-6" />,
      badge: { color: "warning", label: "SALES" },
      trend: "neutral",
    },
    {
      title: "PROFIT",
      value: "IDR 3.2M",
      change: "25% Net Margin",
      icon: <PieChartIcon className="text-blue-500 size-6" />,
      badge: { color: "primary", label: "MARGIN" },
      trend: "neutral",
    },
    {
      title: "LOW STOCK ALERTS",
      value: "8 SKUs",
      change: "Needs attention",
      icon: <AlertIcon className="text-error-500 size-6" />,
      badge: { color: "error", label: "INVENTORY" },
      trend: "down",
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
