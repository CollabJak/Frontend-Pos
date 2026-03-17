import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { InventoryListItem, PaginatedApiResponse } from "../types/types";

interface UseInventoryListParams {
  page?: number;
  search?: string;
  locationId?: number | null;
}

export const useInventoryList = ({
  page = 1,
  search,
  locationId,
}: UseInventoryListParams) => {
  return useQuery<PaginatedApiResponse<InventoryListItem>, AxiosError>({
    queryKey: ["inventory", page, search ?? "", locationId ?? null],
    queryFn: async () => {
      const response = await apiClient.get("/inventory", {
        params: {
          page,
          ...(search ? { search } : {}),
          ...(locationId ? { location_id: locationId } : {}),
        },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};
