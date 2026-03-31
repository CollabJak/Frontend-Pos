import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { fetchInventoryBatches } from "../services/api/inventoryService";
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
    queryFn: () => fetchInventoryBatches({ variantId, page }),
    enabled: enabled && variantId > 0,
    placeholderData: (previousData) => previousData,
  });
};
