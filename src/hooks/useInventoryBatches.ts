import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { InventoryBatch, PaginatedApiResponse } from "../types/types";

interface UseInventoryBatchesParams {
  variantId: number;
  page?: number;
  enabled?: boolean;
}

export const useInventoryBatches = ({
  variantId,
  page = 1,
  enabled = true,
}: UseInventoryBatchesParams) => {
  return useQuery<PaginatedApiResponse<InventoryBatch>, AxiosError>({
    queryKey: ["inventory-batches", variantId, page],
    queryFn: async () => {
      const response = await apiClient.get(`/inventory/${variantId}/batches`, {
        params: { page },
      });

      return response.data.data;
    },
    enabled: enabled && variantId > 0,
    placeholderData: (previousData) => previousData,
  });
};
