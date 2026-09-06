import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/axiosConfig";
import { useAuth } from "./useAuth";
import { SubscriptionStatusData, SubscriptionStatus } from "../types/types";

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  
  const isAdmin = user?.roles?.includes("admin");
  const canCheckSubscription = !!user && !isAdmin && !!user.business_id;

  const query = useQuery<SubscriptionStatusData>({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const response = await apiClient.get("/billing/subscription-status");
      return response.data.data;
    },
    enabled: canCheckSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isAdmin) {
    return {
      hasActiveSubscription: true,
      subscriptionStatus: "active" as SubscriptionStatus,
      endsAt: null,
      daysLeft: null,
      isLoading: false,
    };
  }

  return {
    hasActiveSubscription: query.data?.has_active_subscription ?? false,
    subscriptionStatus: (query.data?.status ?? "none") as SubscriptionStatus,
    endsAt: query.data?.end_date ?? null,
    daysLeft: query.data?.days_left ?? null,
    isLoading: query.isLoading,
  };
};

