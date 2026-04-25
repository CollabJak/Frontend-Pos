import { useQuery } from "@tanstack/react-query";
import { fetchSalesTrend } from "../services/api/dashboardService";

export const useSalesTrend = (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
  granularity?: string;
  timezone?: string;
}) => {
  return useQuery({
    queryKey: ["sales-trend", params],
    queryFn: () => fetchSalesTrend(params),
    placeholderData: (previousData) => previousData,
  });
};
