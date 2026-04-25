import { useQuery } from "@tanstack/react-query";
import { fetchIncomeSummary } from "../services/api/dashboardService";

export const useIncomeSummary = (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
}) => {
  return useQuery({
    queryKey: ["income-summary", params],
    queryFn: () => fetchIncomeSummary(params),
    placeholderData: (previousData) => previousData,
  });
};
