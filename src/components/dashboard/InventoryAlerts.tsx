import React from "react";
import { AlertIcon, TimeIcon, BoltIcon } from "../../icons";

const InventoryAlerts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Low Stock Alert */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center size-8 bg-error-50 rounded-lg dark:bg-error-500/10">
            <AlertIcon className="text-error-600 size-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">
            Low Stock Alert
          </h3>
        </div>

        <div className="space-y-4">
          {[
            { name: "Premium Coffee Beans", desc: "Main Roastery Stock", stock: "2 Left", status: "RESTOCK REQUIRED" },
            { name: "Oat Milk 1L", desc: "Dairy Alternatives", stock: "5 Left", status: "LOW LIMIT" }
          ].map((item, i) => (
            <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center">
                  <div className="size-6 bg-orange-100 rounded-sm dark:bg-orange-900/30"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-white/90">{item.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-error-600">{item.stock}</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dead Stock */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center size-8 bg-gray-100 rounded-lg dark:bg-gray-800">
            <TimeIcon className="text-gray-600 size-5 dark:text-gray-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">
            Dead Stock (30D+)
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { name: "Matcha Powder 500g", idle: "45 Days Idle" },
            { name: "Hibiscus Tea Bags", idle: "38 Days Idle" },
            { name: "Limited Edition Mugs", idle: "32 Days Idle" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
              <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md dark:bg-gray-800 dark:text-gray-400">
                {item.idle}
              </span>
            </div>
          ))}
        </div>

        <button className="mt-6 w-full py-2.5 border border-gray-100 rounded-xl text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-white/5">
          Run Promotion Insight
        </button>
      </div>

      {/* Expiring Batches */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center size-8 bg-warning-50 rounded-lg dark:bg-warning-500/10">
            <BoltIcon className="text-warning-600 size-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">
            Expiring Batches
          </h3>
        </div>

        <div className="space-y-5">
          {[
            { name: "Fresh Cream (Batch #204)", exp: "EXPIRES IN 2 DAYS (OCT 26)", color: "bg-error-500" },
            { name: "Sandwich Wrap Breeds", exp: "EXPIRES IN 5 DAYS (OCT 29)", color: "bg-warning-500" }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`mt-1.5 size-2 rounded-full ${item.color}`}></div>
              <div>
                <p className="text-xs font-bold text-gray-800 dark:text-white/90">{item.name}</p>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase mt-1">{item.exp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryAlerts;
