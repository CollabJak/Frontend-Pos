import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "../api/axiosConfig";
import { InventoryDetail } from "../types/types";

export const useInventoryDetail = (variantId: number) => {
  return useQuery<InventoryDetail, AxiosError>({
    queryKey: ["inventory-detail", variantId],
    queryFn: async () => {
      const response = await apiClient.get(`/inventory/${variantId}`);
      return response.data.data;
    },
    enabled: variantId > 0,
  });
};
