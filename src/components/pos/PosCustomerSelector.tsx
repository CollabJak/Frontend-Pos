import React, { useState, useRef, useEffect } from "react";
import { useCustomerOptions } from "../../hooks/useCustomers";
import { usePosStore } from "../../stores/pos.store";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import QuickAddMemberModal from "./QuickAddMemberModal";
import type { Customer, CustomerOption } from "../../types/types";

export interface PosCustomerSelectorProps {
  className?: string;
}

export const PosCustomerSelector: React.FC<PosCustomerSelectorProps> = ({ className = "" }) => {
  const { selectedCustomer, setSelectedCustomer } = usePosStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const containerRef = useRef<HTMLDivElement>(null);

  const { data: customerOptions = [], isLoading } = useCustomerOptions(
    debouncedSearch || undefined
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCustomer = (option: CustomerOption) => {
    const customerObj: Customer = {
      id: option.id,
      business_id: 0,
      customer_group_id: option.customer_group_id,
      code: option.code,
      name: option.name,
      email: null,
      phone: option.phone,
      address: null,
      is_active: true,
      customer_group: option.customer_group,
    };
    setSelectedCustomer(customerObj);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearCustomer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(null);
  };

  const handleCustomerCreated = (newCustomer: Customer) => {
    setSelectedCustomer(newCustomer);
    setIsQuickAddOpen(false);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Customer State */}
      {selectedCustomer ? (
        <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/15 p-3 dark:border-brand-500/20 dark:bg-brand-500/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-sm shadow-xs">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-xs font-bold text-gray-900 dark:text-white">
                  {selectedCustomer.name}
                </span>
                {selectedCustomer.customer_group && (
                  <span className="inline-flex shrink-0 items-center rounded-md bg-brand-50/20 px-1.5 py-0.5 text-[10px] font-extrabold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                    {selectedCustomer.customer_group.name}
                    {selectedCustomer.customer_group.discount_percent > 0 &&
                      ` (${selectedCustomer.customer_group.discount_percent}%)`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                {selectedCustomer.code && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{selectedCustomer.code}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-600 hover:bg-brand-100/60 dark:text-brand-400 dark:hover:bg-brand-500/20 transition-colors"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleClearCustomer}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
              title="Batalkan pilihan member (kembali ke Pelanggan Umum)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Walk-in Customer (Default) State */
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-2.5 hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-brand-500/30 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 text-xs">
              👤
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Pelanggan Umum <span className="font-normal text-gray-400">(Non-Member)</span>
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                Klik untuk memilih atau mendaftarkan member
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickAddOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-brand-600 shadow-xs border border-gray-200 hover:bg-brand-50 hover:border-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
          >
            <span className="text-sm leading-none">+</span> Member
          </button>
        </div>
      )}

      {/* Dropdown Search & Options */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari Nama, No. HP, atau Kode Member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsQuickAddOpen(true);
              }}
              className="shrink-0 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-colors shadow-xs"
            >
              + Baru
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 custom-scrollbar">
            {isLoading ? (
              <p className="p-3 text-center text-xs text-gray-400">Mencari data member...</p>
            ) : customerOptions.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400">
                  {searchQuery ? `Tidak ada member cocok dengan "${searchQuery}"` : "Belum ada data member"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsQuickAddOpen(true);
                  }}
                  className="mt-2 text-xs font-bold text-brand-600 hover:underline dark:text-brand-400"
                >
                  + Daftarkan "{searchQuery}" Sebagai Member Baru
                </button>
              </div>
            ) : (
              customerOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelectCustomer(opt)}
                  className="group flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-brand-600 dark:hover:bg-brand-600"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-xs font-bold text-gray-800 transition-colors dark:text-white group-hover:text-white">
                      {opt.name}
                    </p>
                    <p className="text-[11px] text-gray-400 transition-colors dark:text-gray-400 group-hover:text-white/85">
                      {opt.phone || "-"} {opt.code && `• ${opt.code}`}
                    </p>
                  </div>
                  {opt.customer_group && (
                    <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-300 group-hover:bg-white group-hover:text-brand-700">
                      {opt.customer_group.name}
                      {opt.customer_group.discount_percent > 0 &&
                        ` (${opt.customer_group.discount_percent}%)`}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Add Member Modal */}
      <QuickAddMemberModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  );
};

export default PosCustomerSelector;
