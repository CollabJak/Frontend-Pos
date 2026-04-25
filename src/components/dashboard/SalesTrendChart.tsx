import React, { useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useSalesTrend } from "../../hooks/useSalesTrend";

const SalesTrendChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");

  const params = useMemo(() => {
    const to = new Date();
    const from = new Date();
    if (activeTab === 'weekly') {
      from.setDate(to.getDate() - 7);
    } else {
      from.setDate(to.getDate() - 30);
    }
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      granularity: 'daily',
      timezone: 'Asia/Jakarta'
    };
  }, [activeTab]);

  const { data: trendResponse, isLoading, isError } = useSalesTrend(params);
  const trendData = trendResponse?.data;

  const options: ApexOptions = {
    colors: ["#465fff", "#f97316"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 300,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      borderColor: "#f1f1f1",
    },
    xaxis: {
      categories: trendData?.labels || [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        rotate: -45,
        rotateAlways: false,
      },
    },
    yaxis: [
      {
        title: {
          text: "Revenue (IDR)",
          style: {
            color: "#465fff",
            fontSize: "12px",
          },
        },
        labels: {
          formatter: (val) => {
            if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}K`;
            return `Rp ${val}`;
          },
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Orders",
          style: {
            color: "#f97316",
            fontSize: "12px",
          },
        },
        labels: {
          style: {
            colors: "#6B7280",
            fontSize: "12px",
          },
        },
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val, { seriesIndex }) => {
          if (seriesIndex === 0) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
          }
          return `${val} orders`;
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    }
  };

  const series = trendData?.series || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'weekly' ? 'Revenue movement over the last 7 days' : 'Revenue movement over the last 30 days'}
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "weekly"
              ? "bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
          >
            WEEKLY
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "monthly"
              ? "bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
          >
            MONTHLY
          </button>
        </div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-gray-500">Loading chart data...</div>
        ) : isError ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-red-500">Failed to load chart data</div>
        ) : (
          <Chart options={options} series={series} type="line" height={300} />
        )}
      </div>
    </div>
  );
};

export default SalesTrendChart;
