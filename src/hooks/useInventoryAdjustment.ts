import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { submitInventoryAdjustment } from "../services/api/inventoryService";
import { ApiErrorResponse, InventoryAdjustmentPayload } from "../types/types";

export const useInventoryAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError<ApiErrorResponse>, InventoryAdjustmentPayload>({
    mutationFn: (payload) => submitInventoryAdjustment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-detail"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
  });
};
