import { useQuery } from "@tanstack/react-query";
import { fetchSystemHealth } from "../services/api/dashboardService";

export const useSystemHealth = (params?: {
  location_id?: string | number;
  timezone?: string;
}) => {
  return useQuery({
    queryKey: ["system-health", params],
    queryFn: () => fetchSystemHealth(params),
    placeholderData: (previousData) => previousData,
    refetchInterval: 60000, // Refetch every 1 minute for health check
  });
};
