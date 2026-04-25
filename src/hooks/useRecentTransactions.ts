import { useQuery } from "@tanstack/react-query";
import { fetchRecentTransactions } from "../services/api/dashboardService";

export const useRecentTransactions = (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}) => {
  return useQuery({
    queryKey: ["recent-transactions", params],
    queryFn: () => fetchRecentTransactions(params),
    placeholderData: (previousData) => previousData,
  });
};
