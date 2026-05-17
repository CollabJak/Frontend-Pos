import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import schedulingService from "../../services/api/schedulingService";
import {
  EmergencyOverridePayload,
  OvertimeOverridePayload,
  RescheduleOverridePayload,
  SwapOverridePayload,
} from "../../types/scheduling";
import { schedulingKeys } from "./queryKeys";

const invalidateScheduling = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: schedulingKeys.calendar });
  queryClient.invalidateQueries({ queryKey: schedulingKeys.batches });
  queryClient.invalidateQueries({ queryKey: ["schedule"] });
  queryClient.invalidateQueries({ queryKey: ["schedule-audit"] });
};

export const useRescheduleOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RescheduleOverridePayload) => schedulingService.rescheduleOverride(data),
    onSuccess: () => invalidateScheduling(queryClient),
  });
};

export const useEmergencyOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmergencyOverridePayload) => schedulingService.emergencyOverride(data),
    onSuccess: () => invalidateScheduling(queryClient),
  });
};

export const useSwapOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SwapOverridePayload) => schedulingService.swapOverride(data),
    onSuccess: () => invalidateScheduling(queryClient),
  });
};

export const useOvertimeOverride = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OvertimeOverridePayload) => schedulingService.overtimeOverride(data),
    onSuccess: () => invalidateScheduling(queryClient),
  });
};

export const usePublishedScheduleLookup = (
  userId: number | null,
  date: string | null,
  enabled: boolean
) => {
  return useQuery({
    queryKey: schedulingKeys.publishedLookup(userId, date),
    enabled: enabled && !!userId && !!date,
    queryFn: async () => {
      const response = await schedulingService.getSchedules({
        user_id: userId,
        start_date: date,
        end_date: date,
        status: "published",
        per_page: 1,
      });

      return response?.data?.[0] ?? null;
    },
  });
};
