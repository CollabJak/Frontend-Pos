import PageMeta from "../../components/common/PageMeta";
import MetricCards from "../../components/dashboard/MetricCards";
import TransactionStatusDetails from "../../components/dashboard/TransactionStatusDetails";
import GrossProfitDetails from "../../components/dashboard/GrossProfitDetails";
import SalesTrendChart from "../../components/dashboard/SalesTrendChart";
import TopProducts from "../../components/dashboard/TopProducts";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import InventoryAlerts from "../../components/dashboard/InventoryAlerts";
import SystemHealth from "../../components/dashboard/SystemHealth";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard | The Architectural Intelligence"
        description="Comprehensive overview of POS performance and health"
      />

      <div className="space-y-6">
        {/* Metric Cards Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              The Architectural Intelligence
            </h1>
          </div>
          <MetricCards />
          <GrossProfitDetails />
          <TransactionStatusDetails />
        </section>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8">
            <SalesTrendChart />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <TopProducts />
          </div>
        </div>

        {/* Recent Transactions Section */}
        <section>
          <RecentTransactions />
        </section>

        {/* Inventory Alerts Section */}
        <section>
          <InventoryAlerts />
        </section>

        {/* System Health Section */}
        <section>
          <SystemHealth />
        </section>
      </div>
    </>
  );
}
