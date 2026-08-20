import { useMutation, useQuery } from "@tanstack/react-query";
import { downloadSalesByLocationExcel, getSalesByLocationReport } from "../api/reports";
import { SalesReportFilters, SalesReportResponse } from "../types/reports";
import toast from "react-hot-toast";

export function useSalesByLocationReport(
  filters: SalesReportFilters,
  enabled: boolean = true
) {
  return useQuery<SalesReportResponse, Error>({
    queryKey: ["sales-by-location-report", filters],
    queryFn: () => getSalesByLocationReport(filters),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute cache
  });
}

export function useExportSalesByLocation() {
  return useMutation({
    mutationFn: (filters: SalesReportFilters) => downloadSalesByLocationExcel(filters),
    onSuccess: () => {
      toast.success("Laporan berhasil diekspor ke Excel");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Gagal mengekspor laporan ke Excel";
      toast.error(message);
    },
  });
}
