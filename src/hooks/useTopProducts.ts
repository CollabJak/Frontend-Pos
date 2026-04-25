import { useQuery } from "@tanstack/react-query";
import { fetchTopProducts } from "../services/api/dashboardService";

export const useTopProducts = (params?: {
  location_id?: string | number;
  from?: string;
  to?: string;
  basis?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["top-products", params],
    queryFn: () => fetchTopProducts(params),
    placeholderData: (previousData) => previousData,
  });
};
