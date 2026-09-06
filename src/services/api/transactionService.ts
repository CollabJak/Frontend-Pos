import apiClient from "../../api/axiosConfig";
import type { ApiResponse } from "../../types/api";
import type { RecentTransactionsResponse, Transaction } from "../../types/dashboard";
import type { TransactionDetailResponse } from "../../types/transaction";

export const cancelTransaction = async (
  orderId: number,
  reason: string
): Promise<ApiResponse<Transaction>> => {
  const response = await apiClient.post<ApiResponse<Transaction>>(
    `/transactions/${orderId}/cancel`,
    { reason }
  );
  return response.data;
};

export const fetchTransactionDetail = async (
  transactionId: number
): Promise<TransactionDetailResponse> => {
  const response = await apiClient.get<TransactionDetailResponse>(
    `/transactions/${transactionId}`
  );
  return response.data;
};

export interface TransactionExportParams {
  location_id?: string | number;
  from?: string;
  to?: string;
  search?: string;
}

export const downloadTransactionsExcel = async (
  params: TransactionExportParams
): Promise<void> => {
  const queryParams: Record<string, string | number> = {};

  if (params.location_id !== undefined && params.location_id !== "") {
    queryParams.location_id = params.location_id;
  }

  if (params.from) {
    queryParams.from = params.from;
  }

  if (params.to) {
    queryParams.to = params.to;
  }

  if (params.search && params.search.trim() !== "") {
    queryParams.search = params.search.trim();
  }

  const response = await apiClient.get("/transactions/export", {
    params: queryParams,
    responseType: "blob",
  });

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const from = params.from ?? "all";
  const to = params.to ?? "all";
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `riwayat_transaksi_${from}_sd_${to}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

export type { RecentTransactionsResponse };
