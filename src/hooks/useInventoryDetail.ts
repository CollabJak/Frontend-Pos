import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { fetchInventoryDetail } from "../services/api/inventoryService";
import { InventoryDetail } from "../types/types";

export const useInventoryDetail = (variantId: number) => {
  return useQuery<InventoryDetail, AxiosError>({
    queryKey: ["inventory-detail", variantId],
    queryFn: () => fetchInventoryDetail(variantId),
    enabled: variantId > 0,
  });
};
