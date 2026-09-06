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

export type { RecentTransactionsResponse };
