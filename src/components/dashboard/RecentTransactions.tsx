import React, { useState } from "react";
import { Link } from "react-router";
import Badge from "../ui/badge/Badge";
import { ChevronDownIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useRecentTransactions } from "../../hooks/useRecentTransactions";
import { useFetchLocations } from "../../hooks/useLocations";
import { formatTransactionDate } from "../../utils/formatDate";

const RecentTransactions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({ id: "", name: "ALL LOCATIONS" });

  const { data: transactionData, isLoading, isError, refetch } = useRecentTransactions({
    location_id: selectedLocation.id,
    per_page: 15
  });

  const { data: locationData } = useFetchLocations({ page: 1 });

  const transactions = transactionData?.data?.data || [];
  const locations = [
    { id: "", name: "SEMUA LOKASI" },
    ...(locationData?.data?.map(loc => ({ id: String(loc.id), name: loc.name })) || [])
  ];
  const viewAllPath = selectedLocation.id
    ? `/dashboard/recent-transactions?location_id=${encodeURIComponent(String(selectedLocation.id))}`
    : "/dashboard/recent-transactions";

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(parseFloat(value));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
      case "success":
        return "success";
      case "pending":
      case "unpaid":
      case "draft":
        return "warning";
      case "failed":
      case "cancelled":
      case "expired":
        return "error";
      default:
        return "light";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Transaksi Terbaru
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Memantau aktivitas terbaru di semua saluran
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="dropdown-toggle flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-white/90 hover:text-brand-500 transition-colors uppercase"
          >
            <span className="text-xs font-medium text-gray-400 uppercase">Filter berdasarkan</span>
            {selectedLocation.name}
            <ChevronDownIcon className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <Dropdown
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            className="w-48 p-2 mt-2"
          >
            {locations.map((loc) => (
              <DropdownItem
                key={loc.id || 'all'}
                onItemClick={() => {
                  setSelectedLocation(loc);
                  setIsOpen(false);
                }}
                className={`flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 ${selectedLocation.id === loc.id ? "bg-gray-50 text-brand-500 dark:bg-white/5" : ""
                  }`}
              >
                {loc.name}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Tanggal/Waktu</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4 whitespace-nowrap">Bisnis</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4 whitespace-nowrap">No. Faktur</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4 whitespace-nowrap">Lokasi</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4 whitespace-nowrap">Item</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase pl-4 whitespace-nowrap">Total Jumlah</th>
              <th className="pb-4 text-xs font-bold text-gray-500 uppercase text-right whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-500">Memuat transaksi...</td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-red-500">
                  <div className="flex flex-col items-center gap-3">
                    <span>Gagal memuat transaksi</span>
                    <button
                      onClick={() => refetch()}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 uppercase tracking-wide dark:text-brand-400"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-500">Tidak ada transaksi terbaru ditemukan</td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {formatTransactionDate(txn.datetime)}
                  </td>
                  <td className="py-4 text-xs font-medium text-gray-600 dark:text-gray-400 pl-4 whitespace-nowrap">{txn.business_name}</td>
                  <td className="py-4 text-xs font-bold text-brand-600 dark:text-brand-400 pl-4 whitespace-nowrap">{txn.invoice}</td>
                  <td className="py-4 text-xs font-medium text-gray-600 dark:text-gray-400 pl-4 whitespace-nowrap">{txn.location_name}</td>
                  <td className="py-4 text-xs font-medium text-gray-600 dark:text-gray-400 pl-4 whitespace-nowrap">{txn.items_count} unit</td>
                  <td className="py-4 text-xs font-bold text-gray-800 dark:text-white/90 pl-4 whitespace-nowrap">{formatCurrency(txn.total_amount)}</td>
                  <td className="py-4 text-right whitespace-nowrap">
                    <Badge color={getStatusColor(txn.order_status)} variant="solid" size="sm">
                      {txn.order_status.toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          to={viewAllPath}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 uppercase tracking-wider dark:text-brand-400"
        >
          Lihat Semua Transaksi
        </Link>
      </div>
    </div>
  );
};

export default RecentTransactions;
