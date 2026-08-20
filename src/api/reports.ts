import apiClient from "./axiosConfig";
import { SalesReportFilters, SalesReportResponse } from "../types/reports";

export async function getSalesByLocationReport(
  filters: SalesReportFilters
): Promise<SalesReportResponse> {
  const params: Record<string, string | number> = {
    start_date: filters.start_date,
    end_date: filters.end_date,
  };

  if (filters.location_id) {
    params.location_id = filters.location_id;
  }

  if (filters.search && filters.search.trim() !== "") {
    params.search = filters.search.trim();
  }

  if (filters.page) {
    params.page = filters.page;
  }

  if (filters.per_page) {
    params.per_page = filters.per_page;
  }

  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: SalesReportResponse;
  }>("/reports/sales-by-location", { params });

  return response.data.data;
}

export async function downloadSalesByLocationExcel(
  filters: SalesReportFilters
): Promise<void> {
  const params: Record<string, string | number> = {
    start_date: filters.start_date,
    end_date: filters.end_date,
  };

  if (filters.location_id) {
    params.location_id = filters.location_id;
  }

  if (filters.search && filters.search.trim() !== "") {
    params.search = filters.search.trim();
  }

  const response = await apiClient.get("/reports/sales-by-location/export", {
    params,
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `laporan_penjualan_produk_${filters.start_date}_sd_${filters.end_date}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
