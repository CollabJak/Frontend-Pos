import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { ApiErrorResponse, InventoryAdjustmentPayload } from "../types/types";

export const useInventoryAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, InventoryAdjustmentPayload>({
    mutationFn: async (payload) => {
      const response = await apiClient.post("/inventory/adjustment", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-detail"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
  });
};
