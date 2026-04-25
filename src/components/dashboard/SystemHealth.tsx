import { DollarLineIcon, ListIcon, BoltIcon, AlertIcon, ErrorIcon } from "../../icons";
import { useSystemHealth } from "../../hooks/useSystemHealth";
import { useAuth } from "../../hooks/useAuth";

const SystemHealth: React.FC = () => {
  const { user } = useAuth();
  const { data: healthResponse, isLoading, isError } = useSystemHealth();
  const healthData = healthResponse?.data;

  const isAdmin = user?.roles?.includes("admin") || false;

  if (!isAdmin) {
    return null;
  }

  const healthItems = [
    { 
      title: "PAYMENTS", 
      value: isLoading ? "..." : isError ? "Error" : `${healthData?.failed_payments_count ?? 0}`, 
      desc: "Failed Transactions", 
      icon: <DollarLineIcon className={`size-5 ${(healthData?.failed_payments_count ?? 0) > 0 ? "text-error-500" : "text-success-500"}`} />, 
      color: (healthData?.failed_payments_count ?? 0) > 0 ? "border-red-500" : "border-success-500" 
    },
    { 
      title: "QUEUE", 
      value: isLoading ? "..." : isError ? "Error" : `${(healthData?.pending_jobs_count ?? 0) + (healthData?.failed_jobs_count ?? 0)}`, 
      desc: `${healthData?.failed_jobs_count ?? 0} Failed Jobs`, 
      icon: <ListIcon className="text-gray-600 size-5" />, 
      color: (healthData?.failed_jobs_count ?? 0) > 0 ? "border-red-500" : "border-gray-800" 
    },
    { 
      title: "WEBHOOKS", 
      value: isLoading ? "..." : isError ? "Error" : `${healthData?.unprocessed_payment_events_count ?? 0}`, 
      desc: "Unprocessed Events", 
      icon: <BoltIcon className={`size-5 ${(healthData?.unprocessed_payment_events_count ?? 0) > 0 ? "text-orange-500" : "text-success-500"}`} />, 
      color: (healthData?.unprocessed_payment_events_count ?? 0) > 0 ? "border-orange-500" : "border-success-500" 
    },
    { 
      title: "INVENTORY", 
      value: isLoading ? "..." : isError ? "Error" : `${healthData?.negative_stock_count ?? 0}`, 
      desc: "Negative Stock Detected", 
      icon: <AlertIcon className={`size-5 ${(healthData?.negative_stock_count ?? 0) > 0 ? "text-error-500" : "text-success-500"}`} />, 
      color: (healthData?.negative_stock_count ?? 0) > 0 ? "border-red-500" : "border-success-500" 
    },
  ];

  const hasCriticalIssue = (healthData?.failed_payments_count ?? 0) > 0 || (healthData?.failed_jobs_count ?? 0) > 0 || (healthData?.negative_stock_count ?? 0) > 0;

  return (
    <div className={`rounded-2xl border p-5 md:p-8 transition-colors ${hasCriticalIssue ? "border-red-200 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/5" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"}`}>
      <div className="flex items-start gap-4 mb-8">
        <div className={`flex items-center justify-center size-12 rounded-xl shadow-lg ${hasCriticalIssue ? "bg-red-600" : "bg-brand-600"}`}>
          <ErrorIcon className="text-white size-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Critical Issues & System Health
          </h3>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${hasCriticalIssue ? "text-red-600" : "text-brand-600"}`}>
            {hasCriticalIssue ? "Active Operational Blocks Requiring Immediate Resolution" : "System Running Optimally - No Critical Issues"}
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
