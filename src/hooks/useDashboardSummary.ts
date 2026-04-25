import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "../services/api/dashboardService";

export const useDashboardSummary = (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: ["dashboard-summary", params],
    queryFn: () => fetchDashboardSummary(params),
    placeholderData: (previousData) => previousData,
  });
};
