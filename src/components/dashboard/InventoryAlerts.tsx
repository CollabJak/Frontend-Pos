import React from "react";
import { AlertIcon, TimeIcon, BoltIcon } from "../../icons";
import { useInventoryAlerts } from "../../hooks/useInventoryAlerts";

const InventoryAlerts: React.FC = () => {
  const { data: alertsResponse, isLoading, isError } = useInventoryAlerts();
  const alertsData = alertsResponse?.data;

  const getIdleDays = (lastMovement: string | null) => {
    if (!lastMovement) return "Stok Lama";
    const last = new Date(lastMovement);
    const now = new Date();
    const diff = now.getTime() - last.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} Hari Mengendap`;
  };

  const getExpText = (date: string) => {
    const exp = new Date(date);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "KADALUARSA";
    if (days === 0) return "KADALUARSA HARI INI";
    return `KADALUARSA DALAM ${days} HARI (${new Intl.DateTimeFormat("id-ID", { month: "short", day: "numeric" }).format(exp).toUpperCase()})`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-error-50 dark:bg-error-500/5 rounded-2xl border border-error-100 dark:border-error-900/20 text-xs text-error-600 font-bold">
        Gagal memuat peringatan inventaris.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Low Stock Alert */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center size-8 bg-error-50 rounded-lg dark:bg-error-500/10">
            <AlertIcon className="text-error-600 size-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">
            Peringatan Stok Menipis
          </h3>
        </div>

        <div className="space-y-4">
          {alertsData?.low_stock_items.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Tidak ada item stok menipis.</p>
          ) : (
            alertsData?.low_stock_items.map((item, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-white rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center">
                    <div className="size-6 bg-orange-100 rounded-sm dark:bg-orange-900/30"></div>
                  </div>
                  <div className="max-w-[120px]">
                    <p className="text-xs font-bold text-gray-800 dark:text-white/90 truncate" title={item.name}>{item.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Batas: {item.min_stock}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-error-600">{item.available} Tersisa</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase">
                    {item.available <= 0 ? "STOK HABIS" : "ISI ULANG"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dead Stock */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center size-8 bg-gray-100 rounded-lg dark:bg-gray-800">
            <TimeIcon className="text-gray-600 size-5 dark:text-gray-400" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">
            Stok Mati / Mengendap (30 Hari+)
          </h3>
        </div>

        <div className="space-y-3">
          {alertsData?.dead_stock_items.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Pergerakan stok lancar dan sehat.</p>
          ) : (
            alertsData?.dead_stock_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate max-w-[140px]" title={item.name}>
                  {item.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md dark:bg-gray-800 dark:text-gray-400 shrink-0">
                  {getIdleDays(item.last_movement)}
                </span>
              </div>
            ))
          )}
        </div>

        {alertsData?.dead_stock_items.length ? (
          <button className="mt-6 w-full py-2.5 border border-gray-100 rounded-xl text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-white/5">
            Jalankan Wawasan Promosi
          </button>
        ) : null}
      </div>

      {/* Expiring Batches */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center size-8 bg-warning-50 rounded-lg dark:bg-warning-500/10">
            <BoltIcon className="text-warning-600 size-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white/90 uppercase tracking-wider">
            Batch Mendekati Kadaluarsa
          </h3>
        </div>

        <div className="space-y-5">
          {alertsData?.expiring_batch_items.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Tidak ada batch mendekati kadaluarsa.</p>
          ) : (
            alertsData?.expiring_batch_items.map((item, i) => {
              const expDate = new Date(item.expiry_date);
              const diff = expDate.getTime() - new Date().getTime();
              const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
              const color = days <= 7 ? "bg-error-500" : "bg-warning-500";
              
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-1.5 size-2 rounded-full shrink-0 ${color}`}></div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-white/90">
                      {item.product_name} <span className="font-medium text-gray-400">({item.batch_number})</span>
                    </p>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase mt-1">
                      {getExpText(item.expiry_date)} • {item.remaining_qty} Qty
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryAlerts;
