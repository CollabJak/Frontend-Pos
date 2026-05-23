/**
 * Format number to Indonesian Rupiah currency string.
 * Single source of truth — replaces formatIDR, formatRp duplicates.
 */
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
