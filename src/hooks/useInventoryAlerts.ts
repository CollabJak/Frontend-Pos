import { useQuery } from "@tanstack/react-query";
import { fetchInventoryAlerts } from "../services/api/dashboardService";

export const useInventoryAlerts = (params?: {
  location_id?: string | number;
}) => {
  return useQuery({
    queryKey: ["inventory-alerts", params],
    queryFn: () => fetchInventoryAlerts(params),
    placeholderData: (previousData) => previousData,
  });
};
