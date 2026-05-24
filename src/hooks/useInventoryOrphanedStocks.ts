import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { fetchOrphanedStocks } from "../services/api/inventoryService";
import { InventoryListItem, PaginatedApiResponse } from "../types/types";

interface UseInventoryOrphanedStocksParams {
  page?: number;
  search?: string;
  locationId?: number | null;
}

export const useInventoryOrphanedStocks = ({
  page = 1,
  search,
  locationId,
}: UseInventoryOrphanedStocksParams) => {
  return useQuery<PaginatedApiResponse<InventoryListItem>, AxiosError>({
    queryKey: ["inventoryOrphanedStocks", page, search ?? "", locationId ?? null],
    queryFn: () => fetchOrphanedStocks({ page, search, locationId }),
    placeholderData: (previousData) => previousData,
  });
};
