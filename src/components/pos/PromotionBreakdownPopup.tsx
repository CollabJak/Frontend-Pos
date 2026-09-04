import { useEffect, useRef, useState } from "react";

export interface PromotionBreakdownPopupRow {
  promotion_id: number;
  promotion_name: string;
  amount: number;
}

interface PromotionBreakdownPopupProps {
  /** Label baris ringkasan, mis. "Diskon" atau "Cashback". */
  label: string;
  rows: PromotionBreakdownPopupRow[];
  /** Catatan kecil di footer popup (mis. cashback tidak mengurangi total). */
  footnote?: string;
  /** "panel" = PaymentPanel kasir, "summary" = ringkasan halaman pembayaran. */
  variant?: "panel" | "summary";
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(value)
    .replace("Rp", "Rp.");

/**
 * Label baris ringkasan + icon info circle (FR-7 BRD v1.4).
 * Klik / hover icon -> popup rincian sumber (nama promo + nominal).
 */
export default function PromotionBreakdownPopup({
  label,
  rows,
  footnote,
  variant = "panel",
}: PromotionBreakdownPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const labelTextClass =
    variant === "summary"
      ? "text-[11px] font-medium text-slate-700 dark:text-slate-300"
      : "text-sm font-medium";

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <span className={labelTextClass}>{label}</span>

      <button
        type="button"
        aria-label={`Lihat rincian ${label.toLowerCase()}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-current text-[9px] font-black leading-none opacity-70 transition-opacity hover:opacity-100"
      >
        i
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-2 text-xs font-bold text-gray-700 dark:text-gray-200">
            Rincian {label}
          </p>

          {rows.length === 0 ? (
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Tidak ada promosi aktif.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {rows.map((row) => (
                <li
                  key={row.promotion_id}
                  className="flex items-start justify-between gap-3 text-[11px]"
                >
                  <span className="text-gray-500 dark:text-gray-400">{row.promotion_name}</span>
                  <span className="whitespace-nowrap font-semibold text-gray-800 dark:text-gray-100">
                    {formatCurrency(row.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {footnote && (
            <p className="mt-2 border-t border-gray-100 pt-2 text-[10px] italic text-gray-400 dark:border-gray-700 dark:text-gray-500">
              {footnote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
