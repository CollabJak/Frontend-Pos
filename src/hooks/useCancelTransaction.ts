import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { cancelTransaction } from "../services/api/transactionService";
import type { ApiErrorResponse, ApiResponse } from "../types/api";
import type { Transaction } from "../types/dashboard";

export const useCancelTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<Transaction>,
    AxiosError<ApiErrorResponse>,
    { orderId: number; reason: string }
  >({
    mutationFn: ({ orderId, reason }) => cancelTransaction(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      toast.success("Transaksi berhasil dibatalkan");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Gagal membatalkan transaksi";
      toast.error(message);
    },
  });
};
