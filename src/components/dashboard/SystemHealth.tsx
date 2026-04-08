import React from "react";
import { DollarLineIcon, ListIcon, BoltIcon, AlertIcon, ErrorIcon } from "../../icons";

const SystemHealth: React.FC = () => {
  const healthItems = [
    { title: "PAYMENTS", value: "2", desc: "Failed Transactions", icon: <DollarLineIcon className="text-error-500 size-5" />, color: "border-red-500" },
    { title: "QUEUE", value: "5", desc: "Pending Orders", icon: <ListIcon className="text-gray-600 size-5" />, color: "border-gray-800" },
    { title: "CLOUD SYNC", value: "1", desc: "Sync Error Detected", icon: <BoltIcon className="text-error-500 size-5" />, color: "border-red-500" },
    { title: "LOGIC ERROR", value: "Alert", desc: "Negative Stock Detected", icon: <AlertIcon className="text-error-500 size-5" />, color: "border-red-500" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-red-50/30 p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-8">
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center justify-center size-12 bg-red-600 rounded-xl shadow-lg">
          <ErrorIcon className="text-white size-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Critical Issues & System Health
          </h3>
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">
            Active Operational Blocks Requiring Immediate Resolution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthItems.map((item, index) => (
          <div key={index} className={`bg-white rounded-2xl p-5 border-l-4 ${item.color} shadow-sm dark:bg-gray-800/50`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.title}</span>
              <div className="size-5">
                {item.icon}
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">{item.value}</h4>
            <p className="text-[10px] font-medium text-gray-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;
