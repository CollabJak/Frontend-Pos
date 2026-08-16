import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { fetchInventoryList } from "../services/api/inventoryService";
import { InventoryListItem, PaginatedApiResponse } from "../types/types";

interface UseInventoryListParams {
  page?: number;
  search?: string;
  locationId?: number | null;
  locationType?: string | null;
}

export const useInventoryList = ({
  page = 1,
  search,
  locationId,
  locationType,
}: UseInventoryListParams) => {
  return useQuery<PaginatedApiResponse<InventoryListItem>, AxiosError>({
    queryKey: ["inventory", page, search ?? "", locationId ?? null, locationType ?? null],
    queryFn: () => fetchInventoryList({ page, search, locationId, locationType }),
    placeholderData: (previousData) => previousData,
  });
};
