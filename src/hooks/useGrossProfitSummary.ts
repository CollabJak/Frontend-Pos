import { useQuery } from "@tanstack/react-query";
import { fetchGrossProfitSummary } from "../services/api/dashboardService";

export const useGrossProfitSummary = (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: ["gross-profit-summary", params],
    queryFn: () => fetchGrossProfitSummary(params),
    placeholderData: (previousData) => previousData,
  });
};
