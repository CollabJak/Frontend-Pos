import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { InventoryMovementItem, PaginatedApiResponse } from "../types/types";

interface UseInventoryMovementsParams {
  page?: number;
  product?: string;
  locationId?: number | null;
  dateFrom?: string;
  dateTo?: string;
  movementType?: string;
}

export const useInventoryMovements = ({
  page = 1,
  product,
  locationId,
  dateFrom,
  dateTo,
  movementType,
}: UseInventoryMovementsParams) => {
  return useQuery<PaginatedApiResponse<InventoryMovementItem>, AxiosError>({
    queryKey: [
      "inventory-movements",
      page,
      product ?? "",
      locationId ?? null,
      dateFrom ?? "",
      dateTo ?? "",
      movementType ?? "",
    ],
    queryFn: async () => {
      const response = await apiClient.get("/inventory/movements", {
        params: {
          page,
          ...(product ? { product } : {}),
          ...(locationId ? { location_id: locationId } : {}),
          ...(dateFrom ? { date_from: dateFrom } : {}),
          ...(dateTo ? { date_to: dateTo } : {}),
          ...(movementType ? { movement_type: movementType } : {}),
        },
      });

      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
  });
};
