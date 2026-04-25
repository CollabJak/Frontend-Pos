import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { fetchInventorySummary } from "../services/api/inventoryService";
import { InventorySummary } from "../types/types";

export const useInventorySummary = () => {
  return useQuery<InventorySummary, AxiosError>({
    queryKey: ["inventory-summary"],
    queryFn: fetchInventorySummary,
  });
};
