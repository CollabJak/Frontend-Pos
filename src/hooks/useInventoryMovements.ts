import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { fetchInventoryMovements } from "../services/api/inventoryService";
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
    queryFn: () =>
      fetchInventoryMovements({
        page,
        product,
        locationId,
        dateFrom,
        dateTo,
        movementType,
      }),
    placeholderData: (previousData) => previousData,
  });
};
