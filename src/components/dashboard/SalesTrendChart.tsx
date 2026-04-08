import React, { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const SalesTrendChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState("weekly");

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 300,
      toolbar: {
        show: true,
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
      categories: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
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
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      x: {
        show: false,
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: [30, 70, 45, 90, 50, 110, 80],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales Trend
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revenue movement over the last 7 days
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
        <Chart options={options} series={series} type="line" height={300} />
      </div>
    </div>
  );
};

export default SalesTrendChart;
