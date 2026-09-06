import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchRecentTransactions } from "../services/api/dashboardService";
import {
  downloadTransactionsExcel,
  TransactionExportParams,
} from "../services/api/transactionService";
import toast from "react-hot-toast";

export const useRecentTransactions = (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["recent-transactions", params],
    queryFn: () => fetchRecentTransactions(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useExportTransactions = () => {
  return useMutation<void, Error, TransactionExportParams>({
    mutationFn: (params: TransactionExportParams) =>
      downloadTransactionsExcel(params),
    onSuccess: () => {
      toast.success("Riwayat transaksi berhasil diekspor ke Excel");
    },
    onError: (error: Error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal mengekspor riwayat transaksi ke Excel";
      toast.error(message);
    },
  });
};
